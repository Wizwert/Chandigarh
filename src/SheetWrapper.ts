import readline from 'readline';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ChandigarhSheetID } from "./constants";
import * as v4 from "googleapis/build/src/apis/sheets/v4";
import { sheets_v4 } from "googleapis/build/src/apis/sheets/v4";
import { GaxiosResponse } from 'gaxios';

class SheetWrapper {
    sheetID: string;
    auth: OAuth2Client;
    sheets: sheets_v4.Sheets;
    constructor(sheetID: string, auth: OAuth2Client) {
        this.sheetID = sheetID;
        this.auth = auth;
        this.sheets = google.sheets({ version: 'v4', auth });
    }

    read = async (range:string, options?: sheets_v4.Params$Resource$Spreadsheets$Values$Get) : Promise<any[][]> => {                
        return new Promise((resolve, reject) => {
            this.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetID,
                range: range,
                ...options
            }, (err, res) => {
                if (err) return reject('The API returned an error: ' + err);
                if (res == null) return reject('The API returned nothing');
                if(!res.data.values) return reject('there are no rows!');
        
                const data = res.data.values;
                if(!data.length) return reject('No Rows Returned');                                
                return resolve(data);      
            });
        });
    }

    getHeaderLookup = async (maxColumn: string) : Promise<Map<string, number>> => {        
        let headerMap = new Map<string, number>();

        const columns = await this.read(`A1:${maxColumn}1`, { majorDimension: 'COLUMNS' });        
        columns.forEach((v, i) => {
            headerMap.set(v.toString(), i);
        })

        return headerMap;
    }
}

export default SheetWrapper;