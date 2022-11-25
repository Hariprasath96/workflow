const fs = require("fs");
const path = require("path");

const jsonsInDir = fs
  .readdirSync("./")
  .filter((file) => path.extname(file) === ".json");
let arr = [];

// const getFileData = () => {
jsonsInDir.forEach((file) => {
  const fileData = fs.readFileSync(path.join("./", file));
  const json = JSON.parse(fileData.toString());
  arr = [...arr, ...json];
});
console.log("🚀 ~ file: test.js ~ line 14 ~ jsonsInDir.forEach ~ arr", arr);
return arr;
// };

// getFileData.then((data)=>{
//     console.log("🚀 ~ file: test.js ~ line 20 ~ jsonsInDir.forEach ~ arr", data)
//     return data;
// })

// const data = getFileData();
// console.log(data)
