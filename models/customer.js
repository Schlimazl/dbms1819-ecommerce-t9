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
    }, 
    getByEmail: (client,email,callback) => {
      const query =  `
          select * from customers where email = '${email}'
      `;
      client.query(query,(req,result)=>{
        callback(result.rows[0])
      });
    },
     getCustomerData: (client,id,callback) => {
      const query =  `
          select * from customers where id = '${id.id}'
      `;
      client.query(query,(req,result)=>{
        callback(result.rows);
      });
    },
    comparePassword: (candidatePassword, hash, callback) => {
      bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        if(err) throw err;
        callback (null, isMatch);
      });
    },

     getById: (client,id,callback) => {
      const query =  `
          select * from customers where id = '${id}'
      `;
      client.query(query,(req,result)=>{
        callback(result.rows[0]);
      });
    },

      update: (client,customerId,customerData,callback) => {
      const query =  `
        UPDATE
          customers
        SET
          email = '${customerData.email}', first_name = '${customerData.fName}', last_name = '${customerData.lName}', house_number = '${customerData.hNumber}', street = '${customerData.street}', barangay = '${customerData.brgy}', city = '${customerData.city}', country = '${customerData.country}', password = '${customerData.pass}'
        WHERE id = '${customerId.id}'
      `;
      client.query(query,(req,result)=>{
      //  console.log(result.rows)
        callback(result)
      });
    },

    signup: (client,customersData,callback) => {
    var customersData = [
      customersData.fName,
      customersData.lName,
      customersData.email,
      customersData.pass,
      customersData.hNumber,
      customersData.street,
      customersData.brgy,
      customersData.city,
      customersData.country,
      customersData.user_type
      ];
    const query =  `
     INSERT INTO customers (first_name, last_name, email, password, house_number, street, barangay, city, country, user_type) 
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    `;
    client.query(query,customersData)
    .then(res => callback('SUCCESS'))
    .catch(e => callback('ERROR'))
  }
};

module.exports = Customer;