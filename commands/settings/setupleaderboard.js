const { Command } = require("discord.js-commando");

// Import stuff we need for  JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))
const teamModule = require(path.join(__dirname, "../../scrimbot_modules/teamtypes.js"))

module.exports = class SetupLeaderboard extends Command {
	constructor(client) {
		super(client, {
			name: "setupleaderboard",
			group: "settings",
			memberName: "setupleaderboard",
			description: "A one-time use command that guides you through the leaderboard setup process.",
			examples: ["setupleaderboard"],
            guildOnly: true,
			args: [
				{
					key: "accept",
					prompt: "**welcome to the ScrimBot leaderboard setup command.**\n\n" +
							"Before running this command, please acknowledge the following:\n" +
                            "As stated in the `-configure` command, in order to use ScrimBot to run squad scrims, server roles for each team are required and must be at the bottom of the role list.\n" +
                            "Confused what this means? Take a look at this photo: <https://imgur.com/NEFoEuQ>\n\n" +
                            "Additionally, ScrimBot now supports a **linear-based** system that properly takes the amount of teams in a lobby into account. **It only works for solo and duo scrims!**\n" +
                            "If you would like to use this system, cancel the command and type `-setlinear yes`.\n" +
							"Otherwise, if you would like to use the legacy version (or you are running squad scrims), please type 'yes'.",

					type: "string",
					validate: text => {
						if (text.indexOf("y") == -1){
							return "unknown response. If you understand, please type '**yes**', else type '**cancel**'."
						}
						return true
					},
					wait: 500,


				},

                    // Figure out what type of gamemode they are setting it up for.
                {
					key: "type",
					prompt: "what gamemode do you want to configure? Options are solo, duo or squads.",
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


					// FIRST LOBBY SETUP
				{
					key: "minimum1",
					prompt: "**what is the minimum amount of teams in the main lobby?**\n\n" +
							"For example, if the main lobby is 5 or more teams, you should enter **5**.",

					type: "integer",
					wait: 500,
					validate: text => {
						if (text == 0){ return "The main lobby cannot have 0 teams! If you want all lobbies to be 'main', enter **1**!" }
						return true
					}

				},


				{
					key: "first1",
					prompt: "**how many points should the winning team get in the main lobby?**\n\n" +
							"For example, if you want the winning team to get 10 points, you should enter **10**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "second1",
					prompt: "**how many points should the team that comes second in the main lobby get?**\n\n" +
							"For example, if you want the second place team to get 5 points, you should enter **5**.\n" +
							"If you do not want them to get any points, enter **0**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "third1",
					prompt: "**how many points should the team that comes third in the main lobby get?**\n\n" +
							"For example, if you want the third place team to get 2 points, you should enter **2**.\n" +
							"If you do not want them to get any points, enter **0**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "killsperpoints1",
					prompt: "**how many kills does a team need to get to get <X> amount of points in a main lobby?**\n\n" +
							"For example, if you want a team to get 1 point for every **2 kills**, enter **2** now (for two kills).\n" +
							"The next option will set how many points per this amount of kills.\n" +
							"If you do not want them to get any points for kills, enter **0**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "pointsperkills1",
					prompt: "**how many points should a team get for the amount of kills specified beforehand?**\n\n" +
							"For example, if you want a team to get **1 point** for every 2 kills, enter **1** now (for one point).\n" +
							"If you do not want them to get any points for kills, enter **0**.",

					type: "integer",
					wait: 500,

				},
					// SECONDARY LOBBY SETUP
				{
					key: "minimum2",
					prompt: "**what is the minimum amount of teams in the secondary lobby?**\n\n" +
							"For example, if the secondary lobby is 3 or more teams, you should enter **3**.\n" +
							"The maximum amount of teams for a secondary lobby is set by the minimum amount of teams in a main lobby\n\n"+
							"**If you do not want points for a secondary lobby, answer **0** for this question. You will still need to answer the secondary lobby questions, but no points will be awarded for secondary lobbies**",

					type: "integer",
					parse: (val) => {
						if (val == 0){
							return 100000 // practically disables secondary lobbies if they don't want one.
						}
						else{ return parseInt(val) }
					},
					wait: 500,

				},


				{
					key: "first2",
					prompt: "**how many points should the winning team get in the secondary lobby?**\n\n" +
							"For example, if you want the winning team to get 10 points, you should enter **10**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "second2",
					prompt: "**how many points should the team that comes second in a secondary lobby get?**\n\n" +
							"For example, if you want the second place team to get 5 points, you should enter **5**.\n" +
							"If you do not want them to get any points, enter **0**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "third2",
					prompt: "**how many points should the team that comes third in a secondary lobby get?**\n\n" +
							"For example, if you want the third place team to get 2 points, you should enter **2**.\n" +
							"If you do not want them to get any points, enter **0**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "killsperpoints2",
					prompt: "**how many kills does a team need to get to get <X> amount of points in a secondary lobby?**\n\n" +
							"For example, if you want a team to get 1 point for every **2 kills**, enter **2** now (for two kills).\n" +
							"The next option will set how many points per this amount of kills.\n" +
							"If you do not want them to get any points for kills, enter **0**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "pointsperkills2",
					prompt: "**how many points should a team get for the amount of kills specified beforehand?**\n\n" +
							"For example, if you want a team to get **1 point** for every 2 kills, enter **1** now (for one point).\n" +
							"If you do not want them to get any points for kills, enter **0**.",

					type: "integer",
					wait: 500,

				},

				// LONE LOBBY SETUP
				{
					key: "minimum3",
					prompt: "**what is the minimum amount of teams in the 'lone' lobbies?**\n\n" +
							"Lone lobbies will be considered from the number you enter up till the minimum number of teams in the secondary lobby.\n" +
							"Unless you don't want points for lone lobbies, you should probably enter '**1**' here.\n\n"+
							"**If you do not want points for a lone lobby, answer **0** for this question. You will still need to answer the lone lobby questions, but no points will be awarded for lone lobbies**",

					type: "integer",
					parse: (val) => {
						if (val == 0){
							return 100000 // practically disables lone lobbies if they don't want one.
						}
						else{ return parseInt(val) }
					},
					wait: 500,

				},


				{
					key: "first3",
					prompt: "**how many points should the winning team get in a lone lobby?**\n\n" +
							"For example, if you want the winning team to get 10 points, you should enter **10**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "second3",
					prompt: "**how many points should the team that comes second in a lone lobby get?**\n\n" +
							"For example, if you want the second place team to get 5 points, you should enter **5**.\n" +
							"If you do not want them to get any points, enter **0**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "third3",
					prompt: "**how many points should the team that comes third in a lone lobby get?**\n\n" +
							"For example, if you want the third place team to get 2 points, you should enter **2**.\n" +
							"If you do not want them to get any points, enter **0**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "killsperpoints3",
					prompt: "**how many kills does a team need to get to get <X> amount of points in a lone lobby?**\n\n" +
							"For example, if you want a team to get 1 point for every **2 kills**, enter **2** now (for two kills).\n" +
							"The next option will set how many points per this amount of kills.\n" +
							"If you do not want them to get any points for kills, enter **0**.",

					type: "integer",
					wait: 500,

				},

				{
					key: "pointsperkills3",
					prompt: "**how many points should a team get for the amount of kills specified beforehand?**\n\n" +
							"For example, if you want a team to get **1 point** for every 2 kills, enter **1** now (for one point).\n" +
							"If you do not want them to get any points for kills, enter **0**.",

					type: "integer",
					wait: 500,

				}
			],
			userPermissions: ["MANAGE_GUILD"],
		})
	}


	run(msg, args){
		const { accept, type, minimum1, first1, second1, third1, killsperpoints1, pointsperkills1, minimum2, first2, second2, third2, killsperpoints2, pointsperkills2, minimum3, first3, second3, third3, killsperpoints3, pointsperkills3 } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

        if (!serverInfo.paidVersion){
            return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
        }

		// Determine what game type we want.
		var types = teamModule.getGameType( type )
		var typeSolo = types[0], typeDuo = types[1], typeSquad = types[2]

		// Now, let's create some data!
		var data = [
			{
				"minTeams": minimum1,
				"firstPoints": first1,
				"secondPoints": second1,
				"thirdPoints": third1,
				"killsPerPoints": killsperpoints1,
				"pointsPerAmountKills": pointsperkills1,
			},
			{
				"minTeams": minimum2,
				"firstPoints": first2,
				"secondPoints": second2,
				"thirdPoints": third2,
				"killsPerPoints": killsperpoints2,
				"pointsPerAmountKills": pointsperkills2,
			},
			{
				"minTeams": minimum3,
				"firstPoints": first3,
				"secondPoints": second3,
				"thirdPoints": third3,
				"killsPerPoints": killsperpoints3,
				"pointsPerAmountKills": pointsperkills3,
			}
		]

        if (typeSolo) {
            serverInfo.soloStructure = data
        }
        else if (typeDuo) {
            serverInfo.duoStructure = data
        }
        else {
            serverInfo.squadStructure = data
        }

		base.saveServerInfo(msg, serverInfo, () => {
            // todo display lots of information.
			return msg.reply("the leaderboard has been configured! You can now use `-placement` and `-leaderboard` for " + type + " scrims!\n\n" +
            "It is now recommended that you run the following commands:\n" +
            "`-placementChannel` to set the channels that the `-placement` command can be run in; and\n" +
            "`-requireScreenshot` to set if a game type requires a screenshot when the `-placement` command is run.")
		})
	}
}
