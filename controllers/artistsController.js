const fetch = require('node-fetch');

const getDefaultArtists = (req, res, songkickAPI) => {
	fetch(`https://api.songkick.com/api/3.0/artists/${songkickAPI.defaultArtist}/similar_artists.json?apikey=${songkickAPI.APIkey}`)
    .then(data => data.json())
    .then(artists => {
    	res.json(mapNecessaryArtistsInfo(artists.resultsPage.results.artist));
    })
    .catch(error => {res.status(400).json('error getting artists');})
};

const getSimilarArtists = (req, res, songkickAPI) => {
	const favbandid = req.params.artistid;
	
	fetch(`https://api.songkick.com/api/3.0/artists/${favbandid}/similar_artists.json?apikey=${songkickAPI.APIkey}`)
    .then(data => data.json())
    .then(artists => {
    	res.json(mapNecessaryArtistsInfo(artists.resultsPage.results.artist));
    })
    .catch(error => {res.status(400).json('error getting artists');});
};

const searchArtistByName = (req, res, songkickAPI) => {
	const {name} = req.params;
	fetch(`https://api.songkick.com/api/3.0/search/artists.json?apikey=${songkickAPI.APIkey}&query=${name}&per_page=6`)
    .then(data => data.json())
    .then(data => {
    	if(data.resultsPage.totalEntries > 0)
    		{ res.json(mapNecessaryArtistsInfo(data.resultsPage.results.artist));}
    	else { res.json([]); }
    })
    .catch(error => {res.status(400).json('error getting artists');})
};


module.exports = {
	getDefaultArtists: getDefaultArtists,
	getSimilarArtists: getSimilarArtists,
	searchArtistByName: searchArtistByName
}