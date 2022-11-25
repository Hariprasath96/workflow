/*
import fs from "fs-extra";
import { basename, extname, join } from "path";

const jsonsInDir = fs
  .readdirSync("~/products")
  .filter((file) => extname(file) === ".json");
let arr = [];

export const getFileData = () => {
  jsonsInDir.forEach((file) => {
    const fileData = fs.readFileSync(join("~/products/", file));

    const json = JSON.parse(fileData.toString());
    console.log(
      "🚀 ~ file: test.js ~ line 18 ~ jsonsInDir.forEach ~ json",
      json
    );
    arr = [...arr, ...json];
  });

  console.log("🚀 ~ file: test.js ~ line 14 ~ jsonsInDir.forEach ~ arr", arr);
  fs.writeFileSync("../products/contents.json", JSON.stringify(arr));
  return arr;
};

// getFileData.then((data)=>{
//     console.log("🚀 ~ file: test.js ~ line 20 ~ jsonsInDir.forEach ~ arr", data)
//     return data;
// })

// const data = getFileData();
// console.log(data)

*/

export default function printStuff() {
  console.log("stuff");
  return 'i am output'
}
