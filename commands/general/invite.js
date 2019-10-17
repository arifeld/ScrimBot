const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

module.exports = class SendInvite extends Command {
	constructor(client) {
		super(client, {
			name: "invite",
			group: "general",
			memberName: "invite",
			description: "Will give out invite link once bot goes fully public.",

		})
	}


	run(msg){
        return msg.reply("currently, ScrimBot Beta is only given out to paid or large servers. Please contact @Feldma#1776.\nIn the future, the normal version of ScrimBot will have all these features.")

        /*
		const embed = new RichEmbed()
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
			.setColor(0x00FF00)
			.setFooter("Created by @Feldma#1776.")
			.addField("Want to invite ScrimBot to your server?", "[Press here!](https://discordapp.com/oauth2/authorize?client_id=484973794054635523&scope=bot&permissions=8)")
			.addField("First time using ScrimBot?", "[Click here to see my documentation!](https://scrimbot.gitbook.io)")
		return msg.embed(embed)*/


	}
}
