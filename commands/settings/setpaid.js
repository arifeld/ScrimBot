const { Command } = require("discord.js-commando");

// Import stuff we need for JSON.
const fs = require("fs");
const path = require("path");

const base = require( path.join(__dirname, "../../scrimbot_modules/base.js") )

module.exports = class SetPaid extends Command {
    constructor(client) {
		super(client, {
			name: "setpaid",
			group: "settings",
			memberName: "setpaid",
			description: "OWNER: Set if a guild has access to paid features.",
			examples: [],
			args: [
				{
					key: "allow",
					prompt: "",
					type: "boolean",

				}
			],
			ownerOnly: true,
			guildOnly: true,

		})
	}


	run(msg, args){
		const { allow } = args
        var serverInfo = base.getServerInfo(msg)[0]
        if (serverInfo == undefined){return}

		serverInfo.paidVersion = allow
        msg.guild.paidVersion = allow

        base.saveServerInfo(msg, serverInfo, () => {
            if (allow){
                return msg.reply("successfully enabled premium features. **Thank you for purchasing ScrimBot Premium!**")
            }
            else {
                return msg.reply("successfully deactivated premium features.")
            }
        })
	}
}
