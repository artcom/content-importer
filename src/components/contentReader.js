/* eslint-disable import/no-commonjs */
/* eslint-disable no-console */

// Implementation idea for file reading function from Stack Overflow.
// Link: https://stackoverflow.com/questions/11194287/convert-a-directory-structure-in-the-filesystem-to-json-with-node-js#11194896
// Author of original function: https://stackoverflow.com/users/297366/miikka

const fs = require("fs")
const path = require("path")

exports.read = path => {
  createDirectory(`${path}/content`)
  return getDirectoryStructure(`${path}/content`)
}


function getDirectoryStructure(filename) {
  const stats = fs.lstatSync(filename)
  let file = {}
  const name = path.basename(filename)

  if (name !== ".DS_Store") {
    if (stats.isDirectory()) {
      const children = fs.readdirSync(filename)

      for (const child of children) {
        const childName = child === "index.json" ? "index" : child
        if (child !== ".DS_Store") {
          file[childName] = getDirectoryStructure(`${filename}/${child}`)
        }
      }
    } else {
      const indexContent = fs.readFileSync(filename, "utf8", err => {
        if (err) { throw err }
      })
      file = JSON.parse(indexContent)
    }
  }

  return file
}


function createDirectory(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, err => {
      if (err) {
        return console.error(err)
      }
      console.log("Directory created.")
    })
  }
}
