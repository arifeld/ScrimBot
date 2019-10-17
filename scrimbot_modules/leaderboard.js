/*
    File for leaderboard-related functions.
*/

const { RichEmbed } = require("discord.js")
const path = require("path")
const duoModule     = require(path.join(__dirname, "/duos.js"))
const teamModule    = require(path.join(__dirname, "/teamtypes.js"))



module.exports = {

    // getPointData()

    // calculateTeamScores(msg, serverInfo, typeSolo, typeDuo, typeSquad)
    // Calculates all team scores based on current data and returns an array of data.
    // This should allow us to create changes between all implementations of the same code.
    calculateTeamScores(msg, serverInfo, typeSolo, typeDuo, typeSquad){
        var teamPoints = [] // our array of teams and their total points, to be returned.

        // Pointers.
        var scrimGames = serverInfo.currentScrim // GAMEIDS
		var scrimPlacements = serverInfo.scrimPlacements // PLACEMENTS

        // Grab our point structure and saved leaderboard info.
        var infos = teamModule.returnInfoTypes(serverInfo, typeSolo, typeDuo, typeSquad)
        var pointInfo = infos[0], leadInfo = infos[1]

        // For reference, this is what scrimPlacements looks like:
        /*
            scrimPlacements: [                      - LEVEL 1
                "game1": [                          - LEVEL 2
                    "cool gameid": [                - LEVEL 3
                            "team1 data": {}        - LEVEL 4
                        ]
                ]
            ]
        */

        // We rely on the fact that indexes between game number and placement number are the same - as in, if we are looking at placement game 1 (scrimPlacements), the currentScrim index should correlate to the same game.

        // Start at level 1, create a for loop to iterate over ever game (where game refers to a round - i.e. when all players press "play" that is the beginning of a game.)
        // Could be a .forEach() loop but I prefer this loop in this instance.
        for (var gameNum in scrimPlacements){
            var curPlacements = scrimPlacements[gameNum].placements
            for (var id in curPlacements){ // Level 2, looking at each specific gameid.
                var gameid = curPlacements[id].gameID // Grab the GameID for later use.
                for (var team in curPlacements[id].teams){ // Level 3, looking at each individual team now.
                    var teamInfo = curPlacements[id].teams[team] // "Now" at Level 4, at each persons data. Realistically Level 1 doesn't really exist in this explanation and our first for loop actually starts at level 2. But anyway.

                    var teamid = teamInfo.teamID
                    var placement = teamInfo.placement
                    var kills = teamInfo.kills

                    // Copy-paste below.

                    // Check how many people were in their lobby.
					var lobbyAmount = 0
					for (var j=0; j < scrimGames[gameNum].games.length; j++){ // for each gameid in currentScrim
						if (scrimGames[gameNum].games[j].teams.includes(teamid)){ // if the current iterated gameid group in currentScrim contains the teamID of the placement we're looking at:
							lobbyAmount = scrimGames[gameNum].games[j].teams.length
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
                            msg.reply("something went wrong! Team " + getDuoInfo(serverInfo.duoTeams, teamid).name + " has a placement with no associated game!")
                        }
                        else{
                            msg.reply("something went wrong! " + msg.guild.members.get(teamid) + " has a placement with no associated game!")
                        }
                    }

					// At this point, we should have how many people were in their lobby.
					// Let's see how many points to give them.
					var teamScore = 0

                    var linearSystem = false
					var linearSystemKills = false
                    if ("useLinear" in serverInfo){
                        if (serverInfo.useLinear){
                            linearSystem = true
                        }
                    }

					if ("useLinearKills" in serverInfo){
						if (serverInfo.useLinearKills){
							linearSystemKills = true
						}
					}

                    if (linearSystem && !typeSquad){ // could combine into one if, but it'd be not very neat.
                        if (typeSolo){
                            teamScore += lobbyAmount * Math.pow(0.9, (placement-1))
							if (linearSystemKills){
								teamScore += lobbyAmount * 0.15 * kills
							}
                        }
                        else if (typeDuo){
                            teamScore += lobbyAmount * Math.pow(0.8, (placement-1))
							if (linearSystemKills){
								teamScore += lobbyAmount * 0.11 * kills
							}
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


					// For now, we aren't going to save any data, simply add it and display it.

					// Because we are iterating over multiple games, we almost certainly will encounter a team twice.
					// So, if they already have a value in teamPoints, we want to add to it, otherwise we want to get their saved leaderboard info.

					var exists = -1
					for (var k=0; k < teamPoints.length; k++){
						if (teamPoints[k].team == teamid){
							exists = k // So we don't have to reiterate over the entire array.
							break
						}
					}
					if (exists !== -1){ // they alreauhdy have a value, so add their additional points.
						teamPoints[exists].points += teamScore
					}

					else {
						// Get their leaderboard info
						var teamPointInfo = 0
						for (var teamPast in leadInfo){
							if (leadInfo[teamPast].team == teamid){ // if the selected team is the one we want
								teamPointInfo = leadInfo[teamPast].points // get their previous points.
								break
							}
						}
						var obj = {
							"team": teamid,
							"points": Number(teamPointInfo + teamScore)
						}
						// Push their data.
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
		// We should be able to iterate over this to create an embed.
		// However, we first want to sort them.
		teamPoints.sort(module.exports.comparePlacement)
		return teamPoints

    },

    // round(value, decimals)
    // Utility function to round a value to a certain amount of decimals.
    round(value, decimals){
        return value.toFixed(decimals)
    },

    // comparePlacement(a, b)
    // Used in .sort() to calculate placement based off points.
    comparePlacement(a, b){
        if (a.points > b.points){ return -1 } // a has less points
	    else if (a.points < b.points){ return 1 } // b has less points
	    else{ return 0 }// both are equal, ideally we'd sort by name butttt we probably can't (not like this) because we only had teamID not the name, and we can't call msg.guild
    },

    // generateLeaderboardEmbed(client, msg, serverInfo, typeSolo, typeDuo, typeSquad, pointInfo, teamPoints)
    generateLeaderboardEmbed(client, msg, serverInfo, typeSolo, typeDuo, typeSquad, pointInfo, teamPoints, postScrim){
        const embed = new RichEmbed()
			//.setAuthor(client.user.username, client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
			.setColor(0xFF0000)
            if (postScrim){
                embed.setFooter("Leaderboard generated with no new data!")
            }
            else{
                embed.setFooter("Type -placement <position> <kills> and, if required, attach an image! Created by @Feldma#1776.")
            }

		var pos = 1
		var previousScore = 0
		var completeInfo = []

		if (teamPoints.length == 0){
			embed.addField(":no_entry: Error!", "There is no leaderboard information to display!")
			return msg.embed(embed)
		}
        // We create a temporary position variable so that we only add valid values.
        // If we come across an undefined or null value, we skip that iteration.
        // If we don't, we add to our list.
        var tempPos = 0
		for (var i=0, n = teamPoints.length; i < n; i++){
            // Get the team data we want.
            var teamData

            if (typeSolo){
                teamData = msg.guild.members.get(teamPoints[i].team)
                if (teamData !== undefined){
                    tempPos += 1
                }
                else{
                    continue
                }
            }
            else if (typeDuo){
                var temp = duoModule.getTeamInfo(serverInfo.duoTeams, teamPoints[i].team)
                if (temp !== null){
                    teamData = temp.name // we won't get any cool embbeded data since this is custom.
                    tempPos += 1
                }
                else {
                    continue // next iteration, we don't want to display this.
                }
            }
            else{ // squads
                teamData = msg.guild.roles.get(teamPoints[i].team)
                if (teamData !== undefined){
                    tempPos += 1
                }
                else{
                    continue
                }
            }

            if (teamPoints[i].points !== previousScore){ // if they have moved down a rank,
                pos = tempPos
                previousScore = teamPoints[i].points
            }

            var results
            if (teamPoints[i].points == 1){ // for correct grammar
                results = "**" + pos + "**: " + teamData + " - " + teamPoints[i].points.toString() + " point."
            }
            else{

                if (typeSquad){
                    results = "**" + pos + "**: " + teamData + " - " + module.exports.round(teamPoints[i].points, 0) + " points." // the round operator returns a string. 0 decimal places.
                }
                else{
                    results = "**" + pos + "**: " + teamData + " - " + module.exports.round(teamPoints[i].points, 2) + " points." // the round operator returns a string.
                }
            }
			completeInfo.push(results)
		}
		var sliceIndex = 0

		if ((sliceIndex + 10) > (completeInfo.length - sliceIndex)){
            // Change our text depending on if we are postscrim or not.
            if (postScrim){
                embed.addField("Leaderboard - Post Scrim:", completeInfo)
            }
            else{
                embed.addField("Leaderboard as of Game " + serverInfo.currentScrim.length + ":", completeInfo)
            }
			sliceIndex += 10
		}
		else{
            // Change our text depending on if we are postscrim or not.
            if (postScrim){
                embed.addField("Leaderboard - Post Scrim:", completeInfo.slice(sliceIndex, sliceIndex+10))
            }
            else{
                embed.addField("Leaderboard as of Game " + serverInfo.currentScrim.length + ":", completeInfo.slice(sliceIndex, sliceIndex+10))
            }
			sliceIndex += 10
		}

		while ((sliceIndex + 10) < (completeInfo.length)){
			embed.addField('\u200B', completeInfo.slice(sliceIndex, sliceIndex + 10))
			sliceIndex += 10
		}

		// We should now have some remaining info probably.
		if (sliceIndex < completeInfo.length){
			embed.addField('\u200B', completeInfo.slice(sliceIndex))
		}

		return msg.embed(embed)
    }






}
