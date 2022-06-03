require('dotenv').config();

// const sheetsHandler = require('./sheets_integration/fetch_sheet.js');

// sheetsHandler.auth_and_read();

const { Client, Intents } = require('discord.js');
const token = process.env.BOT_TOKEN;

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Run code when client is ready
client.once('ready', () => {
    console.log('Ready!');
});