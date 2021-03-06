// eslint-disable-next-line no-unused-vars
const Promise = require('bluebird');
const fs = require('fs/promises');

const { google } = require('googleapis');

const authorize = require('./auth');

function get_token() {
    return fs.readFile('credentials/credentials.json')
        .then(content => JSON.parse(content))
        .then(credentials => authorize(credentials));
}

async function auth_and_read() {
    // Load client secrets from a local file.
    const credentials = await get_token();

    return listMajors(credentials);
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