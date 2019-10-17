const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class AddPermitted extends Command {
	constructor(client) {
		super(client, {
			name: "allowchannel",
			group: "settings",
			memberName: "allowchannel",
			description: "Add a channel that GameID commands are allowed in.",
			examples: [],
			args: [
				{
					key: "allowedchannel",
					prompt: "**what is the full name of the channel you want to allow GameID commands in?**\n\nYou do not need to mention it, just type the full name.\nExample: type 'squad-gamecodes' (without the quotation marks).",
					type: "channel",

				}
			],
			userPermissions: ["MANAGE_CHANNELS"],
            guildOnly: true,
		})
	}


	run(msg, args){
		const { allowedchannel } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

		if (serverInfo.permittedChannels.includes(allowedchannel.id)){
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0xFF0000)
				.setFooter("Created by @Feldma#1776.")
				.addField(":no_entry: An error occurred!", allowedchannel + " is already an allowed channel!")
			return msg.replyEmbed(embed)
		}
		else{
			serverInfo.permittedChannels.push(allowedchannel.id)
		}

		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
				.addField(":white_check_mark: Success!", allowedchannel + " has been added as an allowed channel.")

			var permittedChannels = []
			for (var channel in serverInfo.permittedChannels){
				var channelInfo = msg.guild.channels.get(serverInfo.permittedChannels[channel])
                if (channelInfo !== undefined && channelInfo.parent){
                    permittedChannels.push( channelInfo + " in category " + channelInfo.parent.name + ".")
                }
                else if (channelInfo !== undefined){
                    permittedChannels.push( channelInfo + " in no category." )
                }
			}

            if (permittedChannels.length !== 0){
                embed.addField("All Allowed Channels:", permittedChannels)
            }
			return msg.replyEmbed(embed)
		})
	}
}
