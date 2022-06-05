const { Client, Intents } = require('discord.js');
const command_handlers = require('./commands/command-handlers');

require('dotenv').config();

// Create an instance of a Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    await command_handlers[commandName](interaction);
});

// Run code when client is ready
client.once('ready', () => {
    console.log('Ready!');
});

// Login to Discord with the token from .env
client.login(process.env.BOT_TOKEN);