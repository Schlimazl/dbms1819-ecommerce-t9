const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const { Client } = require('pg');

// instantiate client using your DB configurations
const client = new Client({
	database: 'dav83kbp01tlk1',
	user: 'jwpvfiwppeelxq',
	password: 'e1296e8f13d39a3613125d679e40d9dcbbc7d318e0ddd73b3f2e25794a09c8d0',
	host: 'ec2-50-19-86-139.compute-1.amazonaws.com',
	port: 5432,
	ssl:true
});




const app = express();
// tell express which folder is a static/public folder
app.set('views', path.join(__dirname,'views'));
// tell express to use handlebars as template engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');
app.set('port',(process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function(req, res) {
	res.render('home',{
		content: 'This is a sample of a template engine (handlebars)!',
		});
});


app.get('/about', function(req, res) {
	res.send('<h1>About Page</h1>');
});

app.get('/user/:userName', function(req, res) {
	const userName = req.params.userName;
	res.send('<h1>Hi,' + userName + '!!</h1>');
});

// connect to database
app.get('/products',(req, res)=>{    //Routes HTTP GET requests to the specified path
client.connect()
	.then(()=>{
		return client.query('SELECT * FROM Products;'); //database query
	})
	.then((query)=>{
		console.log('data: ', query); //prints to stdout with newline
		res.render('products', query); //renders a view and sends the rendered HTML string to the client
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
});

app.get('/member/1', function (req, res){
	res.render('member', {
		name: 'Kirk M. Grospe',
		alias: 'Kirkylicious',
		email: 'jhnkrkgrspe@gmail.com',
		phone: '09277119978',
		imageUrl: 'https://i.pinimg.com/736x/2a/50/a6/2a50a6334e6793e3a61f6b780b300f21--panda-art-baby-pandas.jpg',
		hobbies: ['Programming',' Sleeping' ]
	})
});

app.get('/member/2', function (req, res){
	res.render('member', {
		name: 'Reina B. Sun',
		alias: 'Liit',
		email: 'reinapatricia15@gmail.com',
		phone: '09154873277',
		imageUrl: 'https://hansenfoundationnj.org/wp-content/uploads/2017/12/SUN.gif',
		hobbies: ['K-drama-ing',' Sleeping' ]
	})
});


app.listen(app.get('port'), function() {
	console.log('Server started at port 3000');
});

