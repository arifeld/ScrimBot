const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class End247 extends Command {
	constructor(client) {
		super(client, {
			name: "end247",
			group: "247",
			memberName: "end247",
			description: "Ends the current 24/7 scrim.",
            guildOnly: true,
		})
	}


	run(msg) {

		// Delete the message to make it neat.
		msg.delete()

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!base.memberIsHost(msg)){
		    return msg.reply("you must be a scrim host or have the \"Manage Channel\" permission to use this command!")
		}

        if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

        if (msg.guild.autoTimer == undefined || msg.guild.autoTimer == 0){
            return msg.reply("there is no 24/7 scrim in progress!")
        }
        else{
            clearInterval(msg.guild.autoTimer)
            clearInterval(msg.guild.fiveMinuteTimer)
            clearInterval(msg.guild.oneMinuteTimer)
            msg.guild.autoTimer = 0
            msg.guild.fiveMinuteTimer = 0
            msg.guild.oneMinuteTimer = 0
            serverInfo.current247 = false
        }

        base.saveServerInfo(msg, serverInfo, () => {
                return msg.reply("the 24/7 system has been disabled!")
		})

    }


}
