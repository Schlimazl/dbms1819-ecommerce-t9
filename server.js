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
const Content = require('./models/content');
const Email = require('./utils/email');
const Handlebars = require('handlebars');
const NumeralHelper = require("handlebars.numeral");
//const HandlebarsIntl = require('handlebars-intl');
const MomentHandler = require('handlebars.moment');
const paginate = require('handlebars-paginate');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//HandlebarsIntl.registerWith(Handlebars);
NumeralHelper.registerHelpers(Handlebars);
Handlebars.registerHelper('paginate', paginate);
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
  .catch(function (err) {
    console.log(err);
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

var role;
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize()); 
app.use(passport.session());



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


passport.use(new Strategy({
  usernameField: 'email',
  passwordField: 'password'
},
  function(email, password, cb) {
    Customer.getByEmail(client, email, function(user) {
      if (!user) { return cb(null, false); }
      bcrypt.compare(password, user.password).then(function(res) {
      if (res == false) { return cb(null, false); }
      return cb(null, user);
    });
      });
  }));


passport.serializeUser(function(user, cb) {
  console.log('serializeUser', user)
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  console.log('deserializeUser', id)
  Customer.getById(client, id, function (user) {
    cb(null, user);
  });
});

function isAdmin(req, res, next) {
   if (req.isAuthenticated()) {
  Customer.getCustomerData(client,{id: req.user.id},function(user){
    role = user[0].user_type;
    console.log('role:',role);
    if (role == 'admin') {
        return next();
    }
    else{
      res.redirect('/products?p=1');
    }
  });
  }
  else{
    res.redirect('/login');
  }
}


app.get('/login', function (req, res) {
    res.render('client/login', {
      title: 'Top Products',
    });
  });



app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
  res.redirect('/admin');
});

app.get('/signup', function (req, res) {
    res.render('client/signup', {
      title: 'Top Products',
    });
  });

app.get('/client/update', function (req, res) {
  Customer.getCustomerData(client,{id: req.user.id},function(user){
    res.render('client/update_client',{
      user: user
    });
  });
});

app.post('/client/update', function (req, res) {
 bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
  Customer.update(client,{id: req.user.id},{
    fName: req.body.first_name,
    lName: req.body.last_name,
    email: req.body.email,
    pass: hash,
    hNumber: req.body.house_number,
    street: req.body.street,
    brgy: req.body.barangay,
    city: req.body.city,
    country: req.body.country,
    userType: 'user'
  },function(user){
    res.redirect('/products?p=1')
  });
});
});


app.get('/products', function (req, res, next) {
  Product.list(client, {limit: 8}, {offset: (req.query.p - 1) * 8}, {}, function (products) {
    res.render('client/product-list', {
      products: products,
      title: 'Products',
      pagination: {
        page: req.query.p || 1,
        limit: 8,
        n: req.query.p || 1
      }
    });
  });
});

app.get('/error', function (req, res) {
  res.render('client/error', {
    title: 'Error',
    layout: 'cms'
  });
});


app.get('/products/:id', (req, res) => {
  if(req.isAuthenticated()){
 client.query('SELECT products_category.name AS categoryname, products.price AS price, products.id AS id, products.name AS productname, products.pic AS pic, products.descriptions AS desc, products_brand.name AS productbrand FROM products INNER JOIN products_category ON products_category.id = products.category_id INNER JOIN products_brand ON products_brand.id = products.brand_id  WHERE products.id = ' + req.params.id + '; ')
    .then((products) => {
      console.log(products);
        client.query('SELECT * FROM customers WHERE id = ' + req.user.id + '; ')
        .then((customerData) => {
          res.render('client/products', {
            product: products.rows,
            customer: customerData.rows
          });
        });
      })
    .catch((err) => {
      console.log('error', err);
      res.send('Error!');
    });
    }
  else{
    res.redirect('/login');
  }
  });

app.get('/services', function (req, res) {
  res.render('client/services', {
    title: 'Services',
  });
});

app.get('/faqs', function (req, res) {
  res.render('client/faqs', {
    title: 'Contact Us',
  });
});

app.get('/aboutus', function (req, res) {
  res.render('client/about', {
    title: 'About Us',
  });
});




