// This file was created so that we can neatly pass everything from -gameid into the module.
// This is to implement the 0.5 second timer between updates, to stop 1) delays due to edit cooldowns and 2) stop fs from being overloaded.
const { RichEmbed } = require('discord.js'); // required for message embedding.

const fs = require("fs");
const path = require("path");

const duoModule = require(path.join(__dirname, "/duos.js"))
const base = require(path.join(__dirname, "/base.js"))
const teamModule = require(path.join(__dirname, "/teamtypes.js"))

module.exports = {

    async updateGameIDS(updateData){
        var referenceMsg = updateData[0].msg // so we can get guild info and .embed it later.

        var serverInfo = base.getServerInfo(referenceMsg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

        // Define typeSolo, typeDuo and typeSquad outside the forEach so it can be used later.
        var typeSolo, typeDuo, typeSquad

        updateData.forEach( (data, key) => { // using forEach so we can return without ending the loop.
            var msg = data.msg
            var gameid = data.gameid

    		// Begin by deleting the message.
    		msg.delete()

    		// Check that a game is actually in progress.
    		if (!serverInfo.scrimInProgress){
    			return msg.reply("no scrim is in progress! If you are a scrim host, use `-newscrim <type>` to start a new scrim!")
    		}

    		// Determine what we should enter into the embed.
    		var value = null
    		var type = serverInfo.gameidType

    		var types = teamModule.getGameType( type )
    		typeSolo  = types[0]
            typeDuo   = types[1]
            typeSquad = types[2]

    		// Get our team value.
    		var value = teamModule.getTeamData(msg, typeSolo, typeDuo, typeSquad, serverInfo, true)
    		if (value == undefined){ return }

    		// Check if there are set "GameID" channels:
    		if (serverInfo.permittedChannels.length !== 0){ // there are set channels.
    			if ( !(serverInfo.permittedChannels.includes(msg.channel.id))){
    				msg.reply("you cannot use this command here!")
    					.then(newmsg => {
    						setTimeout(() => newmsg.delete(), 20000 )
    					})
    				return
    			}
    		}


    		// Let's add our new value to our database.
    		// Because of the new way we are storing all the data, if we are starting a new game we need to recreate the object.
    		// The particular system used will allow us to continue adding new games in the scrim that we can later refer back to.
            var hasChanged = false
    		if (serverInfo.gameidEmbed == null){ // new game
    			var obj =
    			{
    				"games":[
    					{
    						"gameID": gameid,
    						"teams": [value],
    					}
    				]
    			}

    			// Add the new game object to our database:
    			serverInfo.currentScrim.push(obj)

    			// See if they have access to scoreboard features.
    			// We do this so we can use the length of the currentScrim to get the current placement info.
    			if (serverInfo.paidVersion){
    				var placement =
    				{
    					"placements": []
    				}
    				serverInfo.scrimPlacements.push(placement)
    			}
    		}
    		else { // We aren't starting a new game, so we want to add new data.
    			var scrimData = serverInfo.currentScrim[serverInfo.currentScrim.length-1].games // Get the last (most recent) game data.
    			var addedValue = false // check if we need to add a new gameid.
                var addedValueFix = false


    			for (var i=0; i < scrimData.length; i++) {

    				if (scrimData[i].teams.includes(value)){ // they have already entered a value:
                        // Changed so that fixgameid becomes part of gameid
                        // If they've reentered the same GameID
                        if (scrimData[i].gameID == gameid){
                            if (typeSolo){
                                return msg.reply("you already entered that GameID!")
                                    .then(newmsg => {
                                        setTimeout(() => newmsg.delete(), 20000)
                                    })
                            }
                            else {
                                return msg.reply("you / your team have already entered that GameID!")
                                    .then(newmsg => {
                                        setTimeout(() => newmsg.delete(), 20000)
                                    })
                            }

                        }
                        // If not, let's update it by first deleting their old value.
                        else{
                            var oldGameID = scrimData[i].gameID
                            scrimData[i].teams = scrimData[i].teams.filter ( (e) => { return e !== value })

                            // If they were the only team in that gameid, make sure to remove that gameid from the list.
                            if (scrimData[i].teams.length == 0){
                                scrimData.splice(i, 1) // remove the value.
                            }
                            hasChanged = true
                            // Repeat some code to prevent issues. Probably a better way of doing this so in the future do something better kthxbai
                            for (var j=0; j < scrimData.length; j++){
                                if (scrimData[j].gameID == gameid){ // the gameID already exists, so let's add the value.
                    				scrimData[j].teams.push(value) // add the new value.
                    				addedValueFix = true
                    				break
                    			}
                            }

                            if (!addedValueFix){
                                var newid = {
                                    "gameID": gameid,
                                    "teams": [value]
                                }
                                scrimData.push(newid)
                            }
                            break // escape the for loop because we've done the next step.
                        }
    				}


                    // ADDITIONAL CHECK.
                    // Now that we can be removing our index value above (fixgameid merge), it's possible that scrimData[i] no longer exists.
                    // So we add a check to make sure we actually still have an index.
                    if (!hasChanged){
        				if (scrimData[i].gameID == gameid){ // the gameID already exists, so let's add the value.
        					scrimData[i].teams.push(value) // add the new value.
        					addedValue = true
        					break
        				}
                    }
    			}

    			if (!addedValue && !hasChanged){ // we didn't add a value, so we need to create a new gameid.
    				var newid = {
    					"gameID": gameid,
    					"teams": [value]
    				}

    				// Add the new gameid object
    				scrimData.push(newid)
    			}
    		}

            // Update to make fixgameid and gameid one file. Send a message to the user (DM's) if they updated their value.
            if (hasChanged){
                const embed = new RichEmbed()
    			var tempName = teamModule.getTeamData(msg, typeSolo, typeDuo, typeSquad, serverInfo)
    			if (typeDuo && duoModule.getDuoBehaviour(msg) || typeSquad){ // squads also uses .name
    				embed.setTitle("GameID info for __" + tempName.name + "__ has been updated | Old GameID: " + oldGameID + " | New GameID: " + gameid )
    			}
    			else { // Solos!
    				embed.setTitle("GameID info for __" + (tempName.nickname || tempName.user.username) + "__ has been updated | Old GameID: " + oldGameID + " | New GameID: " + gameid )
    			}

                msg.embed(embed)
            }





        })

        // Hypothetically at this point we now have modified any of the data we wanted.
        // Because we are using JSON and we are going to be "creating" a new messsage each time then
        // either editing it if it already exists or creating a new message, we can just create
        // the embed then decide at the end what we want to do with it.

        // This is outside of the forEach() loop, so we only update once every 0.5 seconds.
        // This should stop us from getting slowed down by the edit cooldown and stop FS from overloading.

        const embed = new RichEmbed()
            .setColor(0x00AE86)
            .setFooter("Type -gameid <4 digit code> to add your team!")
            .setTitle("GameIDs for Game **" + serverInfo.currentScrim.length + "**:")
            // Omitting timestamp because it'll just keep on changing rapidly. We can possibly put this back in if we want though.

            // Let's start adding our data.
            var scrimData = serverInfo.currentScrim[serverInfo.currentScrim.length-1].games
            for (var i=0; i < scrimData.length; i++){
                var updatedTeams = []

                for (var j=0; j < scrimData[i].teams.length; j++){
                    if (typeSquad){ // get the role
                        updatedTeams.push(referenceMsg.guild.roles.get(scrimData[i].teams[j]))
                    }
                    else if (typeDuo){
                        // Unscored duo behaviour update.
                        if (!duoModule.getDuoBehaviour(referenceMsg)){ // basically solos
                            updatedTeams.push(referenceMsg.guild.members.get(scrimData[i].teams[j]))
                        }
                        else{ // get duo info
                            // Error handling, in case getTeamInfo returns undefined.
                            var tempTeamName = duoModule.getTeamInfo(serverInfo.duoTeams, scrimData[i].teams[j])
                            updatedTeams.push("- " + (tempTeamName && tempTeamName.name || "<deleted team>"))
                        }
                    }
                    else { // get the username.
                        updatedTeams.push(referenceMsg.guild.members.get(scrimData[i].teams[j]))
                    }
                }

                if (typeSolo){
                    var sliceIndex = 0
                    if ((sliceIndex + 10) > (updatedTeams.length)){
                        embed.addField("Players in GameID **__" + scrimData[i].gameID + "__**: (Total: " + updatedTeams.length.toString() + ")", updatedTeams.sort())
                        sliceIndex += 10
                    }
                    else{
                        embed.addField("Players in GameID **__" + scrimData[i].gameID + "__**: (Total: " + updatedTeams.length.toString() + ")", updatedTeams.sort().slice(sliceIndex, 10))
                        sliceIndex += 10
                    }

                    while ((sliceIndex + 10) < (updatedTeams.length)){
                        embed.addField('\u200B', updatedTeams.slice(sliceIndex, sliceIndex + 10))
                        sliceIndex += 10
                    }

                    // We should now have some remaining info probably.
                    if (sliceIndex < updatedTeams.length){
                        embed.addField('\u200B', updatedTeams.slice(sliceIndex))
                    }
                }
                else{
                    // Let's actually make this work lol.
                    var sliceIndex = 0
                    if ((sliceIndex + 10) > (updatedTeams.length)){
                        embed.addField("Teams in GameID **__" + scrimData[i].gameID + "__**: (Total: " + updatedTeams.length.toString() + ")", updatedTeams.sort())
                        sliceIndex += 10
                    }
                    else{
                        embed.addField("Teams in GameID **__" + scrimData[i].gameID + "__**: (Total: " + updatedTeams.length.toString() + ")", updatedTeams.sort().slice(sliceIndex, 10))
                        sliceIndex += 10
                    }

                    while ((sliceIndex + 10) < (updatedTeams.length)){
                        embed.addField('\u200B', updatedTeams.slice(sliceIndex, sliceIndex + 10))
                        sliceIndex += 10
                    }

                    // Probably have remaining info.
                    if (sliceIndex < updatedTeams.length){
                        embed.addField('\u200B', updatedTeams.slice(sliceIndex))
                    }
                }

            }


        // Next, check if we have restarted the collection process and should create a new message.
        if (serverInfo.gameidEmbed == null){ // we have restarted the process:
            // We want to create a "placement" embed as well.
            const placementEmbed = new RichEmbed()
                .setColor(0xFFFFFF)
                .setFooter("Type -placement <position> <kills> and, if required, attach an image! Created by @Feldma#1776.")
                .setTitle("Placements for Game **" + serverInfo.currentScrim.length + "**:")


            var sendChannel = referenceMsg.guild.channels.get(serverInfo.gameidChannel)
            var message = await sendChannel.send(embed)
                .then(async newmessage => { // needs to be async so it doesn't complain about the below await
                    serverInfo.gameidEmbed = newmessage.id;
                    serverInfo.gameidChannel = newmessage.channel.id;
                    // If they have the premium version of ScrimBot Beta...
                    if (serverInfo.paidVersion && serverInfo.trackScores){
                        var placementmessage = await sendChannel.send(placementEmbed) // then send the placement message.
                        .then(newplacement => {
                            serverInfo.placementEmbed = newplacement.id
                        })
                    }
                })



        }
        else{
            referenceMsg.guild.channels.get(serverInfo.gameidChannel).fetchMessage(serverInfo.gameidEmbed).then(msg => { msg.edit(embed)}) // edit the message. fetchMessage is a promise so we have to put it in .then
        }

        base.saveServerInfo(referenceMsg, serverInfo, () => {})

	}
}
