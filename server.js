require('dotenv').config();

const http = require('http');
const faye = require('faye');
const Discord = require('discord.js');

const server = http.createServer();
const bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
const client = new Discord.Client();

bayeux.attach(server);
server.listen(8000, () => {
    console.log('Server Started');
});

client.once('ready', () => {
	console.log('Logged into discord!');
});

client.on('message', async message => {
    // Ignore self (bot) messages
    if (message.author.id == client.id) return;

    // Testing commands in the bot
    if (message.content.startsWith('htest!')) {
        let command = 'Not a command!';

        if (message.content == 'htest!trick') command = 'h!trick';
        if (message.content == 'htest!treat') command = 'h!treat';

        message.channel.send(new Discord.MessageEmbed({
            title: 'Trick\'ord-Treat',
            description: `Hmmm ${command}`,
        }));
    }

    // Check for halloween message
    if (message.embeds && message.embeds.length && message.embeds[0]) {
        const first = message.embeds[0];
        let cmd = null;

        if (first.description.includes('h!trick')) {
            cmd = 'h!trick';
        } else if (first.description.includes('h!treat')) {
            cmd = 'h!treat';
        }

        if (!cmd) {
            console.log(first.description);
            return;
        }

        bayeux.getClient().publish('/messages', {
            text: cmd,
            guild: message.guild.id,
            channel: message.channel.id,
        });
    }
});


const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
    console.error('DISCORD_BOT_TOKEN not found in env! Create a .env file or set the environment variable.');
    process.exit(1);
}

client.login(TOKEN);
