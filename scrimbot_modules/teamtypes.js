/*
    File for commonly reused functions related to teams and types of games.
*/
const path = require("path")
var duoModule = require( path.join(__dirname, "/duos.js") )

module.exports = {

    // getGameType(type)
    // type should be one of "solo", "duo", "squads".
    // Returns three values, corresponding to typeSolo, typeDuo, typeSquad respectively.
    // Defaults to squads being true.
    getGameType(type){
        var solo = false, duo = false, squad = false
        switch(type) {
            case "solo":
                solo = true
                break

            case "duo":
                duo = true
                break

            case "squads":
                squad = true
                break

            default:
                squad = true
                break
        }
        return [solo, duo, squad]
    },

    // returnInfoTypes(serverInfo, solo, duo, squads)
    // Returns the point structure and leaderboard of the specified type.
    // Shouldn't have to initialise variables but it's weirding out so let's just do this.
    returnInfoTypes(serverInfo, solo, duo, squads){
        var struct
        var lead

        if (solo){
            struct = serverInfo.soloStructure
            lead = serverInfo.soloLeaderboard
        }
        else if (duo) {
            struct = serverInfo.duoStructure
            lead = serverInfo.duoLeaderboard
        }

        else{
            struct = serverInfo.squadStructure
            lead = serverInfo.squadLeaderboard
        }

        return [struct, lead]
    },




    // getTeamData(msg, isSolo, isDuo, isSquad)
    // Returns the relative team information based on member and game type.
    // Returns an error if the member does not belong to a valid team.
    // isSolo, isDuo, and isSquad should come from getGameType.
    getTeamData(msg, isSolo, isDuo, isSquad, serverInfo, returnID){
        var team = null

        // Solo mode, we just return the member.
        if (isSolo){
            // Lazy method to fix inconsistencies - create an optional param to return id.
            return (returnID && msg.member.id || msg.member)
        }

        /*
        Duo mode, we check if they are on the paid version.
        If they are, see what the unscored duo behaviour is (if it's true, they have to be in a duo team. If not, it's the same as solo. Default to the latter.)
        If they aren't, same as solo.
        */
        else if (isDuo){
            if (duoModule.getDuoBehaviour(msg)){ // if we want to require a duo team
                team = duoModule.findTeamInfo(serverInfo.duoTeams, msg.member.id)
                if (team == null){
                    msg.reply("you are required to be part of a duo team for this scrim! Type `-createduo <name>` to create one!")
                    return
                }
                else{
                    return (returnID && team.id || team)
                }
            }
            else{
                return (returnID && msg.member.id || msg.member)
            }
        }

        /*
        Squad mode, for now it's a role they must have.
        TODO: make it the same as duo teams.
        */

        else if (isSquad){
            // if (squad system exists)...
            // See if they are in a voice channel that matches a role.

            var VC = msg.member.voiceChannel
            if (VC !== undefined){
                var possibleRole = msg.guild.roles.find("name", VC.name)
                if (possibleRole !== null){
                    if (msg.member.roles.has(possibleRole.id)){
                        team = possibleRole
                        return (returnID && team.id || team)
                    }
                }
            }

            // See if we have a value.
            if (team == null){ // we do not. Go check for their lowest role.
                team = msg.member.roles.filter(role => !(role.position == 0)) // Filter the @everyone role out, which is always the lowest position (0).
                if (!team){ // they don't have any roles besides @everyone.
                    msg.reply("you do not have a team role! Please get one from the admins before trying to add your Game ID!")
                    return
                }

                // Get their lowest role.
                team = team.sort((a, b) => b.comparePositionTo(a)).last()

                // Check if they now have a role.
                if (team == null){
                    msg.reply("you do not have a team role! Please get one from the admins before trying to add your Game ID!")
                    return
                }
                else{
                    return (returnID && team.id || team)
                }
            }
        }

        /*
        We shouldn't be here!
        */
        else {
            msg.reply("an unexpected error occured. ERROR: teamtypes.js/getTeamData was provided 3 false game types.\nTo attempt to fix this, please try running `-newscrim` again.")
            return
        }

    }


}
