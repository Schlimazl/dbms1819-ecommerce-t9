var exports = module.exports = {};

var email = {
   create: (client,brandData,callback) => {
      var brandData = [brandData.brand_name,brandData.brand_desc ];
      const brandInsertQuery =  `
       INSERT INTO products_brand (name,description) 
       VALUES ($1,$2)
      `;
      client.query(brandInsertQuery,brandData)
      .then(res => callback('SUCCESS'))
      .catch(e => callback('ERROR'))
    }
  }

module.exports = email;