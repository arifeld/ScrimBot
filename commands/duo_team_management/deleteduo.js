const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class DeleteDuo extends Command {
	constructor(client) {
		super(client, {
			name: "deleteduo",
			group: "duo_team_management",
			memberName: "deleteduo",
			description: "Deletes a duo team. Cannot be undone!",
			examples: ["deleteduo"],
            guildOnly: true,
		})
	}


	run(msg){

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

        /*
        [
            {
                "name": "coolname",
                "members": [

                ],
            }
        ]
        */

        var duoTeams = serverInfo.duoTeams
        var deleted = false
        for (var i=0; i < duoTeams.length; i++){
            if (duoTeams[i].members.includes(msg.member.id)){
                if (duoTeams[i].members.indexOf(msg.member.id) !== 0){
                    return msg.reply("you are not the captain of the team! This command can only be run by the captain.")
                }
                else {
                    var oldInfo = duoTeams.splice(i, 1)
                    deleted = true
                    break // no point searching anymore.
                }
            }
        }

        if (!deleted){
            return msg.reply("you are not in a duo team!")
        }


		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
				.addField(":white_check_mark: Success!", "Team **" + oldInfo[0].name + "** has been deleted!")

			return msg.replyEmbed(embed)
		})
	}
}
