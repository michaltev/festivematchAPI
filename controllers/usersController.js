const handleSignin = (req, res, db, bcrypt) => {

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

module.exports = {
	handleSignin: handleSignin
}