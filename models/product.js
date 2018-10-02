var exports = module.exports = {};

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
  getUserById: (client, userId, callback) =>{
    const userQuery = `SELECT * FROM customers WHERE id = ${userId}`;
    client.query(userQuery, (req, data) =>{
      callback(data.rows);
    })
  },

  list: (client, limit, offset, filter, callback) => {
    const productListQuery = `
    SELECT * 
    FROM products 
    ORDER BY id
   LIMIT '${limit.limit}' OFFSET '${offset.offset}'
    `;
    client.query(productListQuery, (req, data) => {
      console.log(data.rows);
      callback(data.rows);
    });
    console.log(productListQuery);
  },

create: (client,productData,callback) => {
      var productData = [
      productData.product_name,
      productData.product_desc,
      productData.product_price,
      productData.product_category,
      productData.product_brand,
      productData.product_pic
      ];
      const productInsertQuery =  `
       INSERT INTO products (name,descriptions,price,category_id,brand_id,pic)
       VALUES ($1,$2,$3,$4,$5,$6)
      `;
      client.query(productInsertQuery,productData)
      .then(res => callback('SUCCESS'))
      .catch(e => callback('ERROR'))
    },
}

module.exports = Product;