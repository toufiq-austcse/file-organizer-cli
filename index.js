#!/usr/bin/env node
const fs = require("fs");
const { Command } = require("commander");


async function run() {
  const program = new Command();
  program.option("-d,--dirpath <dirpath>", "Enter an absolute Directory path").parse(process.argv);

  const values = program.opts();
  if (!values.dirpath) {
    console.log("Need a dirpath path to process");
    process.exit(1);
  }

  if (!fs.existsSync(values.dirpath)) {
    console.log("dirpath not exists");
    process.exit(1);
  }

  let path = values.dirpath;
  let fileList = getFileList(path);

  let extensions = getFileExtensions(fileList);

  extensions.forEach((ext) => {
    fileOrganizer(ext, fileList, path);
  });
}

function getFileList(inputDirPath) {
  let fileList = [];
  let dirContents = fs.readdirSync(inputDirPath);
  dirContents.forEach((content) => {
    let stat = fs.statSync(inputDirPath + "/" + content);
    if (stat.isFile()) {
      fileList.push(content);
    }
  });
  return fileList;
}
function getFileExtensions(fileList) {
  let set = new Set();
  fileList.forEach((file) => {
    let parts = file.split(".");
    let extension = parts[parts.length - 1];
    set.add(extension);
  });

  return set;
}

async function fileOrganizer(ext, fileList, inputDirPath) {
  let filesToMove = fileList.filter((file) => file.endsWith(ext));
  let outputPath = inputDirPath + "/" + ext;

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath);
    fs.chmod(outputPath, 0666, (error) => {
      if (error) {
        console.log("error while changing file permission");
      }
    });
  }

  filesToMove.forEach(async (file) => {
    let oldPath = inputDirPath + "/" + file;
    let newPath = outputPath + "/" + file;

    fs.renameSync(oldPath, newPath);
  });
}
run();
