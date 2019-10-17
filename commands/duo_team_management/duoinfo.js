const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class DuoInfo extends Command {
	constructor(client) {
		super(client, {
			name: "duoinfo",
			group: "duo_team_management",
			memberName: "duoinfo",
			description: "Displays info on the provided team, or if no team is provided the team you're in.",
			examples: ["duoinfo Awesome Team"],
            guildOnly: true,
			args: [
				{
					key: "teamname",
					prompt: "**what team do you want to display info on?**",
					type: "string",
                    default: ""
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

        var duoTeams = serverInfo.duoTeams
        var teamID = -1

        if (teamname == ""){ // display info on their team.
            for (var i=0; i < duoTeams.length; i++){
                if (duoTeams[i].members.includes(msg.member.id)){
                    teamID = i
                    break
                }
            }
            if (teamID == -1){
                return msg.reply("you are not part of a team!\nUse `-duoinfo <team name>` to get info on a specific team!")
            }
        }
        else {
            for (var i=0; i < duoTeams.length; i++){
                if (duoTeams[i].name == teamname){
                    teamID = i
                    break
                }
            }
            if (teamID == -1){
                return msg.reply("no team by that name exists!\nYou need to type the name exactly as it is.")
            }

        }

        var team = duoTeams[i]
        var teammembers = []
        for (var i=0; i < team.members.length; i++){
            if (i == 0){
                teammembers.push("Captain: " + msg.guild.members.get(team.members[i]))
            }
            else{
                teammembers.push("Member: " + msg.guild.members.get(team.members[i]))
            }
        }

        const embed = new RichEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
            .setColor(0x00FF00)
            .setFooter("Created by @Feldma#1776.")
            .setTitle("Team Info: " + team.name)
            .addField("Team Members:", teammembers)

        /*
        if (serverInfo.duoLeaderboard.length !== 0){
            for (var squad=0; squad < serverInfo.duoLeaderboard.length; squad++){
                if (serverInfo.duoLeaderboard[squad].teamID = team.name){
                    (serverInfo.duoLeaderboard[squad])
                    (team.name)
                    embed.addField("Current Duo Score:", serverInfo.duoLeaderboard[squad].points)
                    break
                }
            }
        }*/
        return msg.replyEmbed(embed)


	}
}
