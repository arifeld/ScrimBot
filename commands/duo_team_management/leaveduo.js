const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class LeaveDuo extends Command {
	constructor(client) {
		super(client, {
			name: "leaveduo",
			group: "duo_team_management",
			memberName: "leaveduo",
			description: "Removes you from the duo team you are apart of.",
			examples: ["leaveduo"],
            guildOnly: true,
		})
	}


	run(msg, args){
		const { player } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

        if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

        if ("lockedDuo" in serverInfo){
            if (msg.channel.id !== serverInfo.lockedDuo){
                return msg.reply("you cannot use this command here!")
            }
        }

        var duoTeams = serverInfo.duoTeams
        var teamID = -1
        for (var i=0; i < duoTeams.length; i++){
            if (duoTeams[i].members.includes(msg.member.id)){
                teamID = i
                break
            }
        }

        if (teamID == -1){
            return msg.reply("you are not part of a duo team!")
        }

        var team = duoTeams[i]

        // Presumably at this point the player is free to be removed.
        team.members.splice(team.members.indexOf(msg.member.id), 1)
        if (team.members.length == 0){
            duoTeams.splice(teamID, 1) // delete the team.
        }


		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
				.addField(":white_check_mark: Success!", "Succesfully left " + team.name + ".")
                if (team.members.length == 0){
                    embed.addField("Note:", "Team has been deleted as it has no members.")
                }

			return msg.replyEmbed(embed)

		})
	}
}
