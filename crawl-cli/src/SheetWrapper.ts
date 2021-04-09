/* eslint-disable camelcase */
import {google} from 'googleapis';
import {OAuth2Client} from 'google-auth-library';
import {sheets_v4} from 'googleapis/build/src/apis/sheets/v4';
import {without, isArray, isString, maxBy} from 'lodash';

interface IDictionary<T> {
  [key: string]: T;
}

export interface IImageCell {
  src: string,
  height: string,
  width: string
}

export const isImageCell = (arg: any): arg is IImageCell => {
  return arg && arg.src !== null && typeof(arg.src) === 'string';
}

/**
 * Wraps read only access to a google docs spreadsheet
 */
class SheetWrapper {
  sheetID: string;
  auth: OAuth2Client;
  googleApi: sheets_v4.Sheets;
  /**
   * @constructor
   * @param sheetID Id of the sheet to be accessed
   * @param auth already initialized authentication client
   */
  constructor(sheetID: string, auth: OAuth2Client) {
    this.sheetID = sheetID;
    this.auth = auth;
    this.googleApi = google.sheets({version: 'v4', auth});
  }

  /**
   * Reads the specified range
   * @param range The "A1" notation range to be read
   * @param options Optional options to override defaults
   */
  async read(range: string, options?: sheets_v4.Params$Resource$Spreadsheets$Values$Get): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      this.googleApi.spreadsheets.values.get({
        spreadsheetId: this.sheetID,
        range: range,
        majorDimension: 'ROWS',
        ...options,
      }, (err, res) => {
        if (err) return reject(new Error('The API returned an error: ' + err));
        if (res == null) return reject(new Error('The API returned nothing'));
        if (!res.data.values) return resolve([[]]);

        const data = res.data.values;
        if (!data.length) return reject(new Error('No Rows Returned'));
        return resolve(data);
      });
    });
  }

  /**
   * Returns a map of ColumnName to Column index
   * @param maxColumn The maximum column to search to, in "A" notation
   */
  async getHeaderLookup(maxColumn: string, tabName?: string): Promise<IDictionary<number>> {
    const headerMap: IDictionary<number> = {};
    const tabNamePrefix = tabName ? `'${tabName}'!` : '';
    const range = `${tabNamePrefix}A1:${maxColumn}1`;

    const columns = await this.read(range, {majorDimension: 'COLUMNS'});

    columns.forEach((v, i) => {
      headerMap[v.toString()] = i;
    });

    return headerMap;
  }

  async write(data: any[], maxColumn: string, tabName?: string, isDebug: boolean = false): Promise<number> {
    const headerMap = await this.getHeaderLookup(maxColumn, tabName);
    if (isDebug) {
      console.log('Raw Data', JSON.stringify(data.slice(0, Math.min(5, data.length))));
    }
    const rows = this.normalizeInput(data, headerMap);
    if (isDebug) {
      console.log('Normalized Data', JSON.stringify(rows.slice(0, Math.min(5, rows.length))));
    }
    const tabNamePrefix = tabName ? `'${tabName}'!` : '';
    
    const response = await this.googleApi.spreadsheets.values.append({
      spreadsheetId: this.sheetID,
      range: `${tabNamePrefix}A1:${maxColumn}`,      
      valueInputOption: 'USER_ENTERED',
      includeValuesInResponse: true,
      requestBody: {
        majorDimension: 'ROWS',
        values: rows,
      },
    });

    // const requests: sheets_v4.Schema$Request[] = []
    
    // const columnRequest : sheets_v4.Schema$Request = {
    //   updateDimensionProperties: {
    //     range: {
    //       sheetId: parseInt(this.sheetID),
    //       dimension: "COLUMNS",
    //       startIndex: headerMap["image"],
    //       endIndex: headerMap["image"]
    //     },
    //     fields: 'pixelSize',
    //     properties: {
    //       pixelSize: maxBy(data, x => x.image? parseInt(x.image.width) : 0)
    //     }
    //   }
    // }    
    // requests.push(columnRequest);

    // for (let index = 0; index < data.length; index++) {
    //   const element = data[index];
    //   if(!element.image || !element.image.height || element.image.height === ''){
    //     continue
    //   };

    //   const rowRequest : sheets_v4.Schema$Request = {
    //     updateDimensionProperties: {
    //       range: {
    //         sheetId: parseInt(this.sheetID),
    //         dimension: "ROWS",
    //         startIndex: index + 1,
    //         endIndex: index + 1
    //       },
    //       fields: 'pixelSize',
    //       properties: {
    //         pixelSize: parseInt(element.image.height)
    //       }
    //     }
    //   }

    //   requests.push(rowRequest);
    // }

    // const request: sheets_v4.Schema$BatchUpdateSpreadsheetRequest = {
    //   requests
    // }
    // const rowOperations = await this.googleApi.spreadsheets.batchUpdate({
    //   spreadsheetId: this.sheetID,
    //   requestBody: request
    // })

    if (isDebug) {
      console.log(response.data.updates);
      console.log(response.data.tableRange);
    }
    return response.status;
  }

  normalizeInput(inputData: any[], headerMap: IDictionary<number>) : any[][] {
    const rows: any[][] = [];
    const headerColumns = Object.keys(headerMap);

    inputData.forEach((d) =>{
      if (isArray(d)) {
        rows.push(d);
        return;
      }

      if (isString(d)) {
        rows.push([d]);
        return;
      }
      const row: any[] = [];

      headerColumns.forEach((columnHeader) => {
        const columnValue = d[columnHeader];
        if(isImageCell(columnValue)){
          if(columnValue.height && columnValue.width){
            row[headerMap[columnHeader]] = `=IMAGE("${columnValue.src}", 4, ${columnValue.height}, ${columnValue.width})`;  
          }else{
            row[headerMap[columnHeader]] = `=IMAGE("${columnValue.src}")`;  
          }
          
        }else{
          row[headerMap[columnHeader]] = columnValue;
        }
        
      });

      const keysWithoutHeaderValue = without(Object.keys(d), ...headerColumns);
      keysWithoutHeaderValue.forEach((propName) => {
        row.push(d[propName]);
      });

      rows.push(row);
    });

    return rows;
  }

  async getSpreadsheet() : Promise<sheets_v4.Schema$Spreadsheet> {
    const worksheet = await this.googleApi.spreadsheets.get({spreadsheetId: this.sheetID});

    return worksheet.data;
  }

  async getSheetNames(): Promise<string[]> {
    const worksheet = await this.getSpreadsheet();

    if (!worksheet.sheets) {
      return [];
    }

    const titles = worksheet.sheets.map((sheet) => sheet.properties?.title || '');

    return titles;
  }

  async createSheet(sheetName: string) : Promise<void> {
    const existingSheetNames = await this.getSheetNames();
    if (existingSheetNames.includes(sheetName)) {
      return;
    }

    const createSheetRequest: sheets_v4.Schema$Request = {
      addSheet: {
        properties: {
          title: sheetName,
        },
      },
    };

    const update: sheets_v4.Params$Resource$Spreadsheets$Batchupdate = {
      spreadsheetId: this.sheetID,
      requestBody: {
        requests: [createSheetRequest],
      },
    };

    await this.googleApi.spreadsheets.batchUpdate(update);
  }
}

export default SheetWrapper;
