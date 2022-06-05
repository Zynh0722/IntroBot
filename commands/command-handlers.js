const auth_and_read = require('../sheets_integration/fetch_sheet.js');

module.exports.ping = interaction => interaction.reply('Pong!');

module.exports.users = async interaction => {
    const members = await interaction.guild.members.fetch();
    const users = members.map(member => member.user.username);

    auth_and_read();

    interaction.reply(
        `Here are the users in this server:\n${users.join('\n')}`,
    );
};

// module.exports.server = interaction =>
//     interaction.guild.members.fetch()
//         .then(members => {
//             console.log(members.map(member => member.roles.botRole));
//             interaction.reply(
//                 `Server name: ${interaction.guild.name}\n` +
//                 `Server ID: ${interaction.guild.id}\n` +
//                 `Total members: ${interaction.guild.memberCount}\n` +
//                 `List of members: ${members.filter(member => !member.roles.botRole).map(member => member.user.username).join(', ')}`,
//             );
//         });

// module.exports.user = interaction => interaction.reply('User info.');