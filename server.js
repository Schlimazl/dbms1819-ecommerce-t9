const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');


// instantiate client using your DB configurations
const client = new Client({
	database: 'dav83kbp01tlk1',
	user: 'jwpvfiwppeelxq',
	password: 'e1296e8f13d39a3613125d679e40d9dcbbc7d318e0ddd73b3f2e25794a09c8d0',
	host: 'ec2-50-19-86-139.compute-1.amazonaws.com',
	port: 5432,
	ssl:true
});

client.connect()
	.then(function() {
		console.log('connected to database!');
	})
	.catch(function() {
		console.log('Error');
	})




const app = express();
// tell express which folder is a static/public folder
app.set('views', path.join(__dirname,'views'));
// tell express to use handlebars as template engine
app.engine('handlebars', exphbs({defaultLayout:'main'}));
app.set('view engine','handlebars');
app.set('port',(process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function(req,res) {
	client.query('SELECT * FROM Products', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length; i++) {
			list.push(data.rows[i]);
		}
		res.render('home',{
			data: list,
			title: 'Top Products'
		});
	});
});


app.get('/about', function(req, res) {
	res.send('<h1>About Page</h1>');
});

app.get('/user/:userName', function(req, res) {
	const userName = req.params.userName;
	res.send('<h1>Hi,' + userName + '!!</h1>');
});

app.get('/brand/create', function(req, res) {
	res.render('create-brand',{
	});
});

app.get('/category/create', function(req, res) {
	res.render('create-category',{
	});
});

app.get('/product/create', function(req, res) {
	 var category = []; 
	 var brand = [];
	 var both =[];
	 client.query('SELECT * FROM products_brand')
	.then((result)=>{
	    brand = result.rows;
	    console.log('brand:',brand);
	     both.push(brand);
	})
	.catch((err) => {       
		console.log('error',err);
		res.send('Error!');
	});
    client.query('SELECT * FROM products_category')
	.then((result)=>{
	    category = result.rows;
	    both.push(category);
	    console.log(category);
	    console.log(both);
		res.render('create-product',{
			rows: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

});

app.get('/product/update/:id', function(req, res) {
     var category = []; 
	 var brand = [];
	 var both =[];
	  client.query('SELECT * FROM products_brand;')
	.then((result)=>{
		brand = result.rows;
	    console.log('brand:',brand);
	    both.push(brand);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
    client.query('SELECT * FROM products_category;')
	.then((result)=>{
		category = result.rows;
	  
	    both.push(category);
	      console.log('both',both);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});
	 client.query('SELECT products.id AS productsid,products.pic AS productspic,products.name AS productsname, products.descriptions AS productsdesc,products.price AS productsprice,products_brand.name AS productsbrand,products_brand.description AS branddesc,products_category.name AS categoryname FROM products INNER JOIN products_brand ON products.brand_id=products_brand.id INNER JOIN products_category ON products.category_id=products_category.id WHERE products.id = '+req.params.id+';')
	.then((result)=>{
		res.render('update-product', {
			rows: result.rows[0],
			brand: both
		});
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});


app.get('/products/:id', (req,res)=>{
	var id = req.params.id;
	client.query('SELECT * FROM Products', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length+1; i++) {
			if (i==id) {
				list.push(data.rows[i-1]);
			}
		}
		res.render('products',{
			data: list
		});
	});
});

app.get('/brands', function(req, res) {
		 client.query('SELECT * FROM products_brand')
	.then((result)=>{
	    console.log('results?', result);
		res.render('brand-list', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});

app.get('/categories', function(req, res) {
		 client.query('SELECT * FROM products_category')
	.then((result)=>{
	    console.log('results?', result);
		res.render('category-list', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});



app.post('/insertbrand', function(req, res) {
	client.query("INSERT INTO products_brand (name,description) VALUES ('"+req.body.name+"','"+req.body.description+"')");
	res.redirect('/brands');
});

app.post	('/insertcategory', function(req, res) {
	client.query("INSERT INTO products_category (name) VALUES ('"+req.body.name+"')");
	res.redirect('/categories');
});

app.post('/insertproduct', function(req, res) {
	client.query("INSERT INTO products (name,descriptions,price,category_id,brand_id,pic) VALUES ('"+req.body.name+"', '"+req.body.descriptions+"', '"+req.body.price+"', '"+req.body.category+"', '"+req.body.brand+"','"+req.body.pic+"')");
	res.redirect('/');
});

app.post('/updateproduct/:id', function(req, res) {
	client.query("UPDATE products SET name = '"+req.body.productsname+"', descriptions = '"+req.body.productsdesc+"', price = '"+req.body.productsprice+"',category_id = '"+req.body.category+"', brand_id = '"+req.body.brand+"', pic = '"+req.body.productspic+"'WHERE id = '"+req.params.id+"' ;");
	client.query("UPDATE products_brand SET description = '"+req.body.branddesc+"' WHERE id ='"+req.params.id+"';");
	
	res.redirect('/');
});

app.post('/products/:id/send', function(req, res) {
	console.log(req.body);
	var id = req.params.id;
	const output = `
		<p>You have a new contact request</p>
		<h3>Contact Details</h3>
		<ul>
			<li>Customer Name: ${req.body.name}</li>
			<li>Phone: ${req.body.phone}</li>
			<li>Email: ${req.body.email}</li>
			<li>Product ID: ${req.body.productid}</li>
			<li>Quantity ${req.body.quantity}</li>
		</ul>
	`;

	//nodemailer
	let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'kofe41fiho@gmail.com', 
            pass: 'GrospeSun123' 
        }
    });

    let mailOptions = {
        from: '"90skidsph" <kofe41fiho@gmail.com>',
        to: 'jhnkrkgrspe@gmail.com, reinapatricia15@gmail.com, jeurmeneta@gmail.com',
        subject: '90kidsph Order Request',
        //text: req.body.name,
        html: output
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        client.query('SELECT * FROM Products', (req, data)=>{
			var list = [];
			for (var i = 0; i < data.rows.length+1; i++) {
				if (i==id) {
					list.push(data.rows[i-1]);
				}
			}
			res.render('products',{
				data: list,
				msg: 'Email has been sent! :)'
			});
		});
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