import fs from "fs-extra";
import { basename, extname, join, resolve } from "path";

let relativePath = '../products';
let absolutePath = resolve(relativePath);

const jsonsInDir = fs
  .readdirSync(absolutePath)
  .filter((file) => extname(file) === ".json");
let arr = [];

export const getFileData = () => {
  jsonsInDir.forEach((file) => {
    const fileData = fs.readFileSync(join(`${absolutePath}`, file));

    const json = JSON.parse(fileData.toString());
    console.log(
      "🚀 ~ file: test.js ~ line 18 ~ jsonsInDir.forEach ~ json",
      json
    );
    arr = [...arr, ...json];
  });

  console.log("🚀 ~ file: test.js ~ line 14 ~ jsonsInDir.forEach ~ arr", arr);
  const path = join(resolve('./','contents.json'));
  fs.writeFileSync(path, JSON.stringify(arr, null, 2));
  return arr;
};


const data = getFileData();
console.log(data);

export default function printStuff() {
  console.log("stuff");
  return "i am output";
}
