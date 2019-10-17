const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js');

// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const leaderboardModule = require(path.join(__dirname, "../../scrimbot_modules/leaderboard.js"))
const teamModule        = require(path.join(__dirname, "../../scrimbot_modules/teamtypes.js"))
const base              = require(path.join(__dirname, "../../scrimbot_modules/base.js") )


module.exports = class GenerateLeaderboard extends Command {
	constructor(client){
		super(client, {
			name: "leaderboard",
			group: "leaderboards",
			memberName: "leaderboard",
			description: "Generates the current leaderboard.",
			examples: ["leaderboard"],
            guildOnly: true,
            args: [
                {
                    key: "type",
                    prompt: "what gamemode type do you want to display the leaderboard for?",
                    type: "string",
                    validate: text => {
						if (text.indexOf("solo") !== -1 || text.indexOf("duo") !== -1 || text.indexOf("squad") !== -1 ) return true;
						return "Invalid gamemode! Avaliable options: solo, duo or squads."
					},

					parse: text => {
						if (text.indexOf("solo") !== -1){
							return "solo"
						}
						else if (text.indexOf("duo") !== -1){
							return "duo"
						}
						else {
							return "squads"
						}
					}
                }
            ]
		})
	}


	async run (msg, args) {
		const { type }  = args;

        var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

		if (!base.memberIsHost(msg)){
			return msg.reply("you must be a scrim host or have the \"Manage Channel\" permission to use this command!")
		}

		// Delete the message to make it neat.
		msg.delete()
		
		// Determine what game type we want.
		var types = teamModule.getGameType( type )
		var typeSolo = types[0], typeDuo = types[1], typeSquad = types[2]

		// Grab our point structure and saved leaderboard info.
		var infos = teamModule.returnInfoTypes(serverInfo, typeSolo, typeDuo, typeSquad)
        var pointInfo = infos[0], leadInfo = infos[1]

		// Now, we want to iterate over all the placement info, get the info that we want and add that to the placement stuff.
		// Define a few points in the JSON file we will refer to a lot.
		var scrimGames = serverInfo.currentScrim
		var scrimPlacements = serverInfo.scrimPlacements


		if (scrimPlacements.length == 0 || !serverInfo.trackScores || type !== serverInfo.gameidType){ // there is no data, so we just want our saved info, OR we have a different type of scrim in progress.
			// Hypothetically, we can just input leadInfo for teamPoints into the module.
			// Add our "post-scrim" option, only used in this file (hypothetically).
			return leaderboardModule.generateLeaderboardEmbed(this.client, msg, serverInfo, typeSolo, typeDuo, typeSquad, pointInfo, leadInfo, true)
		}

		// Otherwise, there is data, and we want to iterate.
        // Yay simplified!
        var teamPoints = leaderboardModule.calculateTeamScores(msg, serverInfo, typeSolo, typeDuo, typeSquad)

        return leaderboardModule.generateLeaderboardEmbed(this.client, msg, serverInfo, typeSolo, typeDuo, typeSquad, pointInfo, teamPoints)

	}
}
