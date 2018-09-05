var Product = {
  getById: (client, productId, callback) => {
    const productQuery = `SELECT products_category.name AS categoryname,
        products.price AS price,
        products.id AS id,
        products.name AS productname,
        products.pic AS pic,
        products.descriptions AS desc,
        products_brand.name AS productbrand
      FROM products 
      INNER JOIN products_category 
      ON products_category.id = products.category_id 
      INNER JOIN products_brand 
      ON products_brand.id = products.brand_id 
      WHERE products.id= ${productId}
    `;
    client.query(productQuery, (req, data) =>{
      console.log(req);
      console.log(data.rows[0]);
      var productData = {
        category_name: data.rows[0].categoryname,
        price: data.rows[0].price,
        id: data.rows[0].id,
        product_name: data.rows[0].productname,
        pic: data.rows[0].pic,
        desc: data.rows[0].desc,
        product_brand: data.rows[0].productbrand
      };
      callback(productData);
    })
  },

  list: (client, filter, callback) => {
    const productListQuery = `SELECT * FROM Products`;
    client.query(productListQuery, (req, data) =>{
      console.log(data.rows);
      callback(data.rows);
    });
  }
}

module.exports = Product;