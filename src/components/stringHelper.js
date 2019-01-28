/* eslint-disable import/no-commonjs */

exports.getFieldName = path => path.split(":")[1]


exports.getTemplateName = path => {
  let templateName = ""

  const pathFragments = path.split("/")
  for (const fragment of pathFragments) {
    templateName += this.kebabCaseToPascalCase(fragment)
  }
  if (pathFragments.length === 0) {
    templateName = this.kebabCaseToPascalCase(path)
  }

  return this.getLowerCase(templateName)
}


exports.fragmentsToPath = fragments => fragments.join("/")


exports.fragmentsToTemplateName = fragments => {
  const path = this.fragmentsToPath(fragments)
  return this.getTemplateName(path)
}


exports.kebabCaseToPascalCase = directoryName => {
  let output = this.getUpperCase(directoryName)

  if (directoryName.indexOf("-") !== -1) {
    const nameFragments = directoryName.split("-")
    for (const fragment in nameFragments) {
      nameFragments[fragment] = this.getUpperCase(nameFragments[fragment])
    }
    output = nameFragments.join("")
  }

  return output
}


exports.getUpperCase = text => {
  const fragmentA = text.slice(0, 1)
  const fragmentB = text.slice(1)
  return fragmentA.toUpperCase() + fragmentB
}


exports.getLowerCase = text => {
  const fragmentA = text.slice(0, 1)
  const fragmentB = text.slice(1)
  return fragmentA.toLowerCase() + fragmentB
}


exports.getNameDifference = (parent, child) => {
  const output = child.replace(parent, "")
  return output
}


exports.getDirectoryPath = path => path.split(":")[0]


exports.getPathFragments = path => this.getDirectoryPath(path).split("/")


exports.removeLineBreaks = text => text.split("\r").join("")
