const {Client, Intents} = require('discord.js'); //import discord.js
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');
const settingsfn = './settings.json'
const langlist = require('./languages/langlist.json');
const { Player } = require("discord-player");
const fs = require('fs');
const en = './languages/en.json'
const sv = './languages/sv.json'
const { welcometext, langselector } = require(en);
const commandsmodule = require('awesomebotcommands');
const commands = commandsmodule.commands
// Create a new Player (you don't need any API Key)
const player = new Player(client);
var settings = JSON.parse(fs.readFileSync(settingsfn, 'utf8'));

var jsonlang = settings.lang

if (JSON.stringify(jsonlang) === JSON.stringify(langlist.english))
{
	const { nplay } = require(en);
	player.on("trackStart", (queue, track) => queue.metadata.channel.send(`${nplay} **${track.title}**!`))
}
if (JSON.stringify(jsonlang) === JSON.stringify(langlist.swedish))
{
	const { nplay } = require(sv);
	player.on("trackStart", (queue, track) => queue.metadata.channel.send(`${nplay} **${track.title}**!`))
}


client.on("message", message => {
    if (message.content.toLowerCase() == "shutdown") { // Note that this is an example and anyone can use this command.
        message.channel.send("Shutting down...").then(() => {
            client.destroy();
        })
    }
})


const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
	
client.once('ready', () => {
	client.channels.fetch('504685453643874336')
    .then(channel => {
        channel.send(welcometext);
		channel.send(langselector);
    })
	client.on("message", message => {
    if (message.content.toLowerCase() == "english") { // Note that this is an example and anyone can use this command.
        message.channel.send("English is the language for bot on this server").then(() => {
            settings.lang = "en";
			fs.writeFileSync(settingsfn, JSON.stringify(settings));
			settings = JSON.parse(fs.readFileSync(settingsfn, 'utf8'));
        })
    }
	if (message.content.toLowerCase() == "svenska") { // Note that this is an example and anyone can use this command.
        message.channel.send("Svenska har blivit serverns huvudspråk").then(() => {
            settings.lang = "sv";
			fs.writeFileSync(settingsfn, JSON.stringify(settings));
			settings = JSON.parse(fs.readFileSync(settingsfn, 'utf8'));
        })
    }
})
	console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

		if (commandName === "play") {
        const query = interaction.options.get("query");
		const sngln = query.value
        const queue = player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });

        queue.connect(interaction.member.voice.channel);

        await interaction.deferReply();
        const track = await player.search(sngln, {
            requestedBy: interaction.user
        }).then(x => x.tracks[0]);
		jsonlang = settings.lang
		if (JSON.stringify(jsonlang) === JSON.stringify(langlist.english))
		{
			const { tracks, nfound } = require(en);
			if (!track) return await interaction.followUp({ content: `❌ | ${tracks} **${sngln}** ${nfound}` });
		}
		jsonlang = settings.lang
		if (JSON.stringify(jsonlang) === JSON.stringify(langlist.swedish))
		{
			const { tracks, nfound } = require(sv);
			if (!track) return await interaction.followUp({ content: `❌ | ${tracks} **${sngln}** ${nfound}` });
		}

        queue.play(track);
		jsonlang = settings.lang
		if (JSON.stringify(jsonlang) === JSON.stringify(langlist.english))
		{
			const { ldtrk } = require(en);
			return await interaction.followUp({ content: `⏱️ | ${ldtrk} **${track.title}**!` });
		}
		jsonlang = settings.lang
		if (JSON.stringify(jsonlang) === JSON.stringify(langlist.swedish))
		{
			const { ldtrk } = require(sv);
			return await interaction.followUp({ content: `⏱️ | ${ldtrk} **${track.title}**!` });
		}
		
    }
	
	else if (commandName === "stop")
	{
		const queue = player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });
		queue.destroy();
		const channel = await client.channels.fetch("504685453643874336");
		return await interaction.reply("Music had stopped!");
	}
	
	else if (commandName === "addsong")
	{
		const query = interaction.options.get("query");
		const sngln = query.value
		const queue = player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });
		const track = await player.search(sngln, {
            requestedBy: interaction.user
        }).then(x => x.tracks[0]);
        if (!track) return await interaction.followUp({ content: `❌ | Track **${sngln}** not found!` });
		queue.addTrack(track);
		return await interaction.reply(`Song ${track.title} added successfully!`);
	}
	
	else if (commandName === "skip")
	{
		const queue = player.createQueue(interaction.guild, {
            metadata: {
                channel: interaction.channel
            }
        });
		queue.skip();
	}
});

// add the trackStart event so when a song will be played this message will be sent



client.login(token);