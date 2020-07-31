# Chandigarh
This is the repository for all code related to data mining for the Chandigarh Chair project

Workflow:
1. Read existing links from Chandigarh sheet
2. Search google for chandigarh on sites already listed in Chandigarh sheet
3. Write list of new Links back to Datastore (new googlesheet?)

To run the code Gulp is required
`npm install -g gulp`

## Commands
***
### bootstrap
Usage: `gulp bootstrap`
sets up the repo for use

### build
Usage: `gulp build`
Compiles code

### crawl
Usage `gulp crawl`
Hits google.com and searches for 'Chandigarh Chair' and saves a pdf

### read
Usage `gulp read`
Reads from the Chandigarh spreadsheet and extracts the distinct domains listed there