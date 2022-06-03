const { Client, Intents } = require('discord.js');

require('dotenv').config();


const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Run code when client is ready
client.once('ready', () => {
    console.log('Ready!');
});

client.login(process.env.BOT_TOKEN);