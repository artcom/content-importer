/* eslint-disable import/no-commonjs */

const csv = require("csvtojson")
const fs = require("fs")

const contentReader = require("./components/contentReader")
const templateReader = require("./components/templateReader")
const exporter = require("./components/fileExporter")
const helper = require("./components/stringHelper")

const csvFilePath = process.argv[2]
const importPath = process.argv[3]
const area = process.argv[4] || "other"
const generateTemplates = process.argv[5] === "true" ? true : false || false
const templateRules = getTemplateRules(process.argv[6])

const templateMap = new Map()

csv({
  delimiter: ";",
  includeColumns: /(path|textDE|textEN|type)/,
  noheader: false,
  headers: ["", "", "path", "", "", "textDE", "", "textEN", "", "", "type"]
})
  .fromFile(csvFilePath, { encoding: "latin1" })
  .then(main)

function main(csvContent) {
  const existingContent = contentReader.read(importPath)
  const existingTemplates = templateReader.read(importPath)
  const filesContent = extractContent(existingContent, existingTemplates, csvContent.slice(3))
  exporter.export(filesContent)
}


function extractContent(existingContent, existingTemplates, csvContent) {
  const output = getOutputObject(existingContent, existingTemplates)

  for (const entry of csvContent) {
    addTemplatesToMap(entry.path)
    output.content[area] = assignContent(output.content[area], entry)

    if (generateTemplates) {
      output.templates = assignTemplatesContent(output.templates, entry)
    }
  }

  return output
}


function getOutputObject(existingContent, existingTemplates) {
  const output = {
    content: existingContent || {}
  }

  if (generateTemplates) {
    output.templates = existingTemplates || {}
  }
  if (!output.content.hasOwnProperty(area)) {
    output.content[area] = { index: { template: "area" } }
  }

  return output
}


function getFieldProperties(entry) {
  let content = {}

  switch (entry.type) {
    case "markdown":
      content.de = entry.textDE
      content.en = entry.textEN
      break
    case "number":
      content = parseFloat(entry.textDE)
      break
    default:
      content.de = helper.removeLineBreaks(entry.textDE)
      content.en = helper.removeLineBreaks(entry.textEN)
      break
  }

  const field = {
    name: helper.getFieldName(entry.path),
    content
  }

  return field
}


function assignContent(directory, entry, iteration = 0) {
  const pathFragments = helper.getPathFragments(entry.path)
  const currentDirectory = directory
  const childDirectory = pathFragments[iteration]

  if (!currentDirectory.hasOwnProperty(childDirectory)) {
    currentDirectory[childDirectory] = { index: {} }
  }

  if (generateTemplates) {
    if (!currentDirectory[childDirectory].hasOwnProperty("index")) {
      currentDirectory[childDirectory].index = {}
    }
    const path = pathFragments.slice(0, iteration + 1).join("/")
    const templateName = templateMap.get(path)
    currentDirectory[childDirectory].index.template = templateName
  }

  if (iteration < pathFragments.length - 1) {
    currentDirectory[childDirectory] =
        assignContent(currentDirectory[childDirectory], entry, iteration + 1)
  } else {
    const field = getFieldProperties(entry)
    currentDirectory[childDirectory].index[field.name] = field.content
  }

  return currentDirectory
}


function assignTemplatesContent(templates, entry) {
  const newTemplates = templates
  const pathFragments = helper.getPathFragments(entry.path)
  const readFragments = []
  const field = {
    name: helper.getFieldName(entry.path),
    type: entry.type || "string"
  }

  let currentTemplate = helper.kebabCaseToPascalCase(pathFragments[0])
  currentTemplate = helper.getLowerCase(currentTemplate)

  for (let i = 0; i < pathFragments.length; i++) {
    readFragments.push(pathFragments[i])
    currentTemplate = templateMap.get(readFragments.join("/"))
    if (!newTemplates.hasOwnProperty(currentTemplate)) {
      newTemplates[currentTemplate] = {}
    }

    const isLastFragment = i === pathFragments.length - 1
    const childTemplate = !isLastFragment &&
        templateMap.get(`${readFragments.join("/")}/${pathFragments[i + 1]}`)

    newTemplates[currentTemplate] = setTemplateProperties(newTemplates[currentTemplate],
      field, isLastFragment, childTemplate)


    currentTemplate = childTemplate
  }

  return newTemplates
}


function setTemplateProperties(template, newField, isLastFragment, childTemplate) {
  let newTemplate = template

  if (isLastFragment) {
    newTemplate = assignFieldToTemplate(newTemplate, newField)
  } else {
    newTemplate = assignChildToTemplate(newTemplate, childTemplate)
  }

  return newTemplate
}


function assignFieldToTemplate(template, newField) {
  const newTemplate = template

  if (!newTemplate.hasOwnProperty("fields")) {
    newTemplate.fields = []
  }

  let isFieldExistent = false
  for (const field of newTemplate.fields) {
    if (field.name === newField.name) {
      isFieldExistent = true
      const index = newTemplate.fields.indexOf(field)
      newTemplate.fields[index] = newField
    }
  }

  if (!isFieldExistent) {
    newTemplate.fields.push(newField)
  }

  return newTemplate
}


function assignChildToTemplate(template, child) {
  const newTemplate = template

  if (!newTemplate.hasOwnProperty("children")) {
    newTemplate.children = []
  }
  if (newTemplate.children.indexOf(child) === -1) {
    newTemplate.children.push(child)
  }

  return newTemplate
}


function getTemplateRules(path) {
  let file = []
  let rules = []

  if (path) {
    if (fs.existsSync(path)) {
      file = fs.readFileSync(path, "utf8", err => {
        if (err) { throw err }
      })

      file = JSON.parse(file)
      rules = file.hasOwnProperty("rules") && file.rules
    }
  }

  return rules
}


function getNewRuleTemplate(pathFragments) {
  let newTemplate
  for (const rule of templateRules) {
    const ruleFragments = helper.getPathFragments(rule.path)
    if (arePathsSimilar(pathFragments.slice(0, pathFragments.length - 1), ruleFragments)) {
      newTemplate = rule.template
    }
  }

  return newTemplate
}


function arePathsSimilar(pathFragments, ruleFragments) {
  if (pathFragments.length === ruleFragments.length) {
    for (let i = 0; i < pathFragments.length; i++) {
      if (ruleFragments[i].includes("*")) {
        if (!pathFragments[i].includes(ruleFragments[i].replace("*", ""))) {
          return false
        }
      } else {
        if (pathFragments[i] !== ruleFragments[i]) {
          return false
        }
      }
    }
  } else {
    return false
  }

  return true
}


function addTemplatesToMap(path) {
  const pathFragments = helper.getPathFragments(path)
  let readFragments
  let template = ""

  for (let i = 0; i < pathFragments.length; i++) {
    readFragments = pathFragments.slice(0, i + 1)
    const ruleTemplate = getNewRuleTemplate(readFragments)
    template = !ruleTemplate ? template + helper.kebabCaseToPascalCase(pathFragments[i])
      : ruleTemplate

    templateMap.set(readFragments.join("/"), helper.getLowerCase(template))
  }
}
