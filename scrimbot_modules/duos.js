/*
    File for duo-related functions, since duos is a unique system.
    Will most likely be changed to include squads as well.
*/

module.exports = {

    // getDuoBehaviour(msg)
    // Returns true if we want to use a duo team and false if we don't.
    getDuoBehaviour(msg){
        return ("unscoredDuoBehaviour" in msg.guild && msg.guild.unscoredDuoBehaviour)

    },

    // findTeam(teamData, id)
    // Handy function to find which duo team a player belongs to (if at all).
    // Returns the full team data if found, or null if not.
    // Renamed from findDuoTeam to findTeam because it'll probably work for squads as well.
    findTeamInfo(teamData, id){
        for (var info=0; info < teamData.length; info++){
            if (teamData[info].members.includes(id)){
                return teamData[info]
            }
        }
        // no data found, return null.
        return null
    },

    // getTeamInfo(teamData, id)
    // Previously getDuoInfo
    // Same as findTeam but gets a team based off team id rather than one of the members.
    getTeamInfo(teamData, id){
        for (var info=0; info < teamData.length; info++){
            if (teamData[info].id == id){
                return teamData[info]
            }
        }
        return null
    }



}
