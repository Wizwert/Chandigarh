import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { connect } from 'puppeteer';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = (credentials: any, callback: (client: OAuth2Client) => void) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        callback(oAuth2Client);
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
const getNewToken = (oAuth2Client: OAuth2Client, callback: (client: OAuth2Client) => void) => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            if(!token) return console.error('No token');
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

const readUrls = (callback: (error?: any) => void) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return handleError(callback, 'Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Sheets API.
        
        authorize(JSON.parse(content.toString()), (client: OAuth2Client) => readSheet(client, callback));
    });
}

const readSheet = (auth: OAuth2Client, callback: (error?: any) => void) => {
    const headerMap = getHeaderLookup(auth, callback);
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        spreadsheetId: '1aCNSfTKJqLboNnajcaSosN05YVy2QhX3jr9UzqrFrLQ',
        range: 'A2:P',
    }, (err, res) => {
        if (err) return handleError(callback, 'The API returned an error: ' + err);
        if (res == null) return handleError(callback, 'The API returned nothing');
        if(!res.data.values) return handleError(callback, 'there are no rows!');

        const rows = res.data.values;
        if (rows.length) {
            const linkColumnOrdinal = headerMap.get('Link');
            if(!linkColumnOrdinal) return handleError(callback, 'Cannot find link column, did the name change?');
            const uris = getCleanUrls(rows, linkColumnOrdinal);
            const domains = uris.map(u => u.hostname);
            
            const distinctHostNames = domains.filter((host, index) => domains.indexOf(host) === index);
            distinctHostNames.forEach(h => {
                console.log(h);
            });
            callback();
        } else {
            handleError(callback, 'No data found.');
        }
    });
}

const getHeaderLookup = (auth: OAuth2Client, callback: (error?: any) => void) : Map<string, number> => {
    const headerMap = new Map<string, number>();
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        spreadsheetId: '1aCNSfTKJqLboNnajcaSosN05YVy2QhX3jr9UzqrFrLQ',
        range: 'A1:P1',
        majorDimension: 'COLUMNS'
    }, (err, res) => {
        if (err) return handleError(callback, 'The API returned an error: ' + err, null, headerMap);
        if (res == null) return handleError(callback, 'The API returned nothing', null , headerMap);
        if(!res.data.values) return handleError(callback, 'there are no rows!', null, headerMap);       
        
        const rows = res.data.values;
        if (!rows.length) {
            return headerMap;
        }
        
        for(let i = 0; i < rows.length; i++){
            headerMap.set(rows[i].toString(), i);
        }
        
        return headerMap;
    });

    return headerMap;
}

const getCleanUrls = (rows: any[][], linkColumnOrdinal: number) : URL[] => {
    const urls = rows.map(r => {
        try{
            return new URL(r[linkColumnOrdinal].toString());
        }catch{
            return null;
        }
    });
    return urls.filter(u => u) as URL[];
}

const handleError = (callback: (error?: any) => void, error: string, exception?: Error | null, defaultValue?: any) : void | any => {
    console.log(error, exception);
    callback(error);

    if(defaultValue){
        return defaultValue;
    }
}

export { readUrls };