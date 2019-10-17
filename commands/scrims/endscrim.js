const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

const base              = require(path.join(__dirname, "../../scrimbot_modules/base.js"))
const teamModule        = require(path.join(__dirname, "../../scrimbot_modules/teamtypes.js"))
const leaderboardModule = require(path.join(__dirname, "../../scrimbot_modules/leaderboard.js"))

module.exports = class EndScrim extends Command {
	constructor(client) {
		super(client, {
			name: "endscrim",
			group: "scrims",
			memberName: "endscrim",
			description: "Ends the current scrim, saving all placement information and stopping any additional data from being gathered.",
			examples: ["endscrim"],
            guildOnly: true,
			args: [
				{
					key: "shouldSave",
					prompt: "Do you want to save leaderboard information from this scrim?\nDefaults to '**true**.\nIf you do not want to save information, write '**false**'.",
					type: "boolean",
					default: true
				}
			]
		})
	}


	run(msg, args) {
		const { shouldSave } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!base.memberIsHost(msg)){
			return msg.reply("you must be a scrim host or have the \"Manage Channel\" permission to use this command!")
		}

		// Delete the message to make it neat.
		msg.delete()

        var oldType   = serverInfo.gameidType

		if (!serverInfo.scrimInProgress){
			return msg.reply("there is no scrim in progress! Type `-newscrim <type>` to start a new scrim!")
		}



		// Determine what game type we want.
		var types = teamModule.getGameType( oldType )
		var typeSolo = types[0], typeDuo = types[1], typeSquad = types[2]

		// Let's save the leaderboard if we need to.

		if (serverInfo.paidVersion && serverInfo.scrimPlacements.length > 0 && serverInfo.trackScores){
			// yay, infinite iteration!

			var scrimGames = serverInfo.currentScrim
			var scrimPlacements = serverInfo.scrimPlacements

			// Calculate scores.
			var teamPoints = leaderboardModule.calculateTeamScores(msg, serverInfo, typeSolo, typeDuo, typeSquad)

    		// Hypothetically, this is exactly what we want to save. So let's do that.
            if (typeSolo){
                serverInfo.soloLeaderboard = teamPoints
            }
            else if (typeDuo){
                serverInfo.duoLeaderboard = teamPoints
            }
            else{
                serverInfo.squadLeaderboard = teamPoints
            }
        }


		serverInfo.scrimInProgress = false
		serverInfo.gameidEmbed = null
		serverInfo.gameidChannel = null

		// Reset our currentScrim value.
		serverInfo.currentScrim = []

		serverInfo.scrimPlacements = []

		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setColor(0x000FF)
				.addField( msg.member.displayName + " has ended the scrim!", "Thanks for playing!")
			if (serverInfo.trackScores){
				if (serverInfo.paidVersion && oldType == "squads" && shouldSave){
					embed.addField('\u200B', "\n:white_check_mark: Successfully saved leaderboard information.")
				}

				else if (serverInfo.paidVersion && oldType == "squads" && !shouldSave){
				embed.addField('\u200B', "\n:no_entry: Leaderboard information has not been updated (by user request).")
				}
			}

			return msg.embed(embed)
		})
	}
}
