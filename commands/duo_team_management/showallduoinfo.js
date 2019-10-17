const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))


module.exports = class ShowAllDuoInfo extends Command {
	constructor(client) {
		super(client, {
			name: "showallduoinfo",
			group: "duo_team_management",
			memberName: "showallduoinfo",
			description: "Displays all info on duo teams.",
            guildOnly: true,
            userPermissions: ["ADMINISTRATOR"]

		})
	}


	run(msg){

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

        if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

        var duoTeams = serverInfo.duoTeams
        var data = []
        for (var i=0; i < duoTeams.length; i++){
            var playerNames = []
            for (var j=0; j < duoTeams[i].members.length; j++){
                if (msg.guild.members.get(duoTeams[i].members[j]) !== undefined){
                    playerNames.push((msg.guild.members.get(duoTeams[i].members[j]).name || msg.guild.members.get(duoTeams[i].members[j]).user.username) + "\n" )
                }
                else {
                    playerNames.push("(unknown player)\n")
                }
            }

            data.push("**" + duoTeams[i].name + "**:\n" + playerNames)

        }

        if (data.length > 30){
            var sliceIndex = 30
            msg.reply("\n" + data.slice(0, 30))


            while (sliceIndex + 30 < data.length){
                msg.say(data.slice(sliceIndex, sliceIndex + 30))
                sliceIndex += 30
            }

            // Should have more data
            if (sliceIndex < data.length){
                msg.say(data.slice(sliceIndex, data.length))
            }
        }
        else{
            return msg.reply("\n" + data)
        }



	}
}
