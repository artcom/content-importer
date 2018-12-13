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


#### IMPORTANT: 
- The CSV-file has to start with the header names. Remove any other text above
and below of the content that is needed.
- Line breaks within the text content can cause errors,
therefore strings should be used.

### Rules
Rules for the template name creation can be defined in a json file.
A rule contains the **path** where the children templates should be renamed
and the template child fragment which exchanges the original child.

#### Syntax:
```bash
{
  "rules": [
    {
      "path": "first/second",
      "children": "new"
    }
  ]
}
```

#### Example:
If the given path is **_"first/second/third/fourth"_**,
applying the rule above will result in the template name **_"firstSecondNewFourth"_**

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
- **< area >** -> area folder name in which the content should be created
    (default: "other")
- **< generate templates >** -> boolean value if templates should be generated or not
    (default: false)
- **< rule path >** -> path to the rule file
