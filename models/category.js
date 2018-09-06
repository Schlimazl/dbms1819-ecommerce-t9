var exports = module.exports = {};

var Category = { 
  create: (client,categoryData,callback) => {
      var category = [categoryData.category_name ];
      const categoryInsertQuery =  `
       INSERT INTO products_category (name) 
       VALUES ($1)
      `;
      client.query(categoryInsertQuery,category)
      .then(res => callback('SUCCESS'))
      .catch(e => callback('ERROR'))
    },
    
  list: (client, filter, callback) => {
    const categoryListQuery = `SELECT * FROM products_category ORDER BY id ASC`;
    client.query(categoryListQuery, (req, result) =>{
      callback(result.rows);
    });
  }
}

module.exports = Category;