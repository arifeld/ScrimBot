const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

const base              = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class ChangeSoloScore extends Command {
	constructor(client) {
		super(client, {
			name: "changesoloscore",
			group: "leaderboards",
			memberName: "changesoloscore",
			description: "Changes the leaderboard score of a solo player.",
			examples: ["changesoloscore @Feldma 1000"],
			userPermissions: ["ADMINISTRATOR"],
            guildOnly: true,
			args: [
				{
					key: "team",
					prompt: "what is the name of the player?\n"+
							"You do not have to mention them, just type the full name.\n"+
							"For example, if you had a player called 'Feldma', enter 'Feldma' (without quotation marks)",
					type: "member",
				},

				{
					key: "points",
					prompt: "how many points should the player have?\n" +
							"This **sets** the player's points, it does not add them on.",
					type: "float"
				}
			],
		})
	}


	run(msg, args) {
		const { team, points } = args;

		var teamid = team.id

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

		var leaderboardInfo = serverInfo.soloLeaderboard
		var exists = false
		var oldpoints = 0
		for (var i=0; i < leaderboardInfo.length; i++){
			if (leaderboardInfo[i].team == teamid){
				oldpoints = leaderboardInfo[i].points
				leaderboardInfo[i].points = points
				exists = true
				break
			}
		}

		if (!exists){
			var obj = {
				"team": teamid,
				"points": points
			}
			leaderboardInfo.push(obj)
		}

		leaderboardInfo.sort(compare)

		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x000FF)
				.setFooter("Created by @Feldma#1776.")
				var oldPointName = "points"
				var pointName = "points"
				if (oldpoints==1){ oldPointName = "point"}
				if (points==1){ pointName = "point" }
			embed.addField( ":white_check_mark: Success!", "Successfully modified " + team + "'s points:\nPrevious - " + oldpoints + " " + oldPointName + ".\nCurrent - " + points + " " + pointName + ".")

			return msg.embed(embed)
		})
	}
}
// Utility function to sort our teamScore data.
function compare(a, b){
	if (a.points > b.points){ return -1 } // a has less points
	else if (a.points < b.points){ return 1 } // b has less points
	else{ return 0 }// both are equal, ideally we'd sort by name butttt we probably can't (not like this) because we only had teamID not the name, and we can't call msg.guild
}
