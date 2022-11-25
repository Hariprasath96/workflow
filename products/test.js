const fs = require("fs");
const path = require("path");

const jsonsInDir = fs
  .readdirSync("./")
  .filter((file) => path.extname(file) === ".json");
let arr = [
    { name: 'repo 1', repoName: 'repo-1', version: 'v1.0.0' },
    { name: 'repo 2', repoName: 'repo-1', version: 'v1.0.0' },
    { name: 'repo 3', repoName: 'repo-3', version: 'v1.0.0' },
    { name: 'test 1', repoName: 'test-1', version: 'v1.0.0' },
    { name: 'test 2', repoName: 'test-2', version: 'v1.0.0' }
  ];

// const getFileData = () => {
jsonsInDir.forEach((file) => {
  const fileData = fs.readFileSync(path.join("./", file));
  const json = JSON.parse(fileData.toString());
  arr = [...arr, ...json];
});
console.log("🚀 ~ file: test.js ~ line 14 ~ jsonsInDir.forEach ~ arr", arr);
fs.writeFileSync("./contents.json", JSON.stringify(arr));
// };

// getFileData.then((data)=>{
//     console.log("🚀 ~ file: test.js ~ line 20 ~ jsonsInDir.forEach ~ arr", data)
//     return data;
// })

// const data = getFileData();
// console.log(data)