// ------------------------ CONTENT MANAGEMENT SYSTEM ------------------------------------------
app.get('/admin/', isAdmin, function (req, res) {
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
        top1BrandName : top3OrderedBrands[0].name,
        top2BrandName : top3OrderedBrands[1].name,
        top3BrandName : top3OrderedBrands[2].name,
        top1BrandOrder : top3OrderedBrands[0].sum,
        top2BrandOrder : top3OrderedBrands[1].sum,
        top3BrandOrder : top3OrderedBrands[2].sum,
        top1CategoryName : top3OrderedCategories[0].name,
        top2CategoryName : top3OrderedCategories[1].name,
        top3CategoryName : top3OrderedCategories[2].name,
        top1CategoryOrder : top3OrderedCategories[0].sum,
        top2CategoryOrder : top3OrderedCategories[1].sum,
        top3CategoryOrder : top3OrderedCategories[2].sum,
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
app.get('/admin/products', isAdmin, (req, res) => {
  client.query('select products_category.name AS categoryname,products.price AS price,products.id AS id, products.name AS productname,products.pic AS pic,products.descriptions AS desc,products_brand.name AS productbrand, products.expiration AS expiration FROM products INNER JOIN products_category ON products_category.id = products.category_id INNER JOIN products_brand ON products_brand.id = products.brand_id')
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

app.get('/admin/products/:id', isAdmin, (req, res) => {
  Product.getById(client, req.params.id, function (productData) {
    res.render('admin/products-details-admin', {
      title: 'Customers',
      layout: 'cms',
      data: productData
    });
  });
});


app.get('/admin/product/update/:id', isAdmin, function (req, res) {
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

app.get('/admin/product/create', isAdmin, function (req, res) {
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
app.get('/admin/customers', isAdmin, function (req, res) {
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

app.get('/customers/:id', isAdmin, (req, res) => {
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
app.get('/admin/categories', isAdmin, function (req, res) {
  Category.list(client, {}, function (category) {
    res.render('admin/category-admin', {
      title: 'Categories',
      layout: 'cms',
      category: category
    });
  });
});

app.get('/admin/main-category-1', isAdmin, function (req, res) {
  Category.listMainCategory1(client, {}, function (category) {
    res.render('admin/main-category-1', {
      title: 'Categories',
      layout: 'cms',
      category: category
    });
  });
});

app.get('/admin/main-category-2', isAdmin, function (req, res) {
  Category.listMainCategory2(client, {}, function (category) {
    res.render('admin/main-category-2', {
      title: 'Categories',
      layout: 'cms',
      category: category
    });
  });
});

app.get('/admin/main-category-3', isAdmin, function (req, res) {
  Category.listMainCategory3(client, {}, function (category) {
    res.render('admin/main-category-3', {
      title: 'Categories',
      layout: 'cms',
      category: category
    });
  });
});
app.get('/admin/category/create', isAdmin, function (req, res) {
  res.render('admin/create-category', {
    title: 'Create Category',
    layout: 'cms'
  });
});

app.get('/admin/category/update/:id',isAdmin, function (req, res) {
     Category.getById(client,{categoryId: req.params.id},function(category){
    res.render('admin/update-category',{
      category: category,
      layout: 'cms'
    });
  });
});

app.post('/admin/update/category/:id', function (req, res) {
  Category.update(client,{categoryId: req.params.id},{
    name: req.body.name,
  },function(category){
    console.log(category);
    res.redirect('/admin/categories')
  });
});


// ---------------------------BRANDS------------------------
app.get('/admin/brands', isAdmin, function (req, res) {
Brand.list(client,{},function(brands){
      res.render('admin/brand-admin', {
        brands: brands,
        title: 'Brands',
        layout: 'cms'
      });
    });
});

app.get('/admin/brand/create',  isAdmin, function (req, res) {
  res.render('admin/create-brand', {
    title: 'Create Brand',
    layout: 'cms'
  });
});

app.get('/admin/brand/update/:id', isAdmin,function (req, res) {
     Brand.getById(client,{brandId: req.params.id},function(brand){
    res.render('admin/update-brand',{
      brand: brand,
      layout: 'cms'
    });
  });
});

app.post('/admin/update/brand/:id', function (req, res) {
  Brand.update(client,{brandId: req.params.id},{
    name: req.body.name,
    desc: req.body.desc
  },function(brand){
    console.log(brand);
    res.redirect('/admin/brands')
  });
});

//-----------------------STYLISTS-------------------------
app.get('/admin/stylists',  isAdmin, function (req, res) {
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

app.get('/admin/stylist/add',  isAdmin, function (req, res) {
  res.render('admin/add-stylist', {
    title: 'Add stylist',
    layout: 'cms'
  });
});

app.get('/admin/stylist/update/:id', isAdmin,function (req, res) {
     Content.stylistGetById(client,{stylistId: req.params.id},function(stylist){
    res.render('admin/update-stylist',{
      stylist: stylist,
      layout: 'cms'
    });
  });
});

app.post('/admin/update/stylist/:id', function (req, res) {
  Content.stylistUpdate(client,{stylistId: req.params.id},{
    name: req.body.name,
    desc: req.body.desc,
    pic: req.body.pic,
    fb: req.body.fb,
    ig: req.body.ig
  },function(stylist){
    console.log(stylist);
    res.redirect('/admin/stylists')
  });
});

//---------------------------BLOGS-------------------------
app.get('/admin/blogs', isAdmin, function (req, res) {
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

app.get('/admin/blog/add', isAdmin, function (req, res) {
  res.render('admin/add-blog', {
    title: 'Add blog',
    layout: 'cms'
  });
});

app.get('/admin/blog/update/:id', isAdmin,function (req, res) {
     Content.getById(client,{blogId: req.params.id},function(blog){
    res.render('admin/update-blog',{
      blog: blog,
      layout: 'cms'
    });
  });
});

app.post('/admin/update/blog/:id', function (req, res) {
  Content.update(client,{blogId: req.params.id},{
    name: req.body.name,
    desc: req.body.desc,
    url: req.body.url,
    pic: req.body.pic
  },function(blog){
    console.log(blog);
    res.redirect('/admin/blogs')
  });
});

// ---------------------------ORDERS--------------------------------
app.get('/admin/orders', isAdmin, function (req, res) {
   Order.list(client,{},function(orders){
    res.render('admin/orders',{
      orders: orders,
      layout: 'cms'
      });
    });
});

app.get('/admin/error', isAdmin, function (req, res) {
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

app.post('/signup', function (req, res) {
  bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
    Customer.signup(client,{
    fName: req.body.first_name,
    lName: req.body.last_name,
    email: req.body.email,
    pass: hash,
    hNumber: req.body.house_number,
    street: req.body.street,
    brgy: req.body.barangay,
    city: req.body.city,
    country: req.body.country,
    userType: 'user'
  },
  function(user){

    if(user == 'SUCCESS'){
      res.redirect('/login');
}
    else if (user == 'ERROR'){
      console.log('Error!')
    }
  });
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
      console.log('id: ', id);

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
          res.send('Error--');
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
