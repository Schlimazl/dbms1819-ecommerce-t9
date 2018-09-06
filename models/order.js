var exports = module.exports = {};

var Order = {
    list: (client,filter,callback) => {
      const orderListQuery =  `
        SELECT 
          customers.first_name AS fname,
          customers.last_name AS lname,
          customers.email AS email,
          products.name AS product,
          orders.quantity AS qty,
          orders.order_date AS orderdate 
        FROM orders 
        INNER JOIN customers ON customers.id=orders.customers_id 
        INNER JOIN products ON products.id=orders.products_id 
        ORDER BY orderdate DESC
      `;
      client.query(orderListQuery,(req,result)=>{
        console.log(result.rows);
        callback(result.rows);
      });
    },

    top10CustomerOrder: (client,filter,callback) =>{
      const query = `
        SELECT first_name, last_name, count(customers_id)
        FROM customers
        INNER JOIN orders
        ON customers.id = orders.customers_id
        GROUP BY first_name, last_name 
        ORDER BY count desc limit 10
      `;
       client.query(query,(req,result)=>{
        console.log(result.rows)
        callback(result.rows)
      });
    },
    top10MostOrderedProducts: (client,filter,callback) =>{
      const query =  `
          SELECT name, COUNT(products_id)
          FROM orders
          INNER JOIN products ON orders.products_id = products.id
          GROUP BY name ORDER BY COUNT DESC LIMIT 10
      `;
      client.query(query,(req,result)=>{
        console.log(result.rows)
        callback(result.rows)
      });
    },
    top10LeastOrderedProducts: (client,filter,callback) =>{
      const query =  `
          SELECT name, COUNT(products_id)
          FROM orders
          INNER JOIN products ON orders.products_id = products.id
          GROUP BY name ORDER BY COUNT ASC LIMIT 10
      `;
      client.query(query,(req,result)=>{
        console.log(result.rows)
        callback(result.rows)
      });
    },
    totalSales7Days: (client,filter,callback) =>{
      const query = `
      SELECT  SUM (orders.quantity * products.price) as total
          FROM
           orders
           inner join products on products.id = orders.products_id
           inner join customers on customers.id = orders.customers_id WHERE order_date BETWEEN CURRENT_DATE - INTERVAL '7 days'
        AND CURRENT_DATE + INTERVAL '1 days'
        `;
        client.query(query,(req,result)=>{
        console.log('7days',result.rows)
        callback(result.rows)
      });
    },
    totalSales30Days: (client,filter,callback) =>{
      const query = `
      SELECT  SUM (orders.quantity * products.price) as total
          FROM
           orders
           inner join products on products.id = orders.products_id
           inner join customers on customers.id = orders.customers_id WHERE order_date BETWEEN CURRENT_DATE - INTERVAL '30 days'
        AND CURRENT_DATE + INTERVAL '1 days'
        `;
        client.query(query,(req,result)=>{
        console.log(result.rows)
        callback(result.rows)
      });
    },
    dailyOrderCount: (client,filter,callback) =>{
      const query = `
      SELECT  COUNT (orders.id)
          FROM
           orders
      WHERE order_date BETWEEN CURRENT_DATE - INTERVAL '1 days'
        AND CURRENT_DATE + INTERVAL '1 days'
        `;
        client.query(query,(req,result)=>{
        console.log(result.rows)
        callback(result.rows)
      });
    },
}
module.exports = Order;