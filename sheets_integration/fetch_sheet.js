// eslint-disable-next-line no-unused-vars
const Promise = require('bluebird');

const fs = require('fs/promises');
const readline = require('readline');

const util = require('util');

const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

function auth_and_read() {
    // Load client secrets from a local file.
    return fs.readFile('sheets_integration/credentials.json')
        .then(content => JSON.parse(content))
        .then(credentials => authorize(credentials))
        .then(auth => listMajors(auth))
        .catch(err => console.log('Error:', err));
}

function set_credentials(client, token) {
    client.setCredentials(token);
    return client;
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

    /* NEW CODE */
    // Check if we have previously stored a token.
    return fs.readFile(TOKEN_PATH)
        .then(token => set_credentials(oAuth2Client, JSON.parse(token)))
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

    const question = util.promisify(rl.question).bind(rl);

    question()
        .tap(() => rl.close())
        .then(code => oAuth2Client.getToken(code))
        .tap(token =>
            fs.writeFile(TOKEN_PATH, JSON.stringify(token))
                .then(() => console.log('Token stored to', TOKEN_PATH))
                .catch(console.error),
        )
        .then(token => set_credentials(oAuth2Client, token))
        .catch(err => console.error('Error retrieving access token', err));
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    return sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'A1:E2',
    })
        .then(res => {
            let out = '';

            const rows = res.data.values;
            if (rows.length) {
                rows.map((row) => {
                    row.map((col) => {
                        out += col + ' ';
                    });
                    out += '\n';
                });
            } else {
                console.log('No data found.');
            }

            console.log(out);
            return out;
        })
        .catch(err => console.log('The API returned an error: ' + err));
}

module.exports = auth_and_read;