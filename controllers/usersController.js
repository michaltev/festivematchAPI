const bcrypt = require('bcrypt-nodejs')

const handleSignin = (req, res, db) => {

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
};

const handleRegister = (req, res, db) => {
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
};

const getUserProfile = (req, res, db) => {
	const {id} = req.params;
	
	db('users')
	.select(['id', 'name', 'favbandid', 'favbandname'])
	.where('id',id)
	.then(users => { res.json(users[0]); })
	.catch(error => {res.status(400).json('error getting the user')});
};

const updateFavArtist = (req, res, db) => {
	const {id, bandID, bandName} = req.body;

	db('users')
	.returning('*')
	.where({id})
	.update({ favbandid : bandID , favbandname: bandName})
	.then(user => {res.json(user[0]);})
	.catch(error => {res.status(400).json('user not found');})
}

module.exports = {
	handleSignin: handleSignin,
	handleRegister: handleRegister, 
	getUserProfile: getUserProfile,
	updateFavArtist: updateFavArtist
}