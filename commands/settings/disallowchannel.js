const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class DisallowChannel extends Command {
	constructor(client) {
		super(client, {
			name: "disallowchannel",
			group: "settings",
			memberName: "disallowchannel",
			description: "Remove a channel that GameID commands are allowed in.",
			examples: [],
			args: [
				{
					key: "disallowedchannel",
					prompt: "**what is the full name of the channel you want to disallow GameID commands in?**\n\nYou do not need to mention it, just type the full name.\nExample: type 'general-chat' (without the quotation marks).",
					type: "channel",

				}
			],
			userPermissions: ["MANAGE_CHANNELS"],
            guildOnly: true,
		})
	}


	run(msg, args){
		const { disallowedchannel } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (serverInfo.permittedChannels.length == 0){ // if there are no currently set channels.
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0xFF0000)
				.addField(":no_entry: An error occurred!", "there are no set allowed channels!\nUse -allowchannel <channel name> to add one!")
			return msg.replyEmbed(embed)

		}

		if (!(serverInfo.permittedChannels.includes(disallowedchannel.id))){ // that channel isn't set.
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0xFF0000)
				.addField(":no_entry: An error occurred!", disallowedchannel + " is not set as an allowed channel!")
			return msg.replyEmbed(embed)
		}
		else{ // it exists, let's remove it.
			// We can put this all in one line rather than defining a variable.
			serverInfo.permittedChannels.splice(serverInfo.permittedChannels.indexOf(disallowedchannel.id), 1) // gets the index of the ID and removes it.
		}


		// Save the new info.
		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.addField(":white_check_mark: Success!", disallowedchannel + " has been removed as an allowed channel.")

			var permittedChannels = []
			for (var channel in serverInfo.permittedChannels){
				var channelInfo = msg.guild.channels.get(serverInfo.permittedChannels[channel])
                if (channelInfo !== undefined){
                    permittedChannels.push( channelInfo + " in category " + channelInfo.parent.name )
                }
			}
            if (permittedChannels.length !== 0){
                embed.addField("All Allowed Channels:", permittedChannels)
            }
            else {
                embed.addField("Warning:", "No channels are currently configured for Game ID purpose. This will allow the -GameID command to be used anywhere!")
            }
			return msg.replyEmbed(embed)
		})
	}
}
