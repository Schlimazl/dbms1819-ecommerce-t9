const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Product = require('./models/product');
const Category = require('./models/category');
const Brand = require('./models/brand');
const Order = require('./models/order');
const Customer = require('./models/customer');
const Email = require('./utils/email');
const Handlebars = require('handlebars');
const MomentHandler = require('handlebars.moment');

MomentHandler.registerHelpers(Handlebars);
require('dotenv').config();

// moment().format("dddd, MMMM Do YYYY, h:mm:ss a");

// instantiate client using your DB configurations
const client = new Client({
  database: 'dav83kbp01tlk1',
  user: 'jwpvfiwppeelxq',
  password: 'e1296e8f13d39a3613125d679e40d9dcbbc7d318e0ddd73b3f2e25794a09c8d0',
  host: 'ec2-50-19-86-139.compute-1.amazonaws.com',
  port: 5432,
  ssl: true
});

client.connect()
  .then(function () {
    console.log('connected to database!');
  })
  .catch(function () {
    console.log('Error');
  });

const app = express();
// tell express which folder is a static/public folder
app.set('views', path.join(__dirname, 'views'));
// tell express to use handlebars as template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('port', (process.env.PORT || 3000));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// ------------------------ USER INTERFACE ------------------------------------------
app.get('/', function (req, res) {
  var blog = [];
  var stylist = [];
  var both = [];
    client.query('SELECT * FROM blog')
    .then((results) =>{
      blog = results.rows;
      console.log('blog:', blog);
      both.push(blog);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
      });

    client.query('SELECT * FROM stylist')
    .then((results) =>{
      stylist = results.rows;
      console.log('stylist:', stylist);
      both.push(stylist);
      console.log(both);
      res.render('client/home.handlebars', {
        rows: both
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
      });
  });

app.get('/login', function (req, res) {
    res.render('client/login', {
      title: 'Top Products',
      products: products
    });
  });

app.get('/signup', function (req, res) {
    res.render('client/signup', {
      title: 'Top Products',
      products: products
    });
  });

app.get('/products', function (req, res) {
  Product.list(client, {}, function (products) {
    res.render('client/product-list', {
      title: 'Top Products',
      products: products
    });
  });
});

app.get('/products/:id', (req, res) => {
  Product.getById(client, req.params.id, function (productData) {
    res.render('client/products', productData);
  });
});

// ------------------------ CONTENT MANAGEMENT SYSTEM ------------------------------------------
app.get('/admin/', function (req, res) {
  var top10CustomerOrder;
  var top10CustomerHighestPayment;
  var top10MostOrderedProducts;
  var top10LeastOrderedProducts;
  var top3OrderedBrands;
  var top3OrderedCategories;
  var totalSales7days;
  var totalSales30days;
  var dailyOrderCount;


Order.top10CustomerOrder(client,{},function(result){
  top10CustomerOrder = result
});
Order.top10MostOrderedProducts(client,{},function(result){
  top10MostOrderedProducts = result
});
Order.top10LeastOrderedProducts(client,{},function(result){
  top10LeastOrderedProducts = result
});
Order.totalSales30Days(client,{},function(result){
  totalSales30days = result
});
Order.totalSales7Days(client,{},function(result){
  totalSales7days = result
});
Order.dailyOrderCount(client,{},function(result){
  dailyOrderCount = result
});
Order.top3OrderedBrands(client,{},function(result){
  top3OrderedBrands = result
});
Order.top3OrderedCategories(client,{},function(result){
  top3OrderedCategories = result
});


Customer.top10CustomerHighestPayment(client,{},function(result){
      res.render('admin/dashboard', {
        top10CustomerOrder: top10CustomerOrder,
        top10LeastOrderedProducts: top10LeastOrderedProducts,
        top10MostOrderedProducts: top10MostOrderedProducts,
        top3OrderedCategories: top3OrderedCategories,
        top3OrderedBrands: top3OrderedBrands,
        totalsales30days : totalSales30days[0].total,
        totalsales7days : totalSales7days[0].total,
        dailyordercount : dailyOrderCount[0].count,
        top10CustomerHighestPayment: result,
        result: result,
        title: 'Brands',
        layout: 'cms'
      });
    });
});


// ------------------------PRODUCTS---------------------------------------------
app.get('/admin/products', (req, res) => {
  client.query('select products_category.name AS categoryname,products.price AS price,products.id AS id, products.name AS productname,products.pic AS pic,products.descriptions AS desc,products_brand.name AS productbrand FROM products INNER JOIN products_category ON products_category.id = products.category_id INNER JOIN products_brand ON products_brand.id = products.brand_id')
    .then((results) => {
      console.log('results?', results);
      res.render('admin/products-admin', {
        rows: results.rows,
        title: 'Products',
        layout: 'cms'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/admin/products/:id', (req, res) => {
  Product.getById(client, req.params.id, function (productData) {
    res.render('admin/products-details-admin', {
      title: 'Customers',
      layout: 'cms',
      data: productData
    });
  });
});


app.get('/admin/product/update/:id', function (req, res) {
  var category = [];
  var brand = [];
  var both = [];
  client.query('SELECT * FROM products_brand;')
    .then((result) => {
      brand = result.rows;
      console.log('brand:', brand);
      both.push(brand);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
  client.query('SELECT * FROM products_category;')
    .then((result) => {
      category = result.rows;

      both.push(category);
      console.log('both', both);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
  client.query('SELECT products.id AS productsid,products.pic AS productspic,products.name AS productsname, products.descriptions AS productsdesc,products.price AS productsprice,products_brand.name AS productsbrand,products_brand.description AS branddesc,products_category.name AS categoryname FROM products INNER JOIN products_brand ON products.brand_id=products_brand.id INNER JOIN products_category ON products.category_id=products_category.id WHERE products.id = ' + req.params.id + ';')
    .then((result) => {
      res.render('admin/update-product-admin', {
        rows: result.rows[0],
        title: 'Update Product',
        layout: 'cms',
        brand: both
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/admin/product/create', function (req, res) {
  var category = [];
  var brand = [];
  var both = [];
  client.query('SELECT * FROM products_brand')
    .then((result) => {
      brand = result.rows;
      console.log('brand:', brand);
      both.push(brand);
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
  client.query('SELECT * FROM products_category')
    .then((result) => {
      category = result.rows;
      both.push(category);
      console.log(category);
      console.log(both);
      res.render('admin/create-product-admin', {
        title: 'Create Product',
        layout: 'cms',
        rows: both
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});
// ------------------------ CUSTOMERS ------------------------------------------
app.get('/admin/customers', function (req, res) {
  client.query('SELECT * FROM customers ORDER BY id DESC')
    .then((results) => {
      res.render('admin/customers-admin', {
        rows: results.rows,
        title: 'Customers',
        layout: 'cms'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.get('/customers/:id', (req, res) => {
  client.query('select customers.first_name AS fname, customers.last_name AS lname, customers.email AS email, customers.house_number AS hnumber, customers.street AS street, customers.barangay AS brgy, customers.city AS city, customers.country AS country, products.name AS pname, orders.quantity AS qty,orders.order_date AS orderdate FROM orders INNER JOIN products ON products.id = orders.products_id  INNER JOIN customers ON customers.id = orders.customers_id WHERE customers.id = ' + req.params.id + ' ORDER BY order_date DESC')
    .then((results) => {
      console.log('results?', results);
      res.render('admin/customer-details-admin', {
        layout: 'cms.handlebars',
        rows: results.rows,
        title: 'Customer Details'
      });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});
// -------------------------CATEGORIES------------------------
app.get('/admin/categories', function (req, res) {
  Category.list(client, {}, function (category) {
    res.render('admin/category-admin', {
      title: 'Categories',
      layout: 'cms',
      category: category
    });
  });
});

app.get('/admin/category/create', function (req, res) {
  res.render('admin/create-category', {
    title: 'Create Category',
    layout: 'cms'
  });
});

// ---------------------------BRANDS------------------------
app.get('/admin/brands', function (req, res) {
Brand.list(client,{},function(brands){
      res.render('admin/brand-admin', {
        brands: brands,
        title: 'Brands',
        layout: 'cms'
      });
    });
});



app.get('/admin/brand/create', function (req, res) {
  res.render('admin/create-brand', {
    title: 'Create Brand',
    layout: 'cms'
  });
});

//-----------------------STYLISTS-------------------------
app.get('/admin/stylists', function (req, res) {
  client.query('SELECT * FROM stylist')
  .then((results) =>{
    console.log('results?', results);
    res.render('admin/stylists', {
      rows: results.rows,
      layout: 'cms'
    })
  .catch((err) => {
    console.log('error', err);
    res.send('Error!');
    });
  });
});

app.get('/admin/stylist/add', function (req, res) {
  res.render('admin/add-stylist', {
    title: 'Add stylist',
    layout: 'cms'
  });
});

//---------------------------BLOGS-------------------------
app.get('/admin/blogs', function (req, res) {
  client.query('SELECT * FROM blog')
  .then((results) =>{
    console.log('results?', results);
    res.render('admin/blogs', {
      rows: results.rows,
      layout: 'cms'
    })
  .catch((err) => {
    console.log('error', err);
    res.send('Error!');
    });
  });
});

app.get('/admin/blog/add', function (req, res) {
  res.render('admin/add-blog', {
    title: 'Add blog',
    layout: 'cms'
  });
});

// ---------------------------ORDERS--------------------------------
app.get('/admin/orders', function (req, res) {
   Order.list(client,{},function(orders){
    res.render('admin/orders',{
      orders: orders,
      layout: 'cms'
      });
    });
});

app.get('/admin/error', function (req, res) {
  res.render('admin/error-admin', {
    title: 'Error',
    layout: 'cms'
  });
});

// ----------------------POST METHOD------------------------------
app.post('/insertbrand', function (req, res) {
  Brand.create(client,{brand_name: req.body.name, brand_desc: req.body.description},function(brand){
    if(brand == 'SUCCESS'){
      console.log('Insertion success!');
      res.redirect('/admin/brands');
    }
    else if (brand == 'ERROR'){
      res.redirect('/admin/error');
    }
    });
});

app.post('/insertcategory', function (req, res) {
  Category.create(client,{category_name: req.body.name},function(category){
    if(category == 'SUCCESS'){
      console.log('Insertion success!');
      res.redirect('/admin/categories');
    }
    else if (category == 'ERROR'){
      res.redirect('/admin/error');
    }
    });
});

app.post('/insertblog', function (req, res) {
  client.query("INSERT INTO blog (name, description, url, pic) VALUES ('" + req.body.name + "', '" + req.body.description + "', '" + req.body.url + "', '" + req.body.pic + "')")
    .then((result) => {
      res.redirect('/admin/blogs');
    })
    .catch((err) => {
      res.redirect('/admin/error');
    // res.redirect('/admin/category/create');
    });
});

app.post('/insertstylist', function (req, res) {
  client.query("INSERT INTO stylist (name, description, pic, fb, ig) VALUES ('" + req.body.name + "', '" + req.body.description + "', '" + req.body.pic + "', '" + req.body.fb + "', '" + req.body.ig + "')")
    .then((result) => {
      res.redirect('/admin/stylists');
    })
    .catch((err) => {
      res.redirect('/admin/error');
    // res.redirect('/admin/category/create');
    });
});

app.post('/insertproduct', function (req, res) {
   Product.create(client,{
    product_name: req.body.name,
    product_desc: req.body.descriptions,
    product_price: req.body.price,
    product_category: req.body.category,
    product_brand: req.body.brand,
    product_pic: req.body.pic
  },function(product){
    if(product == 'SUCCESS'){
      console.log('Insertion Success!');
      res.redirect('/admin/products');
    }
    else if (product == 'ERROR'){
     res.redirect('/admin/error');
      }
    });
  });

app.post('/updateproduct/:id', function (req, res) {
  client.query("UPDATE products SET name = '" + req.body.productsname + "', descriptions = '" + req.body.productsdesc + "', price = '" + req.body.productsprice + "',category_id = '" + req.body.category + "', brand_id = '" + req.body.brand + "', pic = '" + req.body.productspic + "'WHERE id = '" + req.params.id + "' ;");
  client.query("UPDATE products_brand SET description = '" + req.body.branddesc + "' WHERE id ='" + req.params.id + "';");

  res.redirect('/admin/products');
});

app.post('/products/:id/send', function (req, res) {
  client.query("INSERT INTO customers (email, first_name, last_name,house_number,street,barangay,city,country) VALUES ('" + req.body.email + "', '" + req.body.first_name + "', '" + req.body.last_name + "', '" + req.body.house_number + "', '" + req.body.street + "', '" + req.body.barangay + "', '" + req.body.city + "', '" + req.body.country + "') ON CONFLICT (email) DO UPDATE SET first_name = ('" + req.body.first_name + "'), last_name = ('" + req.body.last_name + "'), house_number = ('" + req.body.house_number + "'),street = ('" + req.body.street + "'),barangay = ('" + req.body.barangay + "'),city = ('" + req.body.city + "'), country = ('" + req.body.country + "') WHERE customers.email ='" + req.body.email + "';");
  client.query("SELECT id from customers WHERE email = '" + req.body.email + "';")
    .then((results) => {
      var id = results.rows[0].id;
      console.log(id);
      client.query("INSERT INTO orders (customers_id,products_id,quantity) VALUES ('" + id + "','" + req.body.productid + "','" + req.body.quantity + "')")
        .then((results) => {
          var maillist = ['kofe41fiho@gmail.com', 'jhnkrkgrspe@gmail.com', req.body.email];
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
            from: '"The Bloc by Junie Sierra & Co." <kofe41fiho@gmail.com>', // sender address
            to: maillist, // list of receivers
            subject: 'Order Details', // Subject line
            html:
         '<table >' +
           ' <thead>' +
              '<tr>' +
               '<th>Customer</th>' +
               '<th>Name</th>' +
               '<th>Email</th>' +
               '<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>' +
               '<th>Product</th>' +
               '<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>' +
               '<th>Quantity</th>' +
            '</thead>' +
            '<tr>' +

              '<td>' + req.body.first_name + '</td>' +
              '<td>' + req.body.last_name + '</td>' +
              '<td>' + req.body.email + '</td>' +
               '<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>' +
             ' <td>' + req.body.productname + '</td>' +
             '<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>' +
             ' <td>' + req.body.quantity + '</td>' +
              '</tr>' +
           ' </tbody>'
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response); ;
            res.redirect('/');
          });
        })
        .catch((err) => {
          console.log('error', err);
          res.send('Error!');
        });
    })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
});

app.listen(app.get('port'), function () {
  console.log('Server started at port 3000');
});
