require('dotenv').config();
const { CRED_PATH, TOKEN_PATH, SPREADSHEET_ID } = process.env;

const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));

const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];


function load_credentials() {
    return fs.readFileAsync(CRED_PATH)
        .then(content => JSON.parse(content))
        .then(content => authorize(content))
        .then(auth => listMajors(auth))
        .catch(err => console.log('Error loading client secret file:', err));
}

function setCredentials(oAuth2Client, token) {
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    return fs.readFileAsync(TOKEN_PATH)
        .then(token => JSON.parse(token))
        .then(token => setCredentials(oAuth2Client, token))
        .catch(() => getNewToken(oAuth2Client));
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    /* Creating promises */
    const getToken = Promise.promisify(oAuth2Client.getToken.bind(oAuth2Client));
    const question = (q) => new Promise(resolve => rl.question(q, resolve));

    return question('Enter the code from that page here: ')
        .tap(() => rl.close())
        .then(code => getToken(code))
        .tap(token => fs.writeFileAsync(TOKEN_PATH, JSON.stringify(token))
            .then(() => console.log('Token stored to', TOKEN_PATH))
            .catch(console.error))
        .then(token => setCredentials(oAuth2Client, token))
        .catch(err => console.error('Error while trying to retrieve access token', err));
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/17JmKV_TeXaaCulegDvaLdOhmBYWPcOJa7uKcV6YOarE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'A1:E',
    })
        .then(res => {
            const rows = res.data.values;
            const data = rows.slice(1);

            const table = data.map(row =>
                row.map((cell, index) => ({ [rows[0][index]]: cell }))
                    .reduce((a, b) => Object.assign(a, b), {}));

            // console.log(rows);
            console.table(table);
        })
        .catch(err => console.log('The API returned an error: ' + err));
}

module.exports = load_credentials;