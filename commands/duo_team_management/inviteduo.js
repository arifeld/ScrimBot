const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

module.exports = class InviteDuo extends Command {
	constructor(client) {
		super(client, {
			name: "inviteduo",
			group: "duo_team_management",
			memberName: "inviteduo",
			description: "Adds a player to your duo team.",
			examples: ["addduo @Feldma"],
            guildOnly: true,
			args: [
				{
					key: "player",
					prompt: "**who are you adding to your duo team?**\n\nYou don't have to @mention them, but you can if you wish.",
					type: "member",

				},
			],
		})
	}


	run(msg, args){
		const { player } = args;

        var fileLocation = path.join(__dirname, "../../servers/", msg.guild.id + ".JSON")
		if (!fs.existsSync(fileLocation)){
        fs.writeFileSync( fileLocation, '{"guild": {}}', {encoding: "utf8", flag: "wx" } ) // create the file if it doesn't already exist and write some JSON to it to stop errors.

    }
		var server = JSON.parse(fs.readFileSync(fileLocation, "utf8")); // read the file.
        var serverInfo = server.guild // get the guild info. We need to be able to save 'server' seperately as that contains ALL the data.

		// First, ensure the server has been configured.
		if (Object.keys(serverInfo).length == 0){
			return msg.reply("this server has not been configured. Type -configure first before using this command!")
		}

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

        if (player.bot){
            return msg.reply( player + " is a bot! You can't invite them to your team.")
        }

        var duoTeams = serverInfo.duoTeams
        var teamID = -1
        for (var i=0; i < duoTeams.length; i++){
            if (duoTeams[i].members.includes(player.id)){
                return msg.reply(player + " is already part of a team! Get them to type `-leaveduo` first!")
            }
            if (duoTeams[i].members.includes(msg.member.id)){
                teamID = i
                break
            }
        }

        if (teamID == -1){
            return msg.reply("you are not part of a duo team! Create one first using `-createduo <name>`!")
        }



        var team = duoTeams[i]
        // Only allow the captain to modify the team.

        if (team.members.indexOf(msg.member.id) !== 0){
            return msg.reply("you are not the captain! You can't add players.")
        }

        // Duo teams can have max one substitute player.
        if (team.members.length >= 3){ // Can only have a max of 3 players in your team.
            return msg.reply("you already have 3 players (the maximum) in your duo team!\nIf you need to, you can remove a player from your team using `-removeduo @Player`")
        }

        // Presumably at this point the player is free to be added.
        team.members.push(player.id)


		fs.writeFile(fileLocation, JSON.stringify(server, null, 2), (err) => {
			if (err){
				console.error(error)
				return msg.reply("failed to add.\nThis means data will be lost!\nPlease contact @Feldma#1776.\nERROR:ADDDUO1")
			}
			else {
                // Let the player know they were invited.
                const sendEmbed = new RichEmbed()
                    .setAuthor(this.client.user.username, this.client.user.displayAvatarURL)
                    .setColor(0x00FF00)
                    .setFooter("Created by @Feldma#1776.")
                    .addField("Notification from " + msg.guild.name + ":", "You have been added to the duo team **" + team.name + "** by " + (msg.member.nickname || msg.member.user.username) + ".")
                    .addField("Do not want to be part of the team?", "Type `-leaveduo` in " + msg.guild.name + " to leave the team.")

                player.send(sendEmbed)
				const embed = new RichEmbed()
					.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
					.setColor(0x00FF00)
					.setFooter("Created by @Feldma#1776.")
					.addField(":white_check_mark: Success!", "Player " + player + " has been added to team **" + team.name + "**!")

				return msg.replyEmbed(embed)
			}
		})



	}
}
