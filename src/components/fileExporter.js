/* eslint-disable import/no-commonjs */
/* eslint-disable no-console */

const fs = require("fs")
const exportPath = process.argv[3]


exports.export = config => {
  createContentFiles(`${exportPath}/content`, config.content)
  createTemplateFiles(`${exportPath}/templates`, config.templates)
}


function createContentFiles(path, obj) {
  for (const key in obj) {
    if (key === "index") {
      createIndexFile(path, obj[key])
    } else {
      createDirectory(`${path}/${key}`)
      createContentFiles(`${path}/${key}`, obj[key])
    }
  }
}


function createIndexFile(path, content) {
  fs.writeFile(`${path}/index.json`, `${JSON.stringify(content, null, 2)}\n`, "utf8", err => {
    if (err) {
      return console.error(err)
    }
    console.log(`File saved at: ${path}/index.json`)
  })
}


function createTemplateFiles(path, templates) {
  for (const template in templates) {
    fs.writeFile(`${path}/${template}.json`, `${JSON.stringify(templates[template], null, 2)}\n`,
      "utf8", err => {
        if (err) {
          return console.error(err)
        }
        console.log(`File saved at: ${path}/${template}.json`)
      })
  }
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
