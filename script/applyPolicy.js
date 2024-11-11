const fs = require("fs");
const yaml = require("js-yaml");
const axios = require('axios');
const xmlbuilder = require('xmlbuilder');
const config = require('config');

// configuration params
const resourceGroup = process.env.AZURE_RESOURCE_GROUP;
const serviceName = process.env.AZURE_SERVICE_NAME;
const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
const tenantId = process.env.AZURE_TENANT_ID;
const clientId = process.env.AZURE_CLIENT_ID;
const clientSecret = process.env.AZURE_CLIENT_SECRET;
const product = process.env.product;

const apimConfigs = config.get('apimConfigs');

const resource = 'https://management.azure.com/';
const openidUrl = 'openid-url';
const apiId = apimConfigs[product];

let accessToken;

// Path to your OpenAPI specification file
const filePath = `apis/${product}.yaml`;

// Load the OpenAPI specification
const swaggerApi = yaml.load(fs.readFileSync(filePath, "utf8"));

// get management access token
const getAccessToken = async () => {
  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('resource', resource);

  const response = await axios.post(tokenEndpoint, params);
  const accessToken = response.data.access_token;
  return accessToken;
};

// function to create policy XML
const createPolicy = (scopes) => {
  // create the root element 'policies'
  const root = xmlbuilder.create('policies');

  // add the 'inbound' section
  const inbound = root.ele('inbound');

  // add the 'validate-jwt' policy
  const validateJwt = inbound.ele('validate-jwt', {
    'header-name': 'Authorization',
    'failed-validation-httpcode': '401',
    'failed-validation-error-message': 'Unauthorized. Invalid scope.'
  });

  // get the 'openid-config' value from named-values
  validateJwt.ele('openid-config', { url: `{{${openidUrl}}}` }).up();

  // add the 'required-claims' section
  const requiredClaims = validateJwt.ele('required-claims');

  // add a 'claim' element for the 'scope' claim
  const claim = requiredClaims.ele('claim', {
    name: 'scope',
    match: 'any',
    separator: ' '
  });

  // add the required scopes as 'value' elements
  scopes.forEach((scope) => {
    claim.ele('value').text(scope);
  });

  inbound.ele('base'); // Include base policies if any

  // convert the XML object to a string
  const policyXml = root.end({ pretty: true });
  return policyXml;
};

// function to apply policy to an operation in APIM
const applyPolicy = async (operationId, policyXml, etag) => {
  try {
    const url = getManagementApi(operationId);
    const response = await axios.put(url, policyXml, {
      headers: {
        'Content-Type': 'application/vnd.ms-azure-apim.policy+xml',
        Authorization: `Bearer ${accessToken}`,
        'If-Match': etag
      }
    });
    return response.data;
  } catch (error) {
    console.log('applyPolicy ~ error:', error.response, operationId);
    throw error;
  }
};

// function to get the existing policy to an operation in APIM
const getPolicy = async (operationId) => {
  try {
    const url = getManagementApi(operationId);
    // retrieve the current policy and ETag
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    console.log('operationId:', operationId, '| currentPolicy status:', response.status);

    //to get the existing policy
    // const existingPolicyXml = response.data.properties.value;
    // console.log("existingPolicyXml:", existingPolicyXml)

    return { status: 200, data: response };
  } catch (error) {
    console.log('getPolicy ~ error:', error.data);
    return { status: 401, message: 'policies configuration not found.' };
  }
};

// function to construct the management api for the operation
const getManagementApi = (operationId) => {
  return `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ApiManagement/service/${serviceName}/apis/${apiId}/operations/${operationId}/policies/policy?api-version=2023-03-01-preview`;
};


const main = async () => {
  accessToken = await getAccessToken();
  // Iterate over each path and method in the OpenAPI spec
  Object.entries(swaggerApi.paths).forEach(([path, pathItem]) => {
    Object.entries(pathItem).forEach(async ([method, operation]) => {
      if (operation.security) {
        const security = operation.security[0];
        const securityProtocol = Object.keys(security)[0];
        var scopes = security[securityProtocol];
        if (scopes.length > 0) {
          const policyXml = createPolicy(scopes);
          const operationId = operation.operationId || `${method}-${path}`; // Use operationId
          console.log('operationId:', operationId, '| scopes: ', scopes);
          let etag = '*'; // Use '*' to ignore ETag if not present

          // get existing APIM Policy
          const getExistingPolicy = await getPolicy(operationId);
          if (getExistingPolicy.data) {
            etag = getExistingPolicy.data.headers['etag'];
          }

          // apply the policy using Azure CLI
          const configurePolicy = await applyPolicy(operationId, policyXml, etag);
          if (configurePolicy) {
            return console.log(`policy applied to operation ${operationId}`);
          }
          return console.error(`failed to apply policy to operation ${operationId}:`);
        }
      }
    });
  });
};

main();
