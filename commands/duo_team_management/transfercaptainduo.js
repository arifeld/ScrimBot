const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class TransferCaptainDuo extends Command {
	constructor(client) {
		super(client, {
			name: "transfercaptainduo",
			group: "duo_team_management",
			memberName: "transfercaptainduo",
			description: "Transfers captainship from one player in a duo team to the other.",
			examples: ["addduo @Feldma"],
            guildOnly: true,
			args: [
				{
					key: "player",
					prompt: "**who do you want to give captain to?**\n\nYou don't have to @mention them, but you can if you wish.",
					type: "member",
				},
			],
		})
	}


	run(msg, args){
		const { player } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

        if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

        if (player.id == msg.member.id){
            return msg.reply("you can't transfer ownership to yourself!")
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
            return msg.reply("you are not part of a duo team! Create one first using `-createduo <name>`!")
        }

        var team = duoTeams[i]
        if (!team.members.includes(player.id)){
            return msg.reply("that player isn't part of your duo team!")
        }
        else if (team.members.indexOf(msg.member.id) !== 0){
            return msg.reply("you are not the captain of your team!")
        }

        // Presumably at this point the player is free to be given captain.
        team.members.splice(team.members.indexOf(player.id), 1) // removes the player id from the array.
        team.members.unshift(player.id) // inserts the players id at the beginning.

		base.saveServerInfo(msg, serverInfo, () => {
            // Let the player know they were promoted.
            const sendEmbed = new RichEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL)
                .setColor(0x00FF00)
                .setFooter("Created by @Feldma#1776.")
                .addField("Notification from " + msg.guild.name + ":", "You have been given captain of duo team **" + team.name + "** by " + (msg.member.nickname || msg.member.user.username) + ".")

            player.send(sendEmbed)
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
				.addField(":white_check_mark: Success!", "Player " + player + " has been promoted to captain of **" + team.name + "**!")

			return msg.replyEmbed(embed)
		})



	}
}
