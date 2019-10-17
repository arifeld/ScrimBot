const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

const base              = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class ChangeSoloScore extends Command {
	constructor(client) {
		super(client, {
			name: "changeduoscore",
			group: "leaderboards",
			memberName: "changeduoscore",
			description: "Changes the leaderboard score of a duo team.",
			examples: ["changesoloscore @Feldma 1000"],
			userPermissions: ["ADMINISTRATOR"],
            guildOnly: true,
			args: [
				{
					key: "team",
                    prompt: "what is the name of the team?\n"+
							"You have to enter the full name exactly as it is.\n"+
							"It is not case sensitive, but you require the entire name.",
					type: "string",
				},

				{
					key: "points",
					prompt: "how many points should the team have?\n" +
							"This **sets** the team points, it does not add them on.",
					type: "float"
				}
			],
		})
	}


	run(msg, args) {
		const { team, points } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

		var leaderboardInfo = serverInfo.duoLeaderboard
		if (!"duoTeams" in serverInfo || serverInfo.duoTeams.length == 0){
			const errorEmbed = new RichEmbed()
				.setColor(0xFF0000)
				.addField(":no_entry: Error!", "There are no created duo teams!")
			return msg.replyEmbed(errorEmbed)
		}
        var teamid = findDuoID(serverInfo.duoTeams, team)

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

		leaderboardInfo.sort(compare) // no point requiring another module to sort.

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

function findDuoInfo(teamData, id){
    for (var info=0; info < teamData.length; info++){
        if (teamData[info].members.includes(id)){
            return teamData[info]
        }
    }
    // no data found, return null.
    return null
}
function getDuoInfo(teamData, id){
    for (var info=0; info < teamData.length; info++){
        if (teamData[info].id == id){
            return teamData[info]
        }
    }
    return null
}

function findDuoID(teamData, name){
    for (var info=0; info < teamData.length; info++){
        if (teamData[info].name.toLowerCase() == name.toLowerCase() ){
            return teamData[info].id
        }
    }

    return null
}
