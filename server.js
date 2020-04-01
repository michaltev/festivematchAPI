const express = require('express')
const cors = require('cors')
const knex = require('knex')
const fetch = require('node-fetch');

const usersController = require('./controllers/usersController');
const artistsController = require('./controllers/artistsController');
const eventsConstroller = require('./controllers/eventsController');

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

app.get('/artists/:name', (req, res) => { artistsController.searchArtistByName(req, res, songkickAPI) });

app.get('/festivals/:artistid', (req, res) => { eventsConstroller.getFestivalsBySingleArtist(req, res, songkickAPI) });

app.get('/festivals/:artistid/:secondartistid', (req, res) => { eventsConstroller.getFestivalsByTwoArtists(req, res, songkickAPI) });

app.listen(3000, () => {
	console.log('app is running');
})