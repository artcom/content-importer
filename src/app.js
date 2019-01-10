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

csv()
  .fromFile(csvFilePath)
  .then(main)

function main(csvContent) {
  const existingContent = contentReader.read(importPath)
  const existingTemplates = templateReader.read(importPath)

  const filesContent = extractContent(existingContent, existingTemplates, csvContent)
  exporter.export(filesContent)
}


function extractContent(existingContent, existingTemplates, csvContent) {
  const output = getOutputObject(existingContent, existingTemplates)

  for (const entry of csvContent) {
    const field = getFieldProperties(entry)
    const pathFragments = helper.getDirectoryPath(entry.path).split("/")
    output.content[area] = assignContent(output.content[area],
      pathFragments, "", field)

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

  switch(entry.type){
    case "markdown":
        content.de = entry.textDE
        content.en = entry.textEN
        break;
    case "number":
        content = parseFloat(entry.textDE)
    default:
        content.de = helper.removeLineBreaks(entry.textDE)
        content.en = helper.removeLineBreaks(entry.textEN)
        break;
  }

  const field = {
    name: helper.getFieldName(entry.path),
    content
  }

  return field
}


function assignContent(directory, pathFragments, lastTemplate, field) {
  const currentDirectory = directory
  const childDirectory = pathFragments[0]

  let templateName = ""
  if (!currentDirectory.hasOwnProperty(childDirectory)) {
    currentDirectory[childDirectory] = { index: {} }
  }


  if (generateTemplates) {
    if (!currentDirectory[childDirectory].hasOwnProperty("index")) {
      currentDirectory[childDirectory].index = {}
    }

    const templateChildFragment = applyRulesOnChild(lastTemplate, childDirectory)

    const templateNameComponents =
        lastTemplate + helper.kebabCaseToPascalCase(templateChildFragment)
    templateName = helper.getLowerCase(templateNameComponents)

    currentDirectory[childDirectory].index.template = templateName
  }

  const nextFragments = pathFragments.slice(1)

  if (nextFragments.length > 0) {
    currentDirectory[childDirectory] =
      assignContent(currentDirectory[childDirectory], nextFragments, templateName, field)
  } else {
    currentDirectory[childDirectory].index[field.name] = field.content
  }

  return currentDirectory
}


function assignTemplatesContent(templates, entry) {
  const newTemplates = templates
  const pathFragments = helper.getDirectoryPath(entry.path).split("/")
  const newField = {
    name: helper.getFieldName(entry.path),
    type: entry.type || "string"
  }

  let currentTemplate = ""

  for (let i = 0; i < pathFragments.length; i++) {
    const nextTemplateFragment = applyRulesOnChild(currentTemplate, pathFragments[i])
    currentTemplate += helper.kebabCaseToPascalCase(nextTemplateFragment)
    currentTemplate = helper.getLowerCase(currentTemplate)

    if (!newTemplates.hasOwnProperty(currentTemplate)) {
      newTemplates[currentTemplate] = {}
    }

    const isLastFragment = i === pathFragments.length - 1
    const childTemplateFragment = applyRulesOnChild(currentTemplate, pathFragments[i + 1])
    const childTemplate = !isLastFragment && currentTemplate
      + helper.kebabCaseToPascalCase(childTemplateFragment)

    newTemplates[currentTemplate] = setTemplateProperties(newTemplates[currentTemplate],
      newField, isLastFragment, childTemplate)
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


function applyRulesOnChild(parent, child) {
  let newChild = child

  for (const rule of templateRules) {
    const ruleTemplateName = helper.getTemplateName(rule.path)

    if (ruleTemplateName === parent) {
      newChild = rule.children
    }
  }

  return newChild
}

