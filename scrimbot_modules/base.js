/*
    ScrimBot base file for all commonly used functions that are shared between other modules or commands.
*/
const path = require('path')
const fs = require('fs')

module.exports = {

    // getServerInfo(msg)
    // Retrieves the JSON file for the specified message.
    // Returns the JSON array, and, additionally, the scope above (server).
    getServerInfo(msg){
        var fileLocation = path.join(__dirname, "../servers/", msg.guild.id + ".JSON")
        if (!fs.existsSync(fileLocation)){
            fs.writeFileSync( fileLocation, '{"guild": {}}', {encoding: "utf8", flag: "wx" } ) // create the file if it doesn't already exist and write some JSON to it to stop errors.

        }
        var server = JSON.parse(fs.readFileSync(fileLocation, "utf8")); // read the file.
        var serverInfo = server.guild

        // First, ensure the server has been configured.
        if (Object.keys(serverInfo).length == 0){
            // Because this is inside a module, we can't just "return" the msg.reply. So we do msg.reply then return undefined.
            msg.reply("this server has not been configured. Type -configure first before using this command!")
            return [undefined]
        }

        return [serverInfo, server]
    },

    // saveServerInfo(msg, serverInfo, successCallback)
    // Attempts to save the provided serverInfo to the server file.
    // On success, calls the provided callback.
    // On failure, calls a non-changeable error.
    saveServerInfo(msg, serverInfo, successCallback){
        var fileLocation = path.join(__dirname, "../servers/", msg.guild.id + ".JSON")

        fs.writeFile(fileLocation, JSON.stringify({"guild": serverInfo}, null, 2), (err) => {
			if (err){
				console.error(error)
				return msg.reply("an unexpected error occured whilst trying to save. This **will** result in data loss.\nTry repeating the command. If that fails, please contact @Feldma#1776.\nPlease give him the following code: " + msg.guild.id)
			}
			else{
				successCallback()
			}
		})
    },



    // memberIsHost(msg)
    // Returns true if the player has "scrim host" permissions.
    // Returns false if they don't.
    memberIsHost(msg){
        var hasHost = msg.member.hasPermission("MANAGE_CHANNELS")

		if (!hasHost){
			msg.member.roles.forEach( (val, key) => {
				if (val.name.toLowerCase().indexOf("scrim host") !== -1){
					return true
				}
			})

            return false
		}
        else {
            return true
        }

        // Shouldn't be here. Default no.
        msg.reply("an unexpected error occured. memberIsHost has failed to return a value. Defaulting to false.")
        return false
    }


}
