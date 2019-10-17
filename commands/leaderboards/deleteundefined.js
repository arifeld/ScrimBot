const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class DeleteUndefined extends Command {
	constructor(client) {
		super(client, {
			name: "deleteundefined",
			group: "leaderboards",
			memberName: "deleteundefined",
			description: "Removes any undefined teams from the scoreboard.",
			examples: ["deleteundefined"],
            userPermissions: ["ADMINISTRATOR"],
            guildOnly: true,
		})
	}


	run(msg) {
		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

        // Squad removal.
		var squadInfo = serverInfo.squadLeaderboard
		var exists = false
		for (var i=0; i < squadInfo.length; i++){
            if (msg.guild.roles.get(squadInfo[i].team) == undefined || msg.guild.roles.get(squadInfo[i].team) == null){
                squadInfo.splice(i, 1)
            }
		}

        // Duo removal.
        var duoInfo = serverInfo.duoLeaderboard
        exists = false
        for (var i=0; i < duoInfo.length; i++){
            if (getDuoInfo(serverInfo.duoTeams, duoInfo[i].team) == null){
                duoInfo.splice(i, 1)
            }
        }

        // Solo removal.
        var soloInfo = serverInfo.soloLeaderboard
        exists = false
        for (var i=0; i < soloInfo.length; i++){
            console.log(soloInfo[i].team)
            console.log(msg.guild.members.get(soloInfo[i].team))
            if (msg.guild.members.get(soloInfo[i].team) == undefined){
                soloInfo.splice(i, 1)
            }
        }

		squadInfo.sort(compare)
        duoInfo.sort(compare)
        soloInfo.sort(compare)

		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x000FF)
				.setFooter("Created by @Feldma#1776.")
			embed.addField( ":white_check_mark: Success!", "Successfully removed all invalid/undefined teams from the scoreboard.")

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

function getDuoInfo(teamData, id){
    for (var info=0; info < teamData.length; info++){
        if (teamData[info].id == id){
            return teamData[info]
        }
    }
    return null
}
