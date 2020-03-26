const express = require('express')
const cors = require('cors')
const knex = require('knex')
const bcrypt = require('bcrypt-nodejs')
const fetch = require('node-fetch');

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

app.get('/', (req, res) => {
	console.log('getting');
	res.json('getting');
});

app.post('/signin', (req, res) => {
	db.select('email', 'hash')
	.from('login')
	.where('email', req.body.email)
	.then(data => {
		if (bcrypt.compareSync(req.body.password, data[0].hash)) 
		{
			return (db('users')
			.where('email', '=', req.body.email)
			.select('*')
			.then(user => {res.json(user[0]);})
			.catch(error => {res.status(400).json('user not found');}))
		}
		else 
		{
			res.status(400).json('wrong password');
		}
	})
	.catch(error => {res.status(400).json('error getting the user')});
});

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
});

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
	fetch(`https://api.songkick.com/api/3.0/search/artists.json?apikey=${songkickAPI.APIkey}&query=${name}`)
    .then(data => data.json())
    .then(artists => {
    	res.json(mapNecessaryArtistsInfo(artists.resultsPage.results.artist));
    })
    .catch(error => {res.status(400).json('error getting artists');})
})



app.listen(3000, () => {
	console.log('app is running');
})