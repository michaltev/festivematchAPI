const express = require('express')
const cors = require('cors')
const knex = require('knex')
const fetch = require('node-fetch');

const usersController = require('./controllers/usersController');

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

mapNecessaryArtistsInfo = (p_artistsArray) => {
	const artistsInfo = p_artistsArray.map(item => {
		    const  {id, displayName} = item;
		    return {id: id, name: displayName};
		});

	return artistsInfo;
}

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

app.get('/profile/:id', (req, res) => {
	const {id} = req.params;
	
	db('users')
	.select(['id', 'name', 'favbandid', 'favbandname'])
	.where('id',id)
	.then(users => { res.json(users[0]); })
	.catch(error => {res.status(400).json('error getting the user')});
})

app.put('/favband', (req, res) => {
	const {id, bandID, bandName} = req.body;

	db('users')
	.returning('*')
	.where({id})
	.update({ favbandid : bandID , favbandname: bandName})
	.then(user => {res.json(user[0]);})
	.catch(error => {res.status(400).json('user not found');})
})

app.get('/defaultartists', (req, res) => {
	fetch(`https://api.songkick.com/api/3.0/artists/${songkickAPI.defaultArtist}/similar_artists.json?apikey=${songkickAPI.APIkey}`)
    .then(data => data.json())
    .then(artists => {
    	res.json(mapNecessaryArtistsInfo(artists.resultsPage.results.artist));
    })
    .catch(error => {res.status(400).json('error getting artists');})
})

app.get('/similarartists/:artistid', (req, res) => {
	const favbandid = req.params.artistid;
	
	fetch(`https://api.songkick.com/api/3.0/artists/${favbandid}/similar_artists.json?apikey=${songkickAPI.APIkey}`)
    .then(data => data.json())
    .then(artists => {
    	res.json(mapNecessaryArtistsInfo(artists.resultsPage.results.artist));
    })
    .catch(error => {res.status(400).json('error getting artists');});
})

app.get('/artists/:name', (req, res) => {
	const {name} = req.params;
	fetch(`https://api.songkick.com/api/3.0/search/artists.json?apikey=${songkickAPI.APIkey}&query=${name}&per_page=6`)
    .then(data => data.json())
    .then(data => {
    	if(data.resultsPage.totalEntries > 0)
    		{ res.json(mapNecessaryArtistsInfo(data.resultsPage.results.artist));}
    	else { res.json([]); }
    })
    .catch(error => {res.status(400).json('error getting artists');})
})

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