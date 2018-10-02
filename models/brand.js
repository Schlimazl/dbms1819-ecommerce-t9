var exports = module.exports = {};

var Brand = {
   create: (client,brandData,callback) => {
      var brandData = [brandData.brand_name,brandData.brand_desc ];
      const brandInsertQuery =  `
       INSERT INTO products_brand (name,description) 
       VALUES ($1,$2)
      `;
      client.query(brandInsertQuery,brandData)
      .then(res => callback('SUCCESS'))
      .catch(e => callback('ERROR'))
    },
    list: (client,filter,callback) => {
      const brandListQuery =  `
        SELECT
          *
        FROM
          products_brand order by name ASC
      `;
      client.query(brandListQuery,(req,result)=>{
        callback(result.rows)
      });
    }
  }

module.exports = Brand;