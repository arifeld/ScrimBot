/*
    Functions that relate to the winners-role features.
*/

module.exports = {

    // searchID(leaderboard, id)
    // Given a winner leaderboard and a member id, returns the relevant object AND index.
    searchID(leaderboard, id){
        var data = leaderboard.find( (obj => {
            return obj.id == id
        }))

        if (data !== undefined){ // make sure the value actually exists in the leaderboard first.
            var index = leaderboard.findIndex( (obj => {
                return obj.id == id
            }))

            return data, index
        }
        else{
            return undefined, undefined
        }
    },

    // binarySearchLeaderboard(leaderboard, entry)
    // Uses a binary search to identify where the provided entry (object) should be inserted and returns that index.
    // Credit to https://stackoverflow.com/questions/3464815/insert-item-in-javascript-array-and-sort for the binary search.
    // TURNS OUT WE DONT NEED THIS OH WELL
    binarySearchLeaderboard(leaderboard, entry){
        var low=0, high = leaderboard.length
        var mid = -1, c = 0
        while (low < high){
            mid = parseInt((low+high) / 2)
            c = compareScore(leaderboard[mid], entry)
            if (c < 0){ // our low is too low.
                low = mid + 1
            }
            else if (c > 0){ // our high is too high.
                high = mid
            }
            else { // c = 0, we are correct!
                return mid
            }
        }
        // low is correct, we should add this now.
        return low
    },

    // Utility function for binarySearchLeaderboard
    compareScore(arr, entry){
        return arr.score - entry.score
    }
}
