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
    },
    getById: (client,id,callback) => {
      const brandListQuery =  `
        SELECT
          *
        FROM
          products_brand
        WHERE
          id = '${id.brandId}'
      `;
      client.query(brandListQuery,(req,result)=>{
      //  console.log(result.rows)
        callback(result.rows)
      });
    },
    update: (client,brandId,brandData,callback) => {
      const brandListQuery =  `
        UPDATE
          products_brand
        SET
          name = '${brandData.name}', description = '${brandData.desc}'
        WHERE id = '${brandId.brandId}'
      `;
      client.query(brandListQuery,(req,result)=>{
      //  console.log(result.rows)
        callback(result)
      });
    }
  }

module.exports = Brand;