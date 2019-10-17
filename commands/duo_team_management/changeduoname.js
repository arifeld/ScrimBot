const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class ChangeDuoName extends Command {
	constructor(client) {
		super(client, {
			name: "changeduoname",
			group: "duo_team_management",
			memberName: "changeduoname",
			description: "Changes the name of your duo team to the specified name.",
            guildOnly: true,
			args: [
				{
					key: "teamname",
					prompt: "**what do you want to change your team name to?**",
					type: "string",
				},
			],
		})
	}


	run(msg, args){
		const { teamname } = args;

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
        var teamID = -1
        for (var i=0; i < duoTeams.length; i++){
            if (duoTeams[i].members.includes(msg.member.id)){
                teamID = i
                break
            }
        }

        if (teamID == -1){
            return msg.reply("you are not part of a duo team! Create one first using `-createduo <name>`!")
        }

        var team = duoTeams[i]

        if (team.members.indexOf(msg.member.id) !== 0){
            return msg.reply("you are not the captain of your team!")
        }

        // Update the name.
        team.name = teamname

		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
				.addField(":white_check_mark: Success!", "Your team name has been changed to " + teamname + "!")

			return msg.replyEmbed(embed)
		})



	}
}
