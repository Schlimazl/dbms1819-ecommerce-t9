var exports = module.exports = {};

var Content = {
    getById: (client,id,callback) => {
      const blogListQuery =  `
        SELECT
          *
        FROM
          blog
        WHERE
          id = '${id.blogId}'
      `;
      client.query(blogListQuery,(req,result)=>{
      console.log(result.rows)
        callback(result.rows)
      });
    },
    update: (client,blogId,blogData,callback) => {
      const blogListQuery =  `
        UPDATE
          blog
        SET
          name = '${blogData.name}', description = '${blogData.desc}', url = '${blogData.url}', pic = '${blogData.pic}'
        WHERE id = '${blogId.blogId}'
      `;
      client.query(blogListQuery,(req,result)=>{
      //  console.log(result.rows)
        callback(result)
      });
    },
    stylistGetById: (client,id,callback) => {
      const stylistListQuery =  `
        SELECT
          *
        FROM
          stylist
        WHERE
          id = '${id.stylistId}'
      `;
      client.query(stylistListQuery,(req,result)=>{
      console.log(result.rows)
        callback(result.rows)
      });
    },
    stylistUpdate: (client,stylistId,stylistData,callback) => {
      const stylistListQuery =  `
        UPDATE
          stylist
        SET
          name = '${stylistData.name}', description = '${stylistData.desc}', pic = '${stylistData.pic}', fb = '${stylistData.fb}',  ig = '${stylistData.ig}'
        WHERE id = '${stylistId.stylistId}'
      `;
      client.query(stylistListQuery,(req,result)=>{
      //  console.log(result.rows)
        callback(result)
      });
    }
  }

module.exports = Content;