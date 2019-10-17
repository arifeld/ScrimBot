const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.
// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

// ScrimBot Modules
const winnerModule = require(path.join(__dirname, "../../scrimbot_modules/winnersrole.js"))

module.exports = class AddWin extends Command {
	constructor(client) {
		super(client, {
			name: "addwin",
			group: "mod utility",
			memberName: "addwin",
			description: "Adds a win to a user's name.",
			examples: [],
            userPermissions: ["MANAGE_CHANNELS", "MANAGE_MESSAGES"],
			guildOnly: true,
            args: [
                {
                    key: "winner",
                    prompt: "what is the name of the user you want to add a win to?",
                    type: "member",
                }
            ]

		})
	}

	async run(msg, args){
        const { winner } = args;

        var staffName = msg.member.nickname || msg.member.user.username
		var fileLocation = path.join(__dirname, "../../servers/", msg.guild.id + ".JSON")
		if (!fs.existsSync(fileLocation)){
            fs.writeFileSync( fileLocation, '{"guild": {}}', {encoding: "utf8", flag: "wx" } ) // create the file if it doesn't already exist and write some JSON to it to stop errors
        }
		var server = JSON.parse(fs.readFileSync(fileLocation, "utf8")); // read the file.
        var serverInfo = server.guild // get the guild info. We need to be able to save 'server' seperately as that contains ALL the data.

		// First, ensure the server has been configured.
		if (Object.keys(serverInfo).length == 0){
			return msg.reply("this server has not been configured. Type -configure first before using this command!")
		}

        var score = 1 // we set this here for database entry.

        var name = winner.nickname || winner.user.username
        var winnerIndex = name.lastIndexOf("| ")
        if (winnerIndex == -1){ // they don't have the winner role yet.
            name = name + " | 1 🏆"
            winner.setNickname(name, "[ScrimBot - Activator:] " + staffName)
        }
        else { // yay fun stuff
            // Let's use regex to only return numbers.
            var matches = name.slice(winnerIndex).match(/\d+/) // Slice only the bit we want and run regex on that. This gives us the first group of digits.
            if (matches == null){ // no matches
                // Do the above.
                name = name + " | 1 🏆"
                winner.setNickname(name, "[ScrimBot - Activator:] " + staffName)
            }
            else{ // we have a match!
                score = parseInt(matches.shift()) + 1 // .match returns an array, this grabs the first value.
                if (score == NaN){ // couldn't find the number.
                    // Do the above.
                    name = name + " | 1 🏆"
                    winner.setNickname(name, "[ScrimBot - Activator:] " + staffName)
                    return msg.reply("an unexpected error occured! The users name appears to contain the winners tag, but I cannot determine how many wins they have!\nI am appending the tag onto the name, however, this will result in a wrong name!")

                }
                else {
                    var tempname = name.slice(0, winnerIndex)
                    tempname = tempname + "| " + score + " 🏆"
                    winner.setNickname(tempname, "[ScrimBot - Activator:] " + staffName)
                }
            }
        }

        // Let's add this to our database.
        serverInfo.winnersList = serverInfo.winnersList || [] // initialise it.
        // Cast it.
        winnerLeaderboard = serverInfo.winnersList

        // If their score is 1, they are going to be at the bottom of the leaderboard.
        if (score == 1){
            var data = {
                id: winner.id,
                score: 1
            }

            winnerLeaderboard.push(data)
        }

        else {
            var { data, index } = winnerModule.searchID(winnerLeaderboard, winner.id)
            if ( data == undefined ){ // this isn't the first time they have won, but they are only being entered now. We have to insert their value.
                // note to self
                // at this point we have to insert their value in.
                // we have to check to see if they changed the top 3.
                // so insert, get index, see if top 3, then edit top 2/3/4 as required.
                // create this as a module so you can re-use it.
                // once you've done that you have to compare "data", add 1 to their score and search to see where the lowest and highest index of that score is.
                // use that to slice the data into the correct place, then see if top 3 and repeat.
                // also create a scanning feature.
            }
        }


        const embed = new RichEmbed()
            .setColor(0x00FF00)
            .setTitle( name + " has had a win added to their name!")
            .setFooter( "Win added by " + staffName + ".")

        return msg.embed(embed)

	}
}
