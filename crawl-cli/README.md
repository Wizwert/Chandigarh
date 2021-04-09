# Chandigarh
This is the repository for all code related to data mining for the Chandigarh Chair project

![Node.js CI](https://github.com/Wizwert/Chandigarh/workflows/Node.js%20CI/badge.svg)

Workflow:
1. Read existing links from Chandigarh sheet
2. Search google for chandigarh on sites already listed in Chandigarh sheet
3. Write list of new Links back to Datastore (new googlesheet?)

To run the code Gulp is required
`npm install -g gulp`

To run the CLI locally
`npm link`

## Commands
***
### bootstrap
Usage: `gulp bootstrap`
sets up the repo for use

### build
Usage: `gulp build`
Compiles code

### watch
Usage: `gulp watchFiles`
Compiles code

### search
Usage `chan search --site <site> --term <term>`
Hits google.com and searches for 'Chandigarh Chair' on the provided site

### read
Usage `chan read`
Reads from the Chandigarh spreadsheet and extracts the distinct domains listed there
