const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for  JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class ConfigureServer extends Command {
	constructor(client) {
		super(client, {
			name: "configure",
			group: "settings",
			memberName: "configure",
			description: "A one-time use command that guides you through the configuration process.",
			examples: ["configure"],
			args: [
				{
					key: "accept",
					prompt: "**welcome to the ScrimBot configuration command.**\n\n" +
							"Before running this command, please ensure the following:\n" +
							"1) If you plan on using this bot for squad scrims, team roles **must be at the bottom of the role list**.\n" +
							"	- Confused what this means? Take a look at this photo of an example role list: <https://imgur.com/NEFoEuQ>\n" +
							//"2) In order to use team management commands such as `-addTeam` and `-addUser`, please make a role called **`!TEAMS!`** and place it above all team roles.\n" +
							//"	- Unsure what this means? Take a look at this photo for an example role list: <insert link here>\n\n" +
							"**Ensured the above are correct? If so, please respond to this message with '__yes__'.**\n" +
							"If not, please type '__cancel__' and change the above.\n",

					type: "string",
					validate: text => {
						if (text.indexOf("y") == -1){
							return "unknown response. If the server is configured as above, please type '**yes**', else type '**cancel**'."
						}
						return true
					},
					wait: 500,


				},

				{
					key: "captainRole",
					prompt: "please type the **full name** of the captain role.\n" +
							"If you do not have a captain role, please type '**everyone**'.",

					type: "role",
					wait: 500,


				},
				{
                    key: "permittedChannels",
					prompt: "please type the channels that the GameID collection can be used in.\n\n" +
							"Only type one channel at a time, then press enter.\n" +
							"Once you have inputted all the channels, please type '**finish**'.\n\n" +
							"For an example, you could type the following:\n#solo-gamecodes `<press enter>`\n#duo-gamecodes `<press enter>`\nfinish `<press enter>`\n",

					type: "channel",
					/*parse: text => {
						return text.id
					},*/
					infinite: true,
					wait: 500,
				},

			],
			userPermissions: ["MANAGE_GUILD"],
            guildOnly: true,
		})
	}


	async run(msg, args){
		const { accept, captainRole, permittedChannels } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		// Now, let's create some data!

		var channelids = []
		for (var id in permittedChannels){
			channelids.push(permittedChannels[id].id)
		}


		var obj = {
			// General server configuration.
			"permittedChannels": channelids,
			"captainRole": captainRole.id,

			// General scrim information.
			"scrimInProgress": false,
			"gameidEmbed": null,
			"gameidChannel": null,
			"gameidType": "squads",
			"currentScrim": [],

			// Team management.
			"duoTeams": [],
			"squadTeams": [], // may not be used.

			// Paid features.
			"paidVersion":       false, // changed from paidVersion
			"soloStructure":     [],
			"duoStructure":      [],
            "duoAmount":          0, // for indexing purposes.
			"squadStructure":    [],
            "squadAmount":        0,
            "soloRequirePhoto":  false,
            "duoRequirePhoto":   false,
            "squadRequirePhoto": false,

			"scrimPlacements": [],
			"placementEmbed":  [],
			"trackScores": false,

			// Leaderboards
			"soloLeaderboard":  [],
			"duoLeaderboard":   [],
			"squadLeaderboard": [],

		}

		server.guild = obj

		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setColor(0x000FF)
                .addField("Success!", "This server has now been configured! You can now run scrims using ScrimBot!")
				.addField("First time using ScrimBot?", "[Click here to see my documentation!](https://scrimbot.gitbook.io)")

			return msg.embed(embed)
		})
	}
}
