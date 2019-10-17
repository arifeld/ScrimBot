const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class NewGame extends Command {
	constructor(client) {
		super(client, {
			name: "newgame",
			group: "scrims",
			memberName: "newgame",
			description: "Stops previous game ID collections and starts a new embed.",
			examples: ["newgame"],
            guildOnly: true,

		})
	}


	run(msg, args) {

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		var type = serverInfo.gameidType

		if (!base.memberIsHost(msg)){
		    return msg.reply("you must be a scrim host or have the \"Manage Channel\" permission to use this command!")
		}

		msg.delete()

        // Check if there is actually a game going on
		if (serverInfo.currentScrim.length === 0){
			return msg.reply("there is no scrim currently in progress!")
		}

		serverInfo.gameidEmbed = null
		serverInfo.gameidChannel = null

		base.saveServerInfo(msg, serverInfo, () => {
				const embed = new RichEmbed()
					.setColor(0xFF0000)
					.addField( msg.member.displayName + " has restarted the Game ID Collector!", "**Add your Game ID's with -gameid <4 digit code>**")
					.addField( "Game Type:", type[0].toUpperCase() + type.substr(1), true )
					.addField( "Game Number:", serverInfo.currentScrim.length+1, true) // We +1 because we don't actually add anything to the array until someone types -gameid
				return msg.embed(embed)

		})
	}
}
