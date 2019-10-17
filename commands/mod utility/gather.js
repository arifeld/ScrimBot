const { Command } = require("discord.js-commando");
// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

module.exports = class Gather extends Command {
	constructor(client) {
		super(client, {
			name: "gather",
			group: "mod utility",
			memberName: "gather",
			description: "Gather all the members in voice chat that have the role specified by -setcaptainid",
			examples: [],
			userPermissions: ["MANAGE_CHANNELS", "MANAGE_MESSAGES", "MOVE_MEMBERS"],
			guildOnly: true,

		})
	}

	async run(msg){
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

		var chan = msg.guild.channels.filter( channel => channel.type == "voice")

		var captainRole = serverInfo.captainRole
		var VC = msg.member.voiceChannel
		if (captainRole == null) { // There is no captain role set, we don't want staff to be able to move everyone (easily).
			return msg.reply("the captain role is not set! Set it with -setcaptain <id>.")
		}

		else if (VC == undefined){
			return msg.reply("you are not in a voice channel! Join one to use this command!")
		}


		chan.forEach( (value, key, obj) => // For each channel.
			value.members.forEach( (v, k, o) => { // Get each member and iterate.
                if (captainRole == msg.guild.defaultRole.id){
                    v.setVoiceChannel(VC)
						.catch(console.error);
                }

                else if (v._roles.indexOf(captainRole) !== -1){ // the user has the captain role.
					v.setVoiceChannel(VC)
						.catch(console.error);
				}
			})
				)

		return msg.reply("successfully gathered all captains.")


	}

}
