const jwt = require('jsonwebtoken')
const Joi = require('joi')
const moment = require('moment-timezone');
const promise = require('bluebird');
const { reject, resolve } = require('bluebird');

class User {
  /* user login Through mobilenumber */
  async login(mobilenumber, otp) {
    try {
      let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
      console.log(date);
      // check mobile number is exitst or not
      var [mobileNumber] = await db.query(`select mobilenumber,otp from users where mobilenumber='${mobilenumber}'`)
      console.log(mobileNumber);
      if (mobileNumber.length == 0) {
        throw new Error("enter valid phone number");
      }
      // check number and otp is valid or not
      var [otpDetail] = await db.query(`select id,firstname,lastname,email,image,mobilenumber from users where mobilenumber='${mobilenumber}' and otp='${otp}'`)
      if (otpDetail.length == 0) {
        throw new Error("otp is not valid");
      }
      return otpDetail[0];
    } catch (error) {
      console.log('error', error);
      return promise.reject(error)
    }
  }
  /* send otp to user mobile number */
  async sendotp(mobilenumber) {
    try {
      var otp = Math.floor(1000 + Math.random() * 9000);
      var [user] = await db.query(`select mobilenumber,otp from users where mobilenumber='${mobilenumber}'`)
      if (user.length > 0) {
        await db.query(`UPDATE users set otp='${otp}' WHERE mobilenumber ='${mobilenumber}';`);
      } else {
        var [user] = await db.query(`INSERT INTO users(mobilenumber) VALUES ('${mobilenumber}');`);
        if (user) {
          await db.query(`UPDATE users set isregistered ='1',otp='${otp}' WHERE mobilenumber ='${mobilenumber}';`)
        }
      }
      user[0].otp = otp;
      return user[0];
    } catch (error) {
      promise.reject(error);
    }
  }
  /*user deatais updated */
  async update(firstname, lastname, email, mobilenumber) {
    try {

      return new Promise(async (resolve, reject) => {
        let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        console.log(date);
        var [data] = await db.query(`select * from users where email = '${email}'`)
        if (!data.length > 0) {
          var [uquery] = await db.query(`SELECT id,firstname,lastname,email,mobilenumber,auth_token,otp,isregistered FROM users where mobilenumber='${mobilenumber}' and isregistered="1"`)
          //console.log("updateee", uquery)
          if (uquery.length > 0) {
            var [update] = await db.query(`UPDATE users set firstname ='${firstname}', lastname= '${lastname}',email ='${email}' where mobilenumber='${mobilenumber}'`)
            {
              if (uquery) {
                return resolve(uquery);
              } else {
                var updatestatus = { message: 'not udatated your data' }
                reject(updatestatus)
              }
            }
          } else {
            var data = { message: "invalid mobilenumber" }
            reject(data)
          }
        } else {
          var err = { message: "email is already exit" }

          reject(err);
        }
      })
    } catch (error) {
      throw error
    }
  }
  /*resend otp  user mobilenumber */
  async resendotp(body) {
    try {
      return new Promise(async (resolve, reject) => {
        let { mobilenumber } = body
        const [data] = await db.query(`SELECT * FROM users where mobilenumber = '${mobilenumber}' and isregistered = 1;`)
        if (data.length > 0) {
          var y = Math.floor(1000 + Math.random() * 9000);
          //console.log("otp===============>", y);
          db.query(`UPDATE users set otp='${y}' where mobilenumber = '${mobilenumber}'; `)
          return resolve();
        }
        var detail = {
          status: 501,
          message: 'you are not register please register'
        }
        return reject(detail);
      })
    } catch (error) {
      return reject(error)
    }
  }
  /*category  and subcategory list*/
  async category() {
    try {
      return new Promise(async (resolve, reject) => {
        let [category, field] = await db.query(`SELECT * FROM category `);

        for (let x = 0; x < category.length; x++) {
          const [subcategory, fields] = await db.query(`SELECT * from subcategory WHERE category_id = '${category[x].category_id}'`);
          category[x].list = subcategory;
          console.log("subcategory===============>", subcategory);
        }
        console.log("category==================>", category)
        resolve(category);
      })
    } catch (error) {
      return reject(error)
    }
  }
  /* product */
  async product(body) {
    try {
      let { subcategory_id } = body;
      let [subcategories, field] = await db.query(`SELECT subcategory_id from subcategory where subcategory_id='${subcategory_id}'`);
      if (subcategories.length > 0) {
        let subcategory = subcategories[0];
        // get product list
        let products = await this.productList(subcategory.subcategory_id);
        // get brand list
        let brands = await this.brandList(subcategory.subcategory_id);
        return { product_list: products, brand_list: brands };
      }
    } catch (error) {
      return promise.reject(error);
    }
  }
  async brandList(subcategory_id) {
    try {
      const [brands, fields] = await db.query(`SELECT brand_id,brandname,image FROM brand where subcategory_id='${subcategory_id}';`);
      return brands;
    } catch (error) {
      error.code = 501;
      return promise.reject(error);
    }
  }
  async productList(subcategory_id) {
    try {
      const [products, fields] = await db.query(`SELECT p.product_id, b.brand_id, p.productname, p.price, p.image, p.discount_price, p.variation, b.brandname, CASE WHEN w.wish_id IS NULL THEN 0 ELSE 1 END as is_like
      FROM product p
      LEFT OUTER JOIN brand as b on p.brand_id = b.brand_id
      LEFT OUTER JOIN wishlist as w on w.product_id = p.product_id
    where p.subcategory_id = '${subcategory_id}';`);
      return products;
    } catch (error) {
      error.code = 501;
      return promise.reject(error);
    }
  }
  /*searching product and filtering brands,price,discount,sortBy*/
  async search(body) {
    try {
      let { search, filter } = body;
      let whereCondition = `WHERE 1 = 1`;
      let orderBy = ` p.created_date DESC`;
      if ('search' in body) {
        search = search.trim();
        whereCondition = whereCondition + ` AND p.productname like '%${search}%'`;
      }
      if ('filter' in body) {
        let filterCondition = await this.filterBy(filter, whereCondition);
        whereCondition = filterCondition.whereCondition;
        orderBy = filterCondition.orderBy;
      }
      let query = `SELECT p.product_id, b.brand_id, p.productname, p.price, p.image, p.discount_price, p.variation, b.brandname, CASE WHEN w.wish_id IS NULL THEN 0 ELSE 1 END as is_like
      FROM product p
      LEFT OUTER JOIN brand as b on p.brand_id = b.brand_id
      LEFT OUTER JOIN wishlist as w on w.product_id = p.product_id
      ${whereCondition} ORDER BY ${orderBy};`;
      //console.log('query =====>', query);
      const [products, fields] = await db.query(query);
      return products;
    } catch (error) {
      error.code = 501;
      return promise.reject(error)
    }

  }
  async filterBy(filter, whereCondition) {
    let orderBy = ` p.created_date DESC`;
    if ('brands' in filter) {
      let brandIds = filter.brands.toString();
      whereCondition = whereCondition + ` AND p.brand_id in (${brandIds})`;
    }
    if ('price' in filter && filter.price.length > 0) {
      let minPrice = filter.price.min;
      let maxPrice = filter.price.max;
      whereCondition = whereCondition + ` AND p.price >= (${minPrice}) AND p.price <= (${maxPrice})`;
    }
    if ('discount' in filter && filter.discount != null && filter.discount != '') {
      let minDiscount, maxDiscount;
      switch (filter.discount) {
        case 1:
          minDiscount = 0;
          maxDiscount = 5;
          break;
        case 2:
          minDiscount = 20;
          maxDiscount = 30;
          break;
        case 3:
          minDiscount = 30;
          maxDiscount = 50;
          break;
      }
      whereCondition = whereCondition + ` AND p.discount_price >= (${minDiscount}) AND p.discount_price < (${maxDiscount})`;
    }
    if ('sortBy' in filter) {
      switch (filter.sortBy) {
        case 1:
          orderBy = ` p.price ASC`;
          break;
        case 2:
          orderBy = ` p.price DESC`;
          break;
      }
    }
    return { whereCondition: whereCondition, orderBy: orderBy }
  }
  /* user product add-to-cart */
  async addtocart(body, id) {
    try {
      return new Promise(async (resolve, reject) => {
        var { product_id, quantity } = body;
        var [detail] = await db.query(`select * from add_to_cart  where product_id ='${product_id}'and user_id = '${id}'`)
        if (detail.length > 0) {
          const [data2] = await db.query(`update add_to_cart set quantity = quantity+'${quantity}' where product_id= '${product_id}' and user_id='${id}'`)
          resolve(data2[0])
        } else {
          var [check] = await db.query(`select * from product where product_id = '${product_id}'`)
          if (check.length > 0) {
            if (check[0].stock == 1) {
              var [ins] = await db.query(`insert into add_to_cart(product_id,user_id,quantity) values 
                ('${product_id}','${id}','${quantity}')`)
              resolve(ins[0])
            } else {
              resolve("stock is not available")
            }
          } else {
            var err = { message: "id not found please enter a valid product_id" }
            reject(err)
          }
        }
      })
    } catch (error) {
      return reject(error)
    }
  }
  /* user product add-to-cart item deleted */
  async deletecart(body, id) {
    try {
      return new Promise(async (resolve, reject) => {
        let { product_id } = body;
        var [data] = await db.query(`select * from add_to_cart where product_id ='${product_id}'`)
        if (data.length > 0) {
          var [remove] = await db.query(`delete from add_to_cart where product_id = '${product_id}'and user_id = '${id}';`)
          if (remove) {
            return resolve(remove[0]);
          }
        } else {
          var err = { message: "product id not found please enter valid product id" }
          reject(err)
        }
      })
    } catch (error) {
      return reject(error);
    }
  }
  /*  user cart list product */
  async cartlist(body, id) {
    try {
      return new Promise(async (resolve, reject) => {
        let { product_id, quantity, coupan_id } = body
        var detail1 = [];
        var discountsum = 0;

        const [data] = await db.query(`delete add_to_cart from add_to_cart left join product ON 
                                    product.product_id= add_to_cart.product_id where product.stock='0' `)
        if ('quantity' && 'product_id' in body) {
          const [detail] = await db.query(`update add_to_cart set quantity = quantity +'${quantity}' where user_id ='${id}' and product_id ='${product_id}'`)
        }
        const [del] = await db.query(`delete from add_to_cart where quantity = '0'`)

        const [join] = await db.query(`select product.productname,product.image,product.price,product.variation from product join add_to_cart ON 
                                     product.product_id= add_to_cart.product_id where user_id = '${id}'`)

        let [data2] = await db.query(`select * from product join add_to_cart ON 
                                    product.product_id = add_to_cart.product_id where add_to_cart.user_id ='${id}'`)
        let finalcart = await this.finalcart(id, body)
        resolve(join.concat(finalcart))
      })
    } catch (error) {
      return reject(error)
    }
  }
  /*  user product wishlist */
  async wishlist(body, id) {
    try {
      return new Promise(async (resolve, reject) => {
        var { product_id } = body
        var [product] = await db.query(`select * from product where product_id='${product_id}'`)
        if (product.length > 0) {
          var [data] = await db.query(`select * from wishlist where user_id='${id}' and product_id='${product_id}'`);
          if (data.length > 0) {
            var [del] = await db.query(`delete from wishlist where user_id='${id}' and product_id='${product_id}'`);
            console.log('--------')
            var alldel = { message: "product deleted from wishlist successfully" }
            console.log("alldel=================>", alldel)
            resolve(alldel)
            if (del) {
              var [flag1] = await db.query(`update product set flag='0' where product_id='${product_id}'`);
              console.log("----->>flagdelete", flag1)
            }
          } else {
            var [insert] = await db.query(`INSERT INTO wishlist (user_id,product_id) values ('${id}','${product_id}')`)
            var allinsert = { message: "product inserted to wishlist successfully" }
            resolve(allinsert)
            console.log("allinsert=================>", allinsert)
            if (insert) {
              var [flag] = await db.query(`update product set flag='1' where product_id='${product_id}'`);
              console.log("----->>flaginsert", flag)
            }
          }
        } else {
          var err = { message: "product id not found please enter valid product id" }
          reject(err)
        }
      })
    } catch (error) {
      return reject(error);
    }
  }
  /* user product getwishlist */
  async getwishlist(id) {
    try {
      return new Promise(async (resolve, reject) => {
        const [data] = await db.query(`select * from wishlist join product ON 
                product.product_id= wishlist.product_id where wishlist.user_id='${id}'`);
        console.log("data=================>", data)
        if (data) {
          return resolve(data)
        }
      })
    } catch (error) {
      return reject(error);
    }
  }
  /* brands name */
  async brandsfilter() {
    try {
      return new Promise(async (resolve, reject) => {
        const [brand] = await db.query(`select brandname from brand`)
        if (brand) {
          resolve(brand);
        }
      })
    } catch (error) {
      return reject(error);
    }
  }
  /* product   discount */
  async discount() {
    try {
      var discount = {
        1: "upto 5%",
        2: "5% - 10%",
        3: "10%-15%",
        4: "15%-25%",
        5: "morthan 25%"
      }
      return (discount);
    } catch (error) {
      promise.reject(error);
    }
  }
  /* product price sortby */
  async sortby() {
    try {
      return new Promise(async (resolve, reject) => {
        var sortby = {
          1: "popularity",
          2: "Price-Low to High",
          3: "Price-High to Low",
          4: "Alphabetical",
          5: "Rupee saving-High to Low",
          6: "Rupee saving-Low to High",
          7: "%off-High to Low"
        }
        return resolve(sortby);
      })
    } catch (error) {
      return reject(error);
    }
  }
  /* user brandsearching */
  async brandsearch(search) {
    try {
      var detail = []
      var [brand] = await db.query(`SELECT * FROM brand`);
      for (let x = 0; x < brand.length; x++) {
        if (brand[x].brandname.match(`${search}`.trim())) {
          detail.push(brand[x]);
          //console.log("data===================>", detail);
        }
      }
      return (detail);
    } catch (error) {
      promise.reject(error);
    }
  }
  /*product pricerange */
  async pricerange(body) {
    try {
      var [range] = await db.query(`select min(price) as minprice, max(price) as maxprice from product`)
      return (range);
    } catch (error) {
      promise.reject(error);
    }
  }
  /* user add  address */
  async addaddress(body, id) {
    try {
      return new Promise(async (resolve, reject) => {
        let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        let { type, home_details, landmark, recipient_name } = body
        let [detail] = await db.query(`select * from address where user_id = '${id}'and type = '${type}'`)
        if (!detail.length > 0) {
          const [data] = await db.query(`INSERT into  address (user_id,type,home_details,landmark,recipient_name,created_date,updated_date) values 
                           ('${id}','${type}','${home_details}','${landmark}','${recipient_name}','${date}','${date}');`)
          if (data) {
            return resolve(data[0])
          }
        } else {
          var err = { message: "user alredy insert address" }
          return reject(err)
        }
      })
    } catch (error) {
      return reject(error)
    }
  }
  /* user delete  address */
  async deleteaddress(body, id) {
    try {
      return new Promise(async (resolve, reject) => {
        var { address_id } = body
        const [data1] = await db.query(`select * from address where user_id ='${id}'and address_id='${address_id}'`);
        console.log("data1========>", data1)
        if (data1.length > 0) {
          let [data] = await db.query(`delete from address where user_id='${id}' and address_id = '${address_id}'`)
          console.log("data========>", data)
          if (data) {
            return resolve(data[0])
          }
        } else {
          var err = { message: "address_id not found please enter valid address_id" }
          return reject(err);
        }
      })
    } catch (error) {
      return reject(error);
    }
  }
  /* user address list */
  async addresslist(id) {
    try {
      return new Promise(async (resolve, reject) => {
        let [data] = await db.query(`select * from address where user_id = '${id}'`)
        if (data) {
          return resolve(data)
        }
      })
    } catch (error) {
      return reject(error);
    }
  }

