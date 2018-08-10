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
	//var id = req.params.id;
	client.query('select products_category.name AS categoryname,products.price AS price,products.name AS productname,products.pic AS pic,products_brand.description AS desc,products_brand.name AS productbrand FROM products INNER JOIN products_category ON products_category.id = products.category_id INNER JOIN products_brand ON products_brand.id = products.brand_id WHERE products.id='+req.params.id+'   ;')
	.then((results)=>{
		console.log('results!',results);
		res.render('products',results)
	})
		.catch((err) => {
		console.log('error',err);
		res.send('Error!');
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

app.get('/customers', function(req, res) {
		 client.query('SELECT * FROM customers ORDER BY id DESC')
	.then((result)=>{
	    console.log('results?', result);
		res.render('customers', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});

app.get('/customers/:id', function(req, res) {
	 client.query('select customers.first_name AS fname, customers.last_name AS lname, customers.email AS email, customers.house_number AS hnumber, customers.street AS street, customers.barangay AS brgy, customers.city AS city, customers.country AS country, products.name AS pname, orders.quantity AS qty, orders.order_date AS ordate FROM orders INNER JOIN products ON products.id = orders.products_id  INNER JOIN customers ON customers.id = orders.customers_id WHERE customers.id = '+req.params.id+'')
	.then((result)=>{
	    console.log('results?', result);
		res.render('customer-details', result);
	})
	.catch((err) => {
		console.log('error',err);
		res.send('Error!');
	});

	});

app.get('/orders', function(req, res) {
	 client.query("SELECT customers.first_name AS fname,customers.last_name AS lname,customers.email AS email,products.name AS product,orders.quantity AS qty,orders.order_date AS orderdate FROM orders INNER JOIN customers ON customers.id=orders.customers_id INNER JOIN products ON products.id=orders.products_id ORDER BY orderdate DESC;")
	.then((result)=>{
	    console.log('results?', result);
		res.render('orders', result);
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
   client.query("INSERT INTO customers (email, first_name, last_name,house_number,street,barangay,city,country) VALUES ('"+req.body.email+"', '"+req.body.first_name+"', '"+req.body.last_name+"', '"+req.body.house_number+"', '"+req.body.street+"', '"+req.body.barangay+"', '"+req.body.city+"', '"+req.body.country+"') ON CONFLICT (email) DO UPDATE SET first_name = ('"+req.body.fname+"'), last_name = ('"+req.body.lname+"'), house_number = ('"+req.body.house_number+"'),street = ('"+req.body.street+"'),barangay = ('"+req.body.barangay+"'),city = ('"+req.body.city+"'), country = ('"+req.body.country+"') WHERE customers.email ='"+req.body.email+"';");
	client.query("SELECT id from customers WHERE email = '"+req.body.email+"';")
   	.then((results)=>{
   		var id = results.rows[0].id;
   		console.log(id);
   		client.query("INSERT INTO orders (customers_id,products_id,quantity) VALUES ('"+id+"','"+req.body.productid+"','"+req.body.quantity+"')")
   		.then((results)=>{
   		 var maillist = ['kofe41fiho@gmail.com', 'jhnkrkgrspe@gmail.com',req.body.email];
     	 var transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
              user: 'kofe41fiho@gmail.com',
              pass: 'GrospeSun123'
          }
      });
      const mailOptions = {
          from: '"90skidsph" <kofe41fiho@gmail.com>', // sender address
          to: maillist, // list of receivers
          subject: 'Order Details', // Subject line
          html:  
				 '<table >'+
				   ' <thead>'+
				      '<tr>'+
				       '<th>Customer</th>'+
				       '<th>Name</th>'+
				       '<th>Email</th>'+
				       '<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>'+
				       '<th>Product</th>'+
				       '<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>'+
				       '<th>Quantity</th>'+
				    '</thead>'+
				    '<tr>'+

				      '<td>'+req.body.first_name+'</td>'+
				      '<td>'+req.body.last_name+'</td>'+
				      '<td>'+req.body.email+'</td>'+
				       '<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
				     ' <td>'+req.body.productname+'</td>'+
				     '<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>'+
				     ' <td>'+req.body.quantity+'</td>'+
				      '</tr>'+
				   ' </tbody>'
      };

      transporter.sendMail(mailOptions, (error, info) => {	
          if (error) {
              return console.log(error);
          }
          console.log('Message %s sent: %s', info.messageId, info.response);;
          res.redirect('/');
          });
   		})
   		.catch((err)=>{
   		console.log('error',err);
		res.send('Error!');
   		});
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