const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class CreateDuo extends Command {
	constructor(client) {
		super(client, {
			name: "createduo",
			group: "duo_team_management",
			memberName: "createduo",
			description: "Creates a new duo team with the specified.",
			examples: ["addduo Awesome Team", "addduo My Name Jeff"],
            guildOnly: true,
			args: [
				{
					key: "name",
					prompt: "**what is the name of your duo team?**",
					type: "string",

				},
			],
		})
	}


	run(msg, args){
		const { name } = args;

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
        for (var i=0; i < duoTeams.length; i++){
            if (duoTeams[i].members.includes(msg.member.id)){
                return msg.reply("you are already part of a team! Use `-leaveduo` to leave your current team!")
            }
            else if (duoTeams[i].name == name){
                return msg.reply("a team with that name already exists! The captain of that team is " + msg.guild.members.get(duoTeams[i].members[0]) + ".")
            }
        }

        // Presumably at this point there isn't a team with that info. Let's insert it into our data.
        var data = {
            "id": serverInfo.duoAmount + 1,
            "name": name,
            "members": [
                msg.member.id
            ]
        }

        duoTeams.push(data)
        serverInfo.duoAmount = serverInfo.duoAmount + 1


		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
				.addField(":white_check_mark: Success!", "Team **" + name + "** has been created!\nUse -inviteduo @Player to invite people to your team!")

			return msg.replyEmbed(embed)

		})
	}
}
