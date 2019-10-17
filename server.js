const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const { Discord } = require('discord.js') // required for message embedding.
const path = require('path')
const sqlite = require('sqlite');

// Import stuff we need for JSON.
const fs = require("fs");

// Import our bot token.
var tokenPath = path.join(__dirname, "/settings/logintoken.json")
var loginToken = require(tokenPath);

const client = new CommandoClient({
	commandPrefix: "-",
	owner: "139279634796773376",
	disableEveryone: false,
	unknownCommandResponse: false
})

client.registry
	.registerDefaultTypes()
	.registerGroups([
		["general", "General Commands"],
		["scrims", "Scrim-orientated commands"],
		["settings", "Settings for ScrimBot"],
		["leaderboards", "Commands that deal with the leaderboard system. **These are paid features!**"],
        ["duo_team_management", "Commands to manage Duo Teams. **These are paid features!**"],
		["mod utility", "Commands for moderators"],
        ["247", "24/7 Scrim Commands"]
		])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, "commands"));


    // CREDIT TO DENNIS FROM THE DISCORD.JS DISCORD GUILD FOR THIS CODE.
    const getDefaultChannel = (guild) => {
      // get "original" default channel
      if(guild.channels.has(guild.id))
        return guild.channels.get(guild.id)
      // Check for a "general" channel, which is often default chat
      if(guild.channels.exists("name", "general"))
        return guild.channels.find("name", "general");

      // Now we get into the heavy stuff: first channel in order where the bot can speak
      // hold on to your hats!
      return guild.channels
       .filter(c => c.type === "text" &&
         c.permissionsFor(guild.client.user).has("SEND_MESSAGES") &&
         (c.name.indexOf("announcement") !== -1) && // so we don't send to announcements by mistake.
         (c.name.indexOf("info") !== -1)) // so we don't send to server info by mistake.
       .sort((a, b) => a.position - b.position ||
         Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
       .first();
    }


client.on("ready", () => {
	console.log("Logged in!");
	client.user.setActivity("as Fortnite Scrim Helper.");

    var activityValues = [
        "as Fortnite Scrim Helper.",
        "Type -help for commands.",
        "Type -premium for Premium info.",
        "Type -invite to invite me to your server!",
    ]
    var ind = 0

    // Create a timer that automatically changes the message that ScrimBot displays.
    setInterval( () => {
        if ((ind + 1) > activityValues.length){
            ind = 0
        }
        else{
            ind = ind + 1
        }

        client.user.setActivity(activityValues[ind])
    }, 10000)
	sqlite.open(path.join(__dirname, "settings.sqlite3")).then((db) => {
	    client.setProvider(new SQLiteProvider(db));
	});

    // Check if a server was running 24/7 and give them a warning.
    var fileLocation
    client.guilds.forEach( (val, key) => {
        fileLocation = path.join(__dirname, "/servers/", val.id + ".JSON")
        if (!fs.existsSync(fileLocation)){
            fs.writeFileSync( fileLocation, '{"guild": {}}', {encoding: "utf8", flag: "wx" } ) // create the file if it doesn't already exist and write some JSON to it to stop errors.
        }
        var server = JSON.parse(fs.readFileSync(fileLocation, "utf8")); // read the file.
        var serverInfo = server.guild // get the guild info. We need to be able to save 'server' seperately as that contains ALL the data.
        if ("current247" in serverInfo){
            if (serverInfo.current247){
                const channel = getDefaultChannel(val)
                if (channel !== undefined){
                    channel.send("**Alert!**\nIt appears I have crashed and/or been rebooted, and there was a 24/7 scrim in progress.\nYou will have to restart the 24/7 scrim!")
                }
                else{
                    /*key.owner.send("Hello! You are receiving this message as you are the owner of the " + guild.name + " server!\n" +
                    "Normally, I would send this to the general channel, but I can't seem to find it!\n" +
                    "It appears I have been rebooted and/or crashed, and there was a 24/7 scrim in progress.\n" +
                    "Because of this, you'll have to restart the 24/7 scrim."*/

                }
            }
        }
    })
})


client.on("message", (msg) => {
    try{ // need to fix this eventually omg
        // this entire thing can be simplified by storing permittedChannels in the guild object.
        if (msg.guild == null) {return} // don't do anything on non-guild messages.
    	if (msg.content.substring(0, 1) == msg.guild.commandPrefix){ return }

    	// Get our JSON file.

    	// This deletes any messages in channels that have been put down as GameID channels.
    	// Doesn't effect those who have "host" in their top role or who have the MANAGE_MESSAGES permission.
    	try{
            var fileLocation = path.join(__dirname, "/servers/", msg.guild.id + ".JSON")
    		if (!fs.existsSync(fileLocation)){
                fs.writeFileSync( fileLocation, '{"guild": {}}', {encoding: "utf8", flag: "wx" } ) // create the file if it doesn't already exist and write some JSON to it to stop errors.
            }
    		var server = JSON.parse(fs.readFileSync(fileLocation, "utf8")); // read the file.
            var serverInfo = server.guild // get the guild info. We need to be able to save 'server' seperately as that contains ALL the data.
            if (Object.keys(serverInfo).length == 0){
                return
            }


            if (!"paidVersion" in msg.guild){
                msg.guild.paidVersion = serverInfo.paidVersion
            }
            if (!"unscoredDuoBehaviour" in msg.guild && "unscoredDuoBehaviour" in serverInfo){
                msg.guild.unscoredDuoBehaviour = serverInfo.unscoredDuoBehaviour
            }

    	} catch (e){
    		console.log(e)
    	}
    	var exists = false
    	if (msg.author == this.client){	return }

    	if (serverInfo.permittedChannels.includes(msg.channel.id)){
    		if (msg.member.hasPermission("MANAGE_MESSAGES") || msg.member.highestRole.name.toLowerCase().indexOf("scrim host") !== -1){ return }
    		// if they DO NOT have the MANAGE_MESSAGES permission and they DO NOT have a "scrim host" role, we want to remove their message (assuming it isn't a command)
    		if (!(msg.isCommand)){
    			msg.delete() // to stop having issues with JSON files.
    		}
    	}
    } catch(e) {
        console.log(e)
    }



})

client.on("error", (err) => console.error(err))



// This is called as, for instance:
client.on("guildCreate", guild => {
  const channel = getDefaultChannel(guild);
  if (channel){
    channel.send("Thanks for inviting me to your server!\nTo start the setup process, type `-configure`.\n\n**Interested in automatic leaderboard generation?**\nType -premium for more information!");
  }
  else{ // send it to the owner.
    guild.owner.send("Hello! You are receiving this message as you are the owner of the " + guild.name + " server!\n" +
    "Normally, I would send this to the general channel, but I can't seem to find it!\n" +
    "If you were not the one to invite me, please forward the following information on to the person who did:\n" +
    "To start the setup process, type `-configure`.\n\n**Interested in automatic leaderboard generation?**\nType -premium for more information!"
    )
  }
});

client.login(loginToken.loginToken)
