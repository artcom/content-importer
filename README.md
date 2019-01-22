# Content-Importer
Reads a **csv file** and uses its information to generate **index.json** files and their **template.json** files with a hierarchical file structure.

### Examples
#### Generated File Hierarchy:
````
- root
  - content
    - area
      - index.json
      - directoryA1
        - index.json
        - directoryB1
          - index.json
        - directoryB2
          - index.json
        - directoryB3
          - index.json
          - directoryC1
            - index.json
  - templates
    - directoryA1.json
    - directoryA1DirectoryB1.json
    - directoryA1DirectoryB2.json
    - directoryA1DirectoryB3.json
    - directoryA1DirectoryB3DirectoryC1.json
````

#### File Content:
- **index.json**
````
{
  "template": "templateName",
  "fieldName1": {
    "de": "german field content",
    "en": "english field content"
  },
  "fieldName2": {
    "de": "german field content",
    "en": "english field content"
  },
  "fieldNameN": {
    "de": "german field content",
    "en": "english field content"
  }
}
````

- **template.json**
````
{
  "children": [
    "templateNameChildDir1",
    "templateNameChildDirN"
  ],
  "fields": [
    {
      "name": "fieldName1",
      "type": "text"
    },
    {
      "name": "fieldName2",
      "type": "text"
    },
    {
      "name": "fieldNameN",
      "type": "text"
    }
  ]
}
````

## Usage

### CSV
An example csv file can be found in the content folder.

#### CSV Configuration:
- UTF-8
- Field Delimiter: ,
- String Delimiter: "

#### Header Names:

- **path** (e.g. "dir1/dir2:fieldName")
- **textDE**
- **textEN**
- **type** (supported: "string", "markdown" and "number". If empty: string)


#### IMPORTANT: 
- The CSV-file has to start with the header names. Remove any other text above
and below of the content that is needed.
- Line breaks within the text content can cause errors,
therefore strings should be used.

### Rules
Rules for the template name creation can be defined in a json file.
A rule contains a **path** and the template name every child of the defined path will get.

#### Syntax:
When defining the path, '*' works as a wildcard. \
E.g. instead of defining the same rule for every element (element1, element2, ...) of an enumeration, using an asterisk will allow the same result with only one defined rule
```bash
{
  "rules": [
    {
      "path": "dir/elements/element*/options",
      "template": "dirElementOption"
    }
  ]
}
```

#### Example:
If the given path is **_"dir/elements/element4/options/option1"_**,
applying the rule above will result in the template name **_"dirElementOption"_**. \
If no rule would be defined, the path would result in the template name **_"dirElementsElement4OptionsOption1"_**

### Run
A path to the **csv file** and to the **existing files / empty folder** must be declared.
To use the program, run the following CLI commands:

```bash
npm install
npm start <path to csv> <import/export path> [<area>] [<generate templates>] [<rule path>]
```

_(CLI parameters are order-sensitive)_

- **< path to csv >** -> path to csv file containing new content
- **< import/export path >** -> root directory path to existing content / empty folder
- **< area >** (optional) ->  area folder name in which the content should be created
    (default: "other")
- **< generate templates >** (optional) -> boolean value if templates should be generated or not
    (default: false)
- **< rule path >** (optional) -> path to the rule file
