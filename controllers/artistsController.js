const fetch = require('node-fetch');

const getDefaultArtists = (req, res, songkickAPI) => {
	fetch(`https://api.songkick.com/api/3.0/artists/${songkickAPI.defaultArtist}/similar_artists.json?apikey=${songkickAPI.APIkey}`)
    .then(data => data.json())
    .then(artists => {
    	res.json(mapNecessaryArtistsInfo(artists.resultsPage.results.artist));
    })
    .catch(error => {res.status(400).json('error getting artists');})
}


module.exports = {
	getDefaultArtists: getDefaultArtists
}