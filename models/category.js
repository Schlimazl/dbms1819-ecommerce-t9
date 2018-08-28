var Category = { 
  list: (client, filter, callback) => {
    const productCategoryQuery = `SELECT * FROM products_category`;
    client.query(productCategoryQuery, (req, data) =>{
      console.log(data.rows);
      callback(data.rows);
    });
  }
}

module.exports = Category;