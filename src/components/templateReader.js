/* eslint-disable import/no-commonjs */
/* eslint-disable no-console */

// Implementation idea for file reading function from Stack Overflow.
// Link: https://stackoverflow.com/questions/11194287/convert-a-directory-structure-in-the-filesystem-to-json-with-node-js#11194896
// Author of original function: https://stackoverflow.com/users/297366/miikka

const fs = require("fs")
const path = require("path")

exports.read = path => {
  createDirectory(`${path}/templates`)
  return getDirectoryStructure(`${path}/templates`)
}


function getDirectoryStructure(directory) {
  const stats = fs.lstatSync(directory)
  const output = {}
  const name = path.basename(directory)

  if (name !== ".DS_Store") {
    if (stats.isDirectory()) {
      const children = fs.readdirSync(directory)

      for (const child of children) {
        if (child.indexOf(".json") !== -1) {
          const childContent = fs.readFileSync(`${directory}/${child}`, "utf8", err => {
            if (err) { throw err }
          })

          output[child.replace(".json", "")] = JSON.parse(childContent)
        }
      }
    }
  }

  return output
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
