/* eslint-disable camelcase */
import {google} from 'googleapis';
import {OAuth2Client} from 'google-auth-library';
import {sheets_v4} from 'googleapis/build/src/apis/sheets/v4';

/**
 * Wraps read only access to a google docs spreadsheet
 */
class SheetWrapper {
  sheetID: string;
  auth: OAuth2Client;
  sheets: sheets_v4.Sheets;
  /**
   * @constructor
   * @param sheetID Id of the sheet to be accessed
   * @param auth already initialized authentication client
   */
  constructor(sheetID: string, auth: OAuth2Client) {
    this.sheetID = sheetID;
    this.auth = auth;
    this.sheets = google.sheets({version: 'v4', auth});
  }

  /**
   * Reads the specified range
   * @param range The "A1" notation range to be read
   * @param options Optional options to override defaults
   */
  async read(range: string, options?: sheets_v4.Params$Resource$Spreadsheets$Values$Get): Promise<any[][]> {
    return new Promise((resolve, reject) => {
      this.sheets.spreadsheets.values.get({
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
  async getHeaderLookup(maxColumn: string, tabName?: string): Promise<Map<string, number>> {
    const headerMap = new Map<string, number>();
    const tabNamePrefix = tabName ? `'${tabName}'!` : '';
    const range = `${tabNamePrefix}A1:${maxColumn}1`;
    // console.log('range', range);
    const columns = await this.read(range, {majorDimension: 'COLUMNS'});
    // console.log(columns);
    columns.forEach((v, i) => {
      headerMap.set(v.toString(), i);
    });

    return headerMap;
  }

  async write(data: any[], maxColumn: string, tabName?: string): Promise<number> {
    const headerMap = await this.getHeaderLookup(maxColumn, tabName);

    const rows: any[][] = [[]];

    data.forEach((d) =>{
      const row: any = [];
      headerMap.forEach((columnIndex, columnHeader) =>{
        row[columnIndex] = d[columnHeader];
        rows.push(row);
      });
    });

    const tabNamePrefix = tabName ? `${tabName}!` : '';

    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.sheetID,
      range: `${tabNamePrefix}A1:${maxColumn}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        majorDimension: 'ROWS',
        values: rows,
      },
    });

    return response.status;
  }
}

export default SheetWrapper;
