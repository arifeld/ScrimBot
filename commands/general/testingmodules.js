const { Command } = require("discord.js-commando");
const { RichEmbed } = require('discord.js'); // required for message embedding.
const base = require("../../scrimbot_modules/base.js")

module.exports = class Testing extends Command {
	constructor(client) {
		super(client, {
			name: "testing",
			group: "general",
			memberName: "testing",
			description: "Testing",
            ownerOnly: true
		})
	}


	run(msg){
        console.log(base)
        base.testFunction(msg)
	}
}
