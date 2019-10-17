const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.

module.exports = class PremiumInfo extends Command {
	constructor(client) {
		super(client, {
			name: "premium",
			group: "general",
			memberName: "premium",
			description: "Displays info about the premium version of ScrimBot.",
		})
	}


	run(msg){
        const embed = new RichEmbed()
            .setAuthor(this.client.user.username, this.client.user.displayAvatarURL) // set the author to ScrimBot, and the photo it uses.
            .setColor(0x00FF00)
            .setFooter("Created by @Feldma#1776.")
            .addField("What is ScrimBot Premium?", "ScrimBot Premium is the extended version of ScrimBot, which unlocks additional features such as placement collection and automatic leaderboard generation.")
            .addField("ScrimBot Premium Documentation:", "Additional information and documentation on ScrimBot Premium can be found [here.](https://scrimbot.gitbook.io/project/scrimbot-premium/what-is-scrimbot-premium)")
            .addField("How much is ScrimBot Premium and how do I purchase it?", "ScrimBot Premium is a once-off purchase of **$10** per server. To purchase ScrimBot Premium, please contact @Feldma#1776.")
        return msg.embed(embed)
	}
}
