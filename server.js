const express = require('express')
const cors = require('cors')
const knex = require('knex')
const fetch = require('node-fetch');

const usersController = require('./controllers/usersController');
const artistsController = require('./controllers/artistsController');

const songkickAPI = {
	APIkey : "JHoWuXAj6UrhH3ji",
	defaultArtist : 217815
};

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'admin',
    database : 'festivematch'
  }
});

var app = express()

app.use(cors())
app.use(express.json())

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

app.get('/', (req, res) => {
	console.log('getting');
	res.json('getting');
});

app.post('/signin', (req, res) => { usersController.handleSignin(req, res, db) });

app.post('/register', (req, res) => { usersController.handleRegister(req, res, db) });

app.get('/profile/:id', (req, res) => { usersController.getUserProfile(req, res, db) });

app.put('/favband', (req, res) => { usersController.updateFavArtist(req, res, db) });

app.get('/defaultartists', (req, res) => { artistsController.getDefaultArtists(req, res, songkickAPI) });

app.get('/similarartists/:artistid', (req, res) => { artistsController.getSimilarArtists(req, res, songkickAPI) });

app.get('/artists/:name', (req, res) => { artistsController.searchArtistByName(req, res, songkickAPI) })

app.get('/festivals/:artistid', (req, res) => {
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
})

app.get('/festivals/:artistid/:secondartistid', (req, res) => {
	
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

})



app.listen(3000, () => {
	console.log('app is running');
})