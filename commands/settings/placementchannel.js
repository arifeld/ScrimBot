const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.


// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require(path.join(__dirname, "../../scrimbot_modules/base.js"))

module.exports = class PlacementChannel extends Command {
	constructor(client) {
		super(client, {
			name: "placementchannel",
			group: "settings",
			memberName: "placementchannel",
			description: "Allows you to configure what channels the `-placement` command can be used in.",
			examples: [],
			args: [
                {
					key: "placementsChannel",
					prompt: "please type the channels that the placement collection can be used in.\n\n" +
							"Only type one channel at a time, then press enter.\n" +
							"Once you have inputted all the channels, please type '**finish**'.\n\n" +
							"For an example, you could type the following:\nsolo-placements `<press enter>`\nsquad-placements `<press enter>`\nfinish `<press enter>`\n",
					type: "channel",
					infinite: true,
					wait: 500,
				}
			],
			userPermissions: ["MANAGE_CHANNELS"],
            guildOnly: true,
		})
	}


	run(msg, args){
		const { placementsChannel } = args;

		var serverInfo = base.getServerInfo(msg)[0]
		if (serverInfo == undefined){ return } // msg.reply is called in getServerInfo

        if (!(serverInfo.paidVersion)){
			return msg.reply("the placement and scoreboard commands are paid features. Please type -premium for more info.")
		}

        var channels = []
		for (var i = 0; i < placementsChannel.length; i++){
			channels.push(placementsChannel[i].id)
		}

        // placement info
		serverInfo.placementsChannel = channels


		base.saveServerInfo(msg, serverInfo, () => {
			const embed = new RichEmbed()
				.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
				.setColor(0x00FF00)
				.setFooter("Created by @Feldma#1776.")
                .setTitle("Successfully configured!")

                var permittedChannels = []
				for (var channel in channels){
					var channelInfo = msg.guild.channels.get(channels[channel])
                    if (channelInfo !== undefined && channelInfo.parent){
                        permittedChannels.push( channelInfo + " in category " + channelInfo.parent.name + ".")
                    }
                    else if (channelInfo !== undefined){
                        permittedChannels.push( channelInfo + " in no category." )
                    }
				}

            embed.addField("Permitted channels:", permittedChannels)
			return msg.replyEmbed(embed)
		})



	}
}
