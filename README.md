# Welcome to my ScrimBot Repository.
**Project Developed From Early 2018 to Mid 2019**

This has been pushed to GitHub as part of my collection of various programming projects that I have completed (to be viewed in the future by prospective employers etc).

With this in mind, all of the below information is purely information on what the program does, what languages and modules I used to create it, and how I hosted it.

ScrimBot is a [Discord](https://discordapp.com/) bot that was being used on 200+ servers. The bot was designed to assist with the running of Fortnite scrims, and had many features (which can be found in /commands).
The bot itself was coded in Node.JS using the following main libraries:

- [discord.js](https://discord.js.org/#/)
- [discord.js-commando](https://discord.js.org/#/docs/commando/master/general/welcome)
- [node-opus](https://www.npmjs.com/package/node-opus)
- [sqllite3](https://www.npmjs.com/package/sqlite3)
- [forever](https://www.npmjs.com/package/forever) (for ensuring the bot did not go offline).

The bot itself was hosted on an AWS EC2 instance using the Amazon Linux OS.

Features of the bot include:
- Managing scrims, and tracking who was in each game lobby (commands/scrims);
- Persistent leaderboards via JSON, with customisable scoring systems that could be configured on a per-server basis (commands/leaderboards);
- Automation, where the bot could run scrims completely independently of actual users (commands/247); and
- A lot of other features that are probably not worth mentioning.

This version pushed to GitHub was only the final version, however it was under constant development for a 6+ month period and has undergone many reworks since then.

PLEASE NOTE: for some reason, all of the code in this repository has been pushed with unusual whitespace. Sorry for that, the code still appears readable albeit with quite a lot of unnecessary gaps. I suspect my Atom settings are to blame for this.

Additionally, I have intentionally omitted both the bot token (for obvious reasons), as well as all of the node modules (to reduce clutter) from this repository. As a result, should you want to compile the code yourself, you'll have to initialise an NPM project and install the aforementioned packages, as well as obtain a Discord Bot Token.

For any questions about the bot, please send me a message!
