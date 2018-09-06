var exports = module.exports = {};

var Customer = {
    top10CustomerHighestPayment: (client,filter,callback) => {
      const query =  `
          SELECT DISTINCT first_name, last_name,
          SUM (quantity * price)
          FROM orders
          INNER JOIN products ON products.id = orders.products_id
          INNER JOIN customers ON customers.id = orders.customers_id
          GROUP BY first_name, last_name ORDER BY SUM DESC limit 10
      `;
      client.query(query,(req,result)=>{
        console.log(result.rows)
        callback(result.rows)
      });
    }
};

module.exports = Customer;