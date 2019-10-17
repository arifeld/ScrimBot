const { Command } = require("discord.js-commando");
module.exports = class PurgeText extends Command {
	constructor(client) {
		super(client, {
			name: "purge",
			group: "mod utility",
			memberName: "purge",
			description: "Purge a specific amount of messages in the selected channel. Doesn't delete pinned messages!",
			examples: ["purge 100"],
			args: [
				{
					key: "amount",
					prompt: "How many messages do you want to delete?",
					type: "integer",
					validate: num => {
						if (num <= 100 && num > 0) return true;
						return "The number must be between 0 and 100!"
					}

				}
			],
			userPermissions: ["MANAGE_CHANNELS", "MANAGE_MESSAGES"],
		})
	}

	async run(msg, args){
		const { amount } = args;
		// Because we don't want to delete pinned messages:

		var messages = await msg.channel.fetchMessages({limit: amount});
		var pinned   = await msg.channel.fetchPinnedMessages()
		var newmessages = messages.filter(message => !(pinned.has(message.id)));


		msg.channel.bulkDelete(newmessages, true)
			.catch(console.error)

		msg.reply("you have successfully purged the messages.")
	}

}
