const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

// ScrimBot Modules.
const base              = require(path.join(__dirname, "../../scrimbot_modules/base.js"))
const duoModule         = require(path.join(__dirname, "../../scrimbot_modules/duos.js"))
const teamModule        = require(path.join(__dirname, "../../scrimbot_modules/teamtypes.js"))
const leaderboardModule = require(path.join(__dirname, "../../scrimbot_modules/leaderboard.js"))

module.exports = class NewScrim extends Command {
	constructor(client) {
		super(client, {
			name: "newscrim",
			group: "scrims",
			memberName: "newscrim",
			description: "Completely restarts the GameID collection system and saves leaderboard info.",
			examples: ["newscrim"],
            guildOnly: true,
			args: [
				{
					key: "type",
					prompt: "what type of scrim? (Solo, duo or squads).",
					type: "string",
					validate: text => {
						if (text.indexOf("solo") !== -1 || text.indexOf("duo") !== -1 || text.indexOf("squad") !== -1 ) return true;
						return "Invalid game type! Avaliable options: solo, duo or squads."
					},

					parse: text => {
						if (text.indexOf("solo") !== -1){
							return "solo"
						}
						else if (text.indexOf("duo") !== -1){
							return "duo"
						}
						else {
							return "squads"
						}
					}

				},
				{
					key: "scored",
					prompt: "do you want the scrim to be scored?\nOptions: `yes` for scored, `no` for unscored.",
					type: "boolean",
				},
                {
                    key: "location",
                    prompt: "where do you want the GameID embed to be shown?\nIt is recommended that this is a unique channel and **not** the one where GameID's are inputted.",
                    type: "channel",
                    validate: (channel, msg) => {
                        // Using msg.member.guild because msg doesn't seem to return just guild itself.
                        // We also use regex because channel returns a <$1237189248761923> string.
                        if (msg.member.guild.channels.get(channel.replace(/\D/g, '')).type == "text"){ return true }
                            return "You selected an invalid channel! Please type the full name of a text channel, such as #game-embed."
                        }
                }
			],
		})
	}


	run(msg, args) {
		const { type, scored, location } = args;

		// Delete the message to make it neat.
		msg.delete()

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){
		    return msg.reply("this server has not been configured. Type -configure first before using this command!")
		}

        var types = teamModule.getGameType( serverInfo.gameidType )
		var typeSolo = types[0], typeDuo = types[1], typeSquad = types[2]

        if (!base.memberIsHost(msg)){
            return msg.reply("you must be a scrim host or have the \"Manage Channel\" permission to use this command!")
        }


		// Let's save the leaderboard if we need to.

		if (serverInfo.paidVersion && serverInfo.scrimPlacements.length > 0 && serverInfo.trackScores){
			// yay, infinite iteration!
			var oldLength = serverInfo.scrimPlacements.length

			// Grab our point structure and saved leaderboard info.
			var infos = teamModule.returnInfoTypes(serverInfo, typeSolo, typeDuo, typeSquad)
	        var pointInfo = infos[0], leadInfo = infos[1]

			var teamPoints = leaderboardModule.calculateTeamScores(msg, serverInfo, typeSolo, typeDuo, typeSquad)

			/*
			var teamPoints = [] // our array of teams and their total points.
			// Let's iterate over our scrimPlacements and add values to our teams.
			for (var gamenum in scrimPlacements){ // for each scrimPlacement (game)
				for (var i=0; i < scrimPlacements[gamenum].placements.length; i++){ // for each teams placement
					var gameid = scrimPlacements[gamenum].placements[i].gameID
					for (var team in scrimPlacements[gamenum].placements[i].teams){
						var teamInfo = scrimPlacements[gamenum].placements[i].teams[team]
						var teamid = teamInfo.teamID
						var placement = teamInfo.placement
						var kills = teamInfo.kills

						// Check how many people were in their lobby.
						var lobbyAmount = 0
						for (var j=0; j < scrimGames[gamenum].games.length; j++){ // for each gameid in currentScrim
							if (scrimGames[gamenum].games[j].teams.includes(teamid)){ // if the current iterated gameid group in currentScrim contains the teamID of the placement we're looking at:
								lobbyAmount = scrimGames[gamenum].games[j].teams.length
								break // shouldn't have anymore values anyway.
							}
						}


						// Let's just check that they actually have a valid lobby.
						if (lobbyAmount <= 0){
							if (typeSquad){
								msg.reply("something went wrong! Team " + msg.guild.roles.get(teamid) + " has a placement with no associated game!")
							}
							else if (typeDuo){
								// TODO implement duo system.
                                msg.reply("something went wrong! Team " + duoModule.getTeamInfo(duoTeams, teamid).name + " has a placement with no associated game!")
							}
							else{
								msg.reply("something went wrong! " + msg.guild.members.get(teamid) + " has a placement with no associated game!")
							}
						}


						// At this point, we should have how many people were in their lobby.
						// Let's see how many points to give them.
						var teamScore = 0

                        var linearSystem = false
                        if ("useLinear" in serverInfo){
                            if (serverInfo.useLinear){
                                linearSystem = true
                            }
                        }

                        if (linearSystem && !typeSquad){ // could combine into one if, but it'd be not very neat.
                            if (typeSolo){
                                teamScore += lobbyAmount * Math.pow(0.9, (placement-1))
                            }
                            else if (typeDuo){
                                teamScore += lobbyAmount * Math.pow(0.8, (placement-1))
                            }
                            else{
                                return msg.reply("something went wrong! The linear scoring algorithm was being used in a squad game! This should not occur!")
                            }
                        }
                        else{
                            for (var points in pointInfo){
                                    if (pointInfo[points].minTeams <= lobbyAmount){
            							if (placement == 1){
            								teamScore += pointInfo[points].firstPoints
            								// Give them points for kills
            								if (kills > 0 && pointInfo[points].killsPerPoints > 0){ // so we don't divide by 0.
            									// I figured this out. If you divide by the amount of kills per points, then floor, you'll have many times points you want.
            									// Then you multiply to get your total point kills.
            									teamScore += (Math.floor((kills / pointInfo[points].killsPerPoints)) * pointInfo[points].pointsPerAmountKills)

            								}

            								break

            							}

            							else if (placement == 2){
            								teamScore += pointInfo[points].secondPoints
            								if (kills > 0 && pointInfo[points].killsPerPoints > 0){ // so we don't divide by 0.
            									teamScore += (Math.floor((kills / pointInfo[points].killsPerPoints)) * pointInfo[points].pointsPerAmountKills)
            								}
            								break
            							}


            							else if (placement == 3){
            								teamScore += pointInfo[points].thirdPoints
            								if (kills > 0 && pointInfo[points].killsPerPoints > 0){ // so we don't divide by 0.
            									teamScore += (Math.floor((kills / pointInfo[points].killsPerPoints)) * pointInfo[points].pointsPerAmountKills)
            								}
            								break
            							}

            							else{ // give them points for kills.
            								if (kills > 0 && pointInfo[points].killsPerPoints > 0){ // so we don't divide by 0.
            									teamScore += (Math.floor((kills / pointInfo[points].killsPerPoints)) * pointInfo[points].pointsPerAmountKills)

            								}
            							}
            						}
            					}
                        }

						// Because we are iterating over multiple games, we almost certainly will encounter a team twice.
						// So, if they already have a value in teamPoints, we want to add to it, otherwise we want to get their saved leaderboard info.
						var exists = -1
						for (var k=0; k < teamPoints.length; k++){
							if (teamPoints[k].team == teamid){
								exists = k // So we don't have to reiterate over the entire array.
								break
							}
						}

						if (exists !== -1){ // they already have a value, so add their additional points.
							teamPoints[exists].points += teamScore
						}

						else {
							// Get their leaderboard info
							var teamPointInfo = 0
							for (var s=0; s<leadInfo.length;s++){
								if (leadInfo[s].team == teamid){ // if the selected team is the one we want
									teamPointInfo = leadInfo[s].points // get their previous points.
									break
								}
							}
							var obj = {
								"team": teamid,
								"points": Number(teamPointInfo + teamScore)
							}

							teamPoints.push(obj)
						}

					}
				}
			}

		// We also need to iterate over the entire squadLeaderboard to see if the team wasn't a part of the scrims.
		for (var leaderboardPlace = 0; leaderboardPlace < leadInfo.length; leaderboardPlace ++){
			var teamAlreadyIn = false
			for (var teamInformation in teamPoints){
				if (teamPoints[teamInformation].team == leadInfo[leaderboardPlace].team){
					teamAlreadyIn = true
					break
				}
			}
			if (!(teamAlreadyIn)){
				teamPoints.push(leadInfo[leaderboardPlace])
			}
		}

		// So hopefully at this point, we now have an array of teamPoints.
		teamPoints.sort(leaderboardModule.comparePlacements)*/

		// Hypothetically, this is exactly what we want to save. So let's do that.
        if (typeSolo){
            serverInfo.soloLeaderboard = teamPoints
        }
        else if (typeDuo){
            serverInfo.duoLeaderboard = teamPoints
        }
        else{
            serverInfo.squadLeaderboard = teamPoints
        }


		}

		serverInfo.scrimInProgress = true
		serverInfo.gameidEmbed = null
		serverInfo.gameidChannel = location.id
		serverInfo.gameidType = type

		// Reset our currentScrim value.
		serverInfo.currentScrim = []

		serverInfo.scrimPlacements = []
		serverInfo.trackScores = scored

        base.saveServerInfo(msg, serverInfo, () => {
            const embed = new RichEmbed()
                .setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
                .setColor(0x000FF)
                .setFooter("Created by @Feldma#1776.")
                .addField( msg.member.displayName + " has created a new scrim!", "**Add your Game ID's with -gameid <4 digit code>**")
                .addField( "Scrim Type:", type[0].toUpperCase() + type.substr(1), true )
                .addField( "Game Number:", serverInfo.currentScrim.length+1, true) // We +1 because we don't actually add anything to the array until someone types -gameid

            if (serverInfo.paidVersion && oldLength > 0 ){
                embed.addField('\u200B', "\n:white_check_mark: Successfully saved leaderboard information.")
            }
            return msg.embed(embed)
        })
    }
}
