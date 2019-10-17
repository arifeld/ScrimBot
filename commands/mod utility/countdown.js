const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

module.exports = class Countdown extends Command {
	constructor(client) {
		super(client, {
			name: "countdown",
			group: "mod utility",
			memberName: "countdown",
			description: "Creates a 10 second countdown in the channel you are in.",
            guildOnly: true,
		})
	}


	run(msg) {


		var hasHost = msg.member.hasPermission("MANAGE_CHANNELS")
		if (!hasHost){
			msg.member.roles.forEach( (val, key) => {
				if (val.name.toLowerCase().indexOf("scrim host") !== -1){
					hasHost = true
				}
			})
		}

		if (!hasHost){
			return msg.reply("you must be a scrim host or admin to use this command!")
		}

        var vc = msg.member.voiceChannel
        // Check that the channel is a voice channel (because it doesn't work when validating above).
        if (vc == undefined){
            return msg.reply("you are not in a voice channel!")
        }

        // Play the match starting timer (once off)
        beginMatch(vc, msg.guild)

    }


}

// Countdown from 10
function beginMatch(voice, guild){
    if (voice && guild.autoTimer !== 0){
        var matchAudio = path.join(__dirname, "../../audio/", "MatchStarting.mp3")
        voice.join()
            .then(connection => {
                const dispatcher = connection.playFile(matchAudio)

                dispatcher.on("end", () => {
                    connection.disconnect()
                })
            })
            .catch(console.log)
    }
}
