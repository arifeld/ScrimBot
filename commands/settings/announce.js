const { Command } = require("discord.js-commando");
module.exports = class Announce extends Command {
	constructor(client) {
		super(client, {
			name: "announce",
			group: "settings",
			memberName: "announce",
			description: "OWNER: Write a message on every guild the bot is on.",
			examples: [],
			args: [
				{
					key: "message",
					prompt: "",
					type: "string",
					
				}
			],
			ownerOnly: true,

		})
	}


	run(msg, args){
		const { message } = args

		this.client.guilds.forEach( (value, key, obj) => {
			value.owner.send(message)
			.catch(console.error)
		})
	}
}