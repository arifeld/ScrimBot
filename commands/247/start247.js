const { Command, SQLiteProvider } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

// Required for JSON stuff.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))
const teamModule        = require(path.join(__dirname, "../../scrimbot_modules/teamtypes.js"))
const leaderboardModule = require(path.join(__dirname, "../../scrimbot_modules/leaderboard.js"))


module.exports = class Start247 extends Command {
	constructor(client) {
		super(client, {
			name: "start247",
			group: "247",
			memberName: "start247",
			description: "Starts the 24/7 configuration using the specified type, whether the games should be scored, the channel to countdown in, and optionally how long between games.",
            guildOnly: true,
			args: [
				{
					key: "type",
					prompt: "what type of 24/7 scrim? (Solo, duo or squads).",
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
					prompt: "do you want the 24/7 scrims to be scored?\nOptions: `yes` for scored, `no` for unscored.",
					type: "boolean",
				},
                {
                    key: "channel",
                    prompt: "what channel should the countdown be made in? (Must be a voice channel).",
                    type: "channel",
                },
                {
                    key: "announcechannel",
                    prompt: "which channel should text announcements be made before games start? (Must be a text channel).",
                    type: "channel",
                },
                {
                    key: "interval",
                    prompt: "how often do you want games to be run (in minutes)? Default is every 32 minutes.",
                    type: "integer",
                    parse: num => {
                        return (num * 60000) + 15000  // converts minutes to milliseconds. Extra 15000 is for adjusting to the 15 second countdown file.
                    },
                    default: 1695000
                }

			],
		})
	}


	run(msg, args) {
		const { type, scored, channel, announcechannel, interval } = args;

		// Delete the message to make it neat.
		msg.delete()

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

        // Check that the channel is a voice channel (because it doesn't work when validating above).
        if (channel.type !== "voice"){
            return msg.reply("the channel you specified (" + channel + ") is not a voice channel!")
        }

        if (announcechannel.type !== "text"){
            return msg.reply("the announce channel you specified (" + announcechannel + ") is not a text channel!")
        }

		var types = teamModule.getGameType( type )
		var typeSolo = types[0], typeDuo = types[1], typeSquad = types[2]

		var hasHost = base.memberIsHost(msg)
		if (!hasHost){
			return msg.reply("you must be a scrim host or admin to use this command!")
		}

        // BEGIN PASTE
        if (serverInfo.paidVersion && serverInfo.scrimPlacements.length > 0 && serverInfo.trackScores){
			// yay, infinite iteration!

			var scrimGames = serverInfo.currentScrim
			var scrimPlacements = serverInfo.scrimPlacements
			var squadLeaderboardInfo = serverInfo.squadLeaderboard

			// Grab our point structure and saved leaderboard info.
			var infos = teamModule.returnInfoTypes(serverInfo, typeSolo, typeDuo, typeSquad)
	        var pointInfo = infos[0], leadInfo = infos[1]



		var teamPoints = leaderboardModule.calculateTeamScores(msg, serverInfo, typeSolo, typeDuo, typeSquad)


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
		serverInfo.gameidChannel = null
		serverInfo.gameidType = type

		// Reset our currentScrim value.
		serverInfo.currentScrim = []

		serverInfo.scrimPlacements = []
		serverInfo.trackScores = scored

        // END OF PASTE
        // Remove any previous timers we may have.
        if ( msg.guild.autoTimer !== undefined && msg.guild.autoTimer !== 0){
            clearInterval(msg.guild.autoTimer)
            clearInterval(msg.guild.fiveMinuteTimer)
            clearInterval(msg.guild.oneMinuteTimer)
        }


        // Create a timer with all the functions inside it.
        msg.guild.autoTimer = setInterval( () => {
            // When the timer runs, we want to start a new game.
            // Let's do that!
            beginMatch(channel, msg.guild)
            // Reset the gameid collector.
            serverInfo.gameidEmbed = null
    		serverInfo.gameidChannel = null

			base.saveServerInfo(msg, serverInfo, () => {
    				const embed = new RichEmbed()
    					.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
    					.setColor(0xFF0000)
    					.setFooter("Created by @Feldma#1776.")
    					.addField( msg.member.displayName + " has restarted the Game ID Collector!", "**Add your Game ID's with -gameid <4 digit code>**")
    					.addField( "Game Type:", type[0].toUpperCase() + type.substr(1), true )
    					.addField( "Game Number:", serverInfo.currentScrim.length+1, true) // We +1 because we don't actually add anything to the array until someone types -gameid
    				return msg.embed(embed)
                        .catch(console.log)

    		})

            // We now want to create Timeouts for the 5 minute / 1 minute warnings.
            // 5 minute warning.
            if ((interval - 300000) > 0 ){ // if the interval is actually greater than 5 minutes
                msg.guild.fiveMinuteTimer = setTimeout( () => {
                    fiveMinuteWarning(channel, msg.guild)
                }, interval - 300000)
            }

            if ((interval - 60000) > 0 ){ // no idea why you would ever set an interval this low, but let's just be safe.
                msg.guild.oneMinuteTimer = setTimeout( () => {
                    oneMinuteWarning(channel, msg.guild)
                    if (msg.guild.autoTimer !== 0){
                        announcechannel.send("@here - one minute until the next game starts! Join the countdown room now!")
                    }
                }, interval - 60000)
            }


        }, interval)

        // Play the match starting timer (once off)
        beginMatch(channel, msg.guild)
        // Save the fact that we are in a 24/7.
        serverInfo.current247 = true
        // We now want to create Timeouts for the 5 minute / 1 minute warnings.
        // 5 minute warning.
        if ((interval - 300000) > 0 ){ // if the interval is actually greater than 5 minutes
            msg.guild.fiveMinuteTimer = setTimeout( () => {
                fiveMinuteWarning(channel, msg.guild)
            }, interval - 300000)
        }

        if ((interval - 60000) > 0 ){ // no idea why you would ever set an interval this low, but let's just be safe.
            msg.guild.oneMinuteTimer = setTimeout( () => {
                oneMinuteWarning(channel, msg.guild)
                announcechannel.send("@here - one minute until the next game starts! Join the countdown room now!")
            }, interval - 60000)
        }


		base.saveServerInfo(msg, serverInfo, () => {
				const embed = new RichEmbed()
					.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
					.setColor(0xFF0000)
					.setTitle( "The 24/7 system has been enabled!" )
					.addField( "Game Type:", type[0].toUpperCase() + type.substr(1), true )
					.addField( "Scored?", (scored && "Yes" || "No"))
					.addField( "Voice Channel:", channel)
					.addField( "Text Announcement Channel:", announcechannel)
					.addField( "Interval between games (in minutes):", ((interval - 15000) / 60000 ))
				return msg.embed(embed)
					.catch(console.log)

		})

    }


}

// Countdown from 10
function beginMatch(voice, guild){
    if (voice && guild.autoTimer !== 0){
        var matchAudio = path.join(__dirname, "../../audio/", "MatchStarting.mp3")
        voice.join()
            .then(connection => {
                const dispatcher = connection.playFile(matchAudio)

                dispatcher.on("end", () => {
                    connection.disconnect()
                })
            })
            .catch(console.log)
    }
}

// Five minute warning.
function fiveMinuteWarning(voice, guild){
    if (voice && guild.autoTimer !== 0){
        var matchAudio = path.join(__dirname, "../../audio/", "FiveMinute.mp3")
        voice.join()
            .then(connection => {
                const dispatcher = connection.playFile(matchAudio)

                dispatcher.on("end", () => {
                    connection.disconnect()
                })
            })
            .catch(console.log)
    }
}

// One minute warning.
function oneMinuteWarning(voice, guild){
    if (voice && guild.autoTimer !== 0){
        var matchAudio = path.join(__dirname, "../../audio/", "OneMinute.mp3")
        voice.join()
            .then(connection => {
                const dispatcher = connection.playFile(matchAudio)

                dispatcher.on("end", () => {
                    connection.disconnect()
                })
            })
            .catch(console.log)
    }
}