  /* home management  */
  async homepage(id) {
    try {
      return new Promise(async (resolve, reject) => {
        const [data] = await db.query(`select * from section`)
        for (let i = 0; i < data.length; i++) {
          const [slider] = await db.query(`select s.slider_id,s.image,s.category_id from slider as s join category on s.category_id = category.category_id 
                                 where s.section_id = '${data[i].section_id}'`)
          if (slider.length > 0) {
            data[i].list = slider
          } else {
            data[i].list = [];
          }
          const [section_category, field] = await db.query(`select * from section_category join category on section_category.category_id = category.category_id 
                                    where section_category.section_id = '${data[i].section_id}'`)
          if (section_category.length > 0) {
            data[i].list = section_category
          }
          const [section_brand] = await db.query(`select * from section_brand join brand on section_brand.brand_id = brand.brand_id
                                           where section_brand.section_id= '${data[i].section_id}'`)
          if (section_brand.length > 0) {
            data[i].list = section_brand
          }
          const [section_product] = await db.query(`select * from section_product join product on section_product.product_id = product.product_id
                                           where section_product.section_id= '${data[i].section_id}'`)
          if (section_product.length > 0) {
            data[i].list = section_product
          }
        }
        resolve(data)
      })
    } catch (error) {
      return reject(error)
    }
  }
  async finalcart(id, body) {

    let { coupan_id } = body

    var final = [];
    var sum = 0

    /*mainprice object*/
    let [total] = await db.query(`select sum(price * quantity) as price from product inner join add_to_cart on product.product_id=add_to_cart.product_id where add_to_cart.user_id='${id}';`)
    var total2 = total[0].price



    /*total object*/
    let [data2] = await db.query(`select product.price as price ,product.discount as discount,product.discount_price as discount_price,add_to_cart.quantity as quantity from product inner join add_to_cart on product.product_id=add_to_cart.product_id where add_to_cart.user_id='${id}'and product.stock='1'`)

    for (let i = 0; i < data2.length; i++) {

      data2[i].price = data2[i].price * data2[i].quantity
      data2[i].discount = data2[i].discount * data2[i].quantity
      data2[i].discount_price = data2[i].discount_price * data2[i].quantity


      var discount = data2[i].price * data2[i].discount / 100

      if (discount < data2[i].discount_price) {
        var text = data2[i].price - discount

      } else {

        var text = data2[i].price - data2[i].discount_price

      }
      final.push(text)

    }

    for (let j = 0; j < final.length; j++) {
      sum = sum + final[j]
    }

    /*tax calculation for the total price */
    let [tax] = await db.query(`select tax from setting`)
    var tax2 = tax[0].tax
    var tax3 = sum * tax2 / 100

    /* delivery charge object */
    let [charge] = await db.query(`select free_delivery_upto as r from setting;`)
    var delivery = charge[0].r

    if (sum > delivery) {
      var result = "free"
    } else {
      var [data3] = await db.query(`select delivery_charges as p from setting;`)
      var result2 = data3[0].p
    }

    /* grand total object */

    if (result) {

      var data = sum + tax3

    } else {

      var grandtotal2 = sum + tax3 + result2

    }
    /* total saving object*/
    var saving = total2 - sum
    /* coupen management */

    const [coupan] = await db.query(`select * from coupan_management where coupan_id='${coupan_id}'`)

    if (coupan.length > 0) {

      const d = new Date()
      var currentdate = moment(coupan[0].startdate)
      var lastdate = moment(coupan[0].enddate)
      if (currentdate.isSameOrBefore(lastdate)) {
        if (sum > coupan[0].min_price) {
          data = data - coupan[0].discount_price
          grandtotal2 = grandtotal2 - coupan[0].discount_price
          saving = saving + coupan[0].discount_price
        }
        else {
          return (`total is not greter than '${coupan[0].min_price}' than coupan is not used`)
        }
      }
      else {
        return ("coupen is expired")
      }

    }
    let cart = {
      main_price: total2,
      sub_total: sum,
      tax: tax3,
      delivery_charge: result || result2,
      grand_total: data || grandtotal2,
      totalsaving: saving
    }
    return cart;
  }
  async checkout(id, body) {
    return new Promise(async (resolve, reject) => {
      try {

        let { address_id, coupan_id } = body

        var [address] = await db.query(`select address_id from address where user_id='${id}' and address_id='${address_id}'`)

        var cod = "CASH ON DELIEVERY"

        //finalcart function call 
        var data = await this.finalcart(id, body)

        let date = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

        var check = await db.query(`select * from add_to_cart where user_id='${id}'`)

        if (check.length > 0) {

          var [data2] = await db.query(`insert into orders(date,user_id,sub_total,delivery_charge,grand_total,payment_type,address_id,status,coupan_id) 
          values ('${date}','${id}','${data.sub_total}','${data.delivery_charge}','${data.grand_total}','${cod}','${address[0].address_id}','${1}','${coupan_id}')`)
          console.log("data2=============>", data2)
          if (data2) {
            var [index] = await db.query(`select * from product inner join add_to_cart on product.product_id=add_to_cart.product_id  join orders on add_to_cart.user_id=orders.user_id where orders.user_id='${id}' and add_to_cart.user_id='${id}'`)

            for (let i = 0; i < index.length; i++) {
              var orderitem = await db.query(`insert into order_items(product_id,order_id,price,discount_price,quantity)values('${index[i].product_id}','${index[i].order_id}','${index[i].price}','${index[i].discount_price}','${index[i].quantity}')`)
            }
          }
        }
        var cartlist = {
          item_total: data,
          delieverytype: cod
        }
        resolve(cartlist)
      } catch (error) {
        return reject(error)
      }
    })
  }
  async orderlist(id) {
    return new Promise(async (resolve, reject) => {
      try {

        var [data] = await db.query(`select orders.date ,orders.order_id,orders.status,orders.grand_total as Totalpayment,address.type as Deliveredto from orders inner join address on address.address_id=orders.address_id where orders.user_id='${id}'`)
        resolve(data)

      } catch (error) {
        return reject(error)
      }
    })
  }

  async orderdetail(id, body) {
    return new Promise(async (resolve, reject) => {
      try {

        var { order_id } = body

        var [data] = await db.query(`select orders.order_id as order_id,orders.payment_type as payment_type ,orders.date as date,address.home_details as home_details , address.landmark as landmark from orders inner join address on orders.address_id=address.address_id where orders.user_id='${id}' and orders.order_id='${order_id}'`)

        var [items] = await db.query(`select product.image,product.productname,product.price,order_items.quantity from order_items inner join product on order_items.product_id=product.product_id where  order_items.order_id='${order_id}'`)
        data[0].item = items
        console.log("items=================>", items)
        var [bill] = await db.query(`select sub_total,delivery_charge,grand_total from orders where order_id='${order_id}'`)
        console.log("bill=================>", bill)
        data[0].bill_details = bill

        resolve(data)

      } catch (error) {
        return reject(error)
      }
    })
  }




}
module.exports = new User();





















































































