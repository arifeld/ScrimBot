const { Command } = require("discord.js-commando");
module.exports = class SuperPurgeText extends Command {
	constructor(client) {
		super(client, {
			name: "superpurge",
			group: "mod utility",
			memberName: "superpurge",
			description: "Super Purge!",
			examples: [],
			args: [
				{
					key: "confirm",
					prompt: "Are you sure you want to do this?",
					type: "boolean",

				}
			],
			ownerOnly: true,

		})
	}

	async run(msg, args){
		const { confirm } = args;
		// Because we don't want to delete pinned messages:

		if (!confirm){ return msg.reply("okay, aborting!")}
		var i=0
		while (i < 10){
			var messages = await msg.channel.fetchMessages({limit: 100});
			var pinned   = await msg.channel.fetchPinnedMessages()
			var newmessages = messages.filter(message => !(pinned.has(message.id)));

			if (newmessages.length == 0){
				i = 10
			}
			else{
				msg.channel.bulkDelete(newmessages, true)
					.catch(console.error)
			}



		}


		return msg.reply("**SUPER PURGE** complete.")
	}

}
