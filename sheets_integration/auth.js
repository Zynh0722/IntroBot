// eslint-disable-next-line no-unused-vars
const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));
const readline = require('readline');

const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'credentials/token.json';

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
    return fs.readFileAsync(TOKEN_PATH)
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

    const question = () => new Promise((resolve) => {
        rl.question('Enter the code from that page here: ', code => {
            resolve(code);
        });
    });

    return question()
        .tap(() => rl.close())
        .tap(code => console.log(code))
        .then(code => oAuth2Client.getToken({ code }))
        .tap(token =>
            fs.writeFileAsync(TOKEN_PATH, JSON.stringify(token))
                .then(() => console.log('Token stored to', TOKEN_PATH))
                .catch(console.error),
        )
        .then(token => set_credentials(oAuth2Client, token))
        .catch(err => console.error('Error retrieving access token', err));
}

module.exports = authorize;