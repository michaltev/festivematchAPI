const fetch = require('node-fetch');

filterFestivals = (p_eventsArray) => {
	const festivals = p_eventsArray.filter(event => event.type === "Festival");

	return festivals;
}

filterCollaboration = (p_eventsArray, p_collabArtistID) => {
	const festivals = p_eventsArray.filter(event => {
		return ((event.type === "Festival") &&
				(event.performance.some(collab => {
					return (collab.artist.id==p_collabArtistID)
				}))); 
	});
	return festivals;
}

getFestivalsBySingleArtist = (req, res, songkickAPI) => {
	const artistID = req.params.artistid;
	
	fetch(`https://api.songkick.com/api/3.0/artists/${artistID}/calendar.json?apikey=${songkickAPI.APIkey}`)
    .then(data => data.json())
    .then(events => {
    	if(events.resultsPage.totalEntries > 0)
    	{
    		res.json(filterFestivals(events.resultsPage.results.event));
    	}
    	else {res.json([]);}
    })
    .catch(error => {res.status(400).json('error getting events');});
}

getFestivalsByTwoArtists = (req, res, songkickAPI) => {
	const artistID = req.params.artistid;
	const collabArtistID = req.params.secondartistid;
	
	fetch(`https://api.songkick.com/api/3.0/artists/${artistID}/calendar.json?apikey=${songkickAPI.APIkey}`)
    .then(data => data.json())
    .then(events => {
    	if(events.resultsPage.totalEntries > 0)
    	{
    		res.json(filterCollaboration(events.resultsPage.results.event, collabArtistID));
    	}
    	else {res.json([]);}
    })
    .catch(error => {res.status(400).json('error getting events');});
}

module.exports = {
	getFestivalsBySingleArtist: getFestivalsBySingleArtist,
	getFestivalsByTwoArtists: getFestivalsByTwoArtists
}