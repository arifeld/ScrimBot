const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js');

// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base              = require(path.join(__dirname, "../../scrimbot_modules/base.js"))
const teamModule        = require(path.join(__dirname, "../../scrimbot_modules/teamtypes.js"))

module.exports = class Placement extends Command {
	constructor(client){
		super(client, {
			name: "placement",
			group: "leaderboards",
			memberName: "placement",
			description: "Sets you / your teams placement in a game.",
			examples: ["placement 1 15", "placement 56 0"],
            guildOnly: true,
            aliases: ["score", "place"],
			args: [
				{
					key: "placement",
					prompt: "what position did you come in the game?\nDo **not** include suffixes - only type the number.\n\nExample: '1' (without quotation marks).",
					type: "integer",
					parse: text => {
						return text.replace(/\D/g, '')
					},
				},

				{
					key: "kills",
					prompt: "how many kills did you get (as a team)?",
					type: "integer",
					parse: text => {
						return text.replace(/\D/g, '')
					},
                    default: 0
				},
			]
		})
	}


	async run (msg, args) {
		const {placement, kills}  = args;

        // Change validation to occur in the command so that the command just fails if they get it wrong.
        // Parsing still occurs via commando.
        if (placement < 1 || placement > 100)){ // If they aren't between 1 and 100
            return msg.reply("you have specified an invalid placement! It has to be between 1 and 100.\n**Make sure you put a space between your placement and your kills (not a comma!)\nPlease re-enter the command with the correct placement and kills.")
        }
        if (kills < 0 || kills > 99){
            return msg.reply("you have specified an invalid amount of kills! Please re-enter tthe command with the correct amount of kills.")
        }

        // Give them a prompt that they might have done it the wrong way round.
        if (kills > 20){
            msg.reply("**ALERT**: you may have accidently put your placement and kills in the wrong order. You should have entered the command as `-placement <PLACEMENT> <KILLS>`.\nIf you put your placement and kills in the wrong order, please redo the command with the correct order.")
        }

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

		if (!(serverInfo.trackScores)){
			return msg.reply("this scrim is unscored! You do not need to enter placement info.")
		}


		// Check if there are set "placement" channels:
        if ("placementsChannel" in serverInfo){
            if (serverInfo.placementsChannel.length !== 0){ // there are set channels.
    			if ( !serverInfo.placementsChannel.includes(msg.channel.id)){
    				return msg.reply("you cannot use this command here!")

    			}
    		}
        }

		msg.delete()

		// Determine what game type we want.
		var types = teamModule.getGameType( serverInfo.gameidType )
		var typeSolo = types[0], typeDuo = types[1], typeSquad = types[2]


        var photoRequired = false


		const errorEmbed = new RichEmbed()
			.setColor(0xFF0000)

		// See if we are using the linear system, so we can error out if we aren't using anything.
		var linearSystem = false
        if ("useLinear" in serverInfo){
            if (serverInfo.useLinear){
                linearSystem = true
            }
        }
        switch ( serverInfo.gameidType ) {
			case "solo":
                photoRequired = serverInfo.soloRequirePhoto
                if (serverInfo.soloStructure.length == 0 && !linearSystem){ // it hasn't been configured.
					errorEmbed.addField(":no_entry: Error!", "This server has not been configured for scored solo scrims!\nGet an admin to run `-setupLeaderboard` to set it up or enable the linear system with `-setlinear`!")
                    return msg.embed(errorEmbed)
                }
				break;
			case "duo":
                photoRequired = serverInfo.duoRequirePhoto
                if (serverInfo.duoStructure.length == 0 && !linearSystem){ // it hasn't been configured.
					errorEmbed.addField(":no_entry: Error!", "This server has not been configured for scored duo scrims!\nGet an admin to run `-setupLeaderboard` to set it up or enable the linear system with `-setlinear`!")
					return msg.embed(errorEmbed)
				}
				break;
			case "squads":
                photoRequired = serverInfo.squadRequirePhoto
                if (serverInfo.squadStructure.length == 0 && !linearSystem){ // it hasn't been configured.
					errorEmbed.addField(":no_entry: Error!", "this server has not been configured for scored squad scrims!\nGet an admin to run `-setupLeaderboard` to set it up!")
					return msg.embed(errorEmbed)
                }
				break;
		}


        if (photoRequired){
			if (!(msg.attachments.size > 0)){
				errorEmbed.addField(":no_entry: Error!" , "You are required to attach a screenshot when entering the `-placement` command.\n" +
								"Check with the scrim host to see what image they want - either a placement image or an image of your kills.\n\n" +
								"**Please be aware that you might be required to upload more than 1 image. If so, submit one image with this command and then post the other photo without typing the command.**")

				msg.replyEmbed(errorEmbed)
					.then(newmsg => {
						setTimeout(() => newmsg.delete(), 30000 )
					})
			}
		}

		// Check if there is actually a game going on
		if (serverInfo.currentScrim.length === 0){
			return msg.reply("there is no scrim currently in progress!") // I don't see when this would ever be called. But whatever.
		}

		var team = teamModule.getTeamData(msg, typeSolo, typeDuo, typeSquad, serverInfo)
		if (team == undefined){ return }

		var currentPlacement = serverInfo.currentScrim.length-1 // the index we want to use.
		var gameInfo = serverInfo.currentScrim[currentPlacement]
		var placementInfo = serverInfo.scrimPlacements[currentPlacement].placements

		// We want to get the gameid of the team. We don't care about how many teams are in a game, we will do that with the leaderboard command.
		var placementGameID = null
		for (var game in gameInfo.games){
			if (gameInfo.games[game].teams.includes(team.id)){
				placementGameID = gameInfo.games[game].gameID
				break
			}
		}

        var updatedPlacement = false
		if (placementGameID == null){ // they haven't entered a gameID
			return msg.reply("you / your team haven't entered a Game ID! Type -gameid <4 digit code> to enter it.")
				.then(newmsg => {
					setTimeout(() => newmsg.delete(), 20000 )
				})
		}
		else {
			var gamePlacementExists = false
			var oldPlacement
			var oldKills
            // So apparently you can actually do this in JS. Never knew.
            iterateLoop:
                for (var i=0; i < placementInfo.length; i++){
    				if (placementInfo[i].gameID == placementGameID){ // they are in this game, we want to add their team values.
    					for (var j=0; j < placementInfo[i].teams.length; j++){ // check if they have already entered a placement.
    						if (placementInfo[i].teams[j].teamID == team.id){

								oldPlacement = placementInfo[i].teams[j].placement
								oldKills = placementInfo[i].teams[j].kills

                                placementInfo[i].teams[j].placement = placement
                                placementInfo[i].teams[j].kills = kills

    							//msg.member.send(embed)
                                gamePlacementExists = true
                                updatedPlacement = true
                                break iterateLoop;

                			}
    					}
    					// They haven't already entered a placement, so let's push their value.
    					gamePlacementExists = true

    					var info = {
    						"teamID": team.id,
    						"placement": placement,
    						"kills": kills
    					}

    					placementInfo[i].teams.push(info)

    				}
    			}

			if (!gamePlacementExists){ // their GameID does not have placement info made yet.
				var info = {
					"gameID": placementGameID,
					"teams": [
						{
							"teamID": team.id,
							"placement": placement,
							"kills": kills
						}
					]
				}

				placementInfo.push(info)
			}
		}

		// Hypothetically at this point we now have modified any of the data we wanted.
		// Because we are using JSON and we are going to be "creating" a new messsage each time then
		// editing it (at least until we change how the placement embed works)
		const embed = new RichEmbed()
			.setColor(0xFFFFFF)
			.setFooter("Type -placement <position> <kills> and, if required, attach an image!")
			.setTitle("Placements for Game " + serverInfo.currentScrim.length + ":")

		// Let's start adding our data.
		// We already have placementInfo defined

		for (var i=0; i < placementInfo.length; i++){ // for all our gameid's
			var gameIDTeams = []

			for (var j=0; j < placementInfo[i].teams.length; j++){ // for all our teams in our gameid
				var teamInfo
				if (typeSolo){
					teamInfo = msg.guild.members.get(placementInfo[i].teams[j].teamID) + " - Placement: " + placementInfo[i].teams[j].placement.toString() + ". Kills: " + placementInfo[i].teams[j].kills.toString() + "."
				}
				else if (typeDuo){
                    teamInfo = getDuoInfo(serverInfo.duoTeams, placementInfo[i].teams[j].teamID).name + " - Placement: " + placementInfo[i].teams[j].placement.toString() + ". Kills: " + placementInfo[i].teams[j].kills.toString() + "."
				}
				else{
					teamInfo = msg.guild.roles.get(placementInfo[i].teams[j].teamID) + " - Placement: " + placementInfo[i].teams[j].placement.toString() + ". Kills: " + placementInfo[i].teams[j].kills.toString() + "."
				}
				gameIDTeams.push(teamInfo)
			}
            var sliceIndex = 0
            if ((sliceIndex + 10) > (gameIDTeams.length)){
                embed.addField("Game ID " + placementInfo[i].gameID + ":", gameIDTeams)
                sliceIndex += 10
            }
            else{
                embed.addField("Game ID " + placementInfo[i].gameID + ":", gameIDTeams.slice(sliceIndex, sliceIndex + 10))
                sliceIndex += 10
            }

            while ((sliceIndex + 10) < (gameIDTeams.length)){
                embed.addField('\u200B', gameIDTeams.slice(sliceIndex, sliceIndex + 10))
                sliceIndex += 10
            }

            // We should now have some remaining info probably.
            if (sliceIndex < gameIDTeams.length){
                embed.addField('\u200B', gameIDTeams.slice(sliceIndex))
            }

		}


		// Finally, edit the embed!
		// To stop an error, check to make sure we haven't restarted the game.
		if (serverInfo.gameidChannel == null){
			errorEmbed.addField(":no_entry: Error!", "**It appears that a new game has already been started, and it is therefore too late to enter placements.**\n\nGet a staff member to correct your score after the scrim.\nIn future, tell your scrim hosts to wait until everyone has entered their placement info before starting a new game.")
			return msg.replyEmbed(errorEmbed)
		}
		msg.guild.channels.get(serverInfo.gameidChannel).fetchMessage(serverInfo.placementEmbed)
			.then(msg => { msg.edit(embed)}) // edit the message. fetchMessage is a promise so we have to put it in .then
			.catch(e => {
				(e)
				msg.reply("something went wrong! It appears the placement embed has been deleted. Data will still be saved, but it won't be displayed.")
			})

		base.saveServerInfo(msg, serverInfo, () => {
                if (updatedPlacement){
                    const embed = new RichEmbed()

                    if (typeSolo){
                        embed.setTitle("Placement info for __" + (team.nickname || team.user.username) + "__ has been updated | Old Placement: " + oldPlacement + " | Old Kills: " + oldKills)
                    }
                    else {
                        embed.setTitle("Placement info for __" + team.name + "__ has been updated | Old Placement: " + oldPlacement + " | Old Kills: " + oldKills)
                    }

                    msg.embed(embed)
                }
                else{
					const embed = new RichEmbed()
					embed.setTitle("Successfully added your placement information! Placement: " + placement + " | Kills: " + kills )
					embed.setFooter("Accidently put your placement and kills the wrong way round?\nSimply retype the command with the correct order!")
                    return msg.replyEmbed(embed)
                }
		})
	}

}

function findDuoInfo(teamData, id){
    for (var info=0; info < teamData.length; info++){
        if (teamData[info].members.includes(id)){
            return teamData[info]
        }
    }
    // no data found, return null.
    return null
}
function getDuoInfo(teamData, id){
    for (var info=0; info < teamData.length; info++){
        if (teamData[info].id == id){
            return teamData[info]
        }
    }
    return null
}
