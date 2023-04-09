const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const responseController = require('../controllers/responseController');
const validator = require('../middleware/validation');
const { brandsearchValidation } = require('../middleware/validation');
class Usercontroller {
  /*  user login Through mobile number */
  async login(req, res) {
    try {
      await validator.loginValidation(req.body);
      var user = await User.login(req.body.mobilenumber, req.body.otp);
      if (user) {
        var token = jwt.sign({ user }, 'secretkey', { expiresIn: '5d' })
      }
      await db.query(`update users set auth_token= '${token}', otp=null where mobilenumber='${user.mobilenumber}'`)
      user.auth_token = token;
      return responseController.success(user, 'user login successfully', res);
    } catch (error) {
      console.log('error', error);
      return responseController.error(error, res);
    }
  }
  /* send otp to user mobile number */
  async sendotp(req, res) {
    try {
      await validator.sendOtpValidation(req.body);
      let data = await User.sendotp(req.body.mobilenumber);
      //console.log('data ====>', data)
      return responseController.success(data, 'otp sent successfully', res)
    } catch (error) {
      return responseController.error(error, res);
    }
  }
  /* user details updated */
  async update(req, res) {
    try {
      await validator.updateValidation(req.body);
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey');
      var mobilenumber = decodedData.user.mobilenumber;
      var data = await User.update(req.body.firstname, req.body.lastname, req.body.email, mobilenumber);
      return responseController.success(data, 'details updated', res);
    } catch (error) {
      return responseController.error(error, res);
    }
  }
  /* resend otp to user mobile number */
  async resendotp(req, res) {
    try {
      await validator.resendotpValidation(req.body);
      var data = await User.resendotp(req.body);
      return responseController.success(data, 'resend OTP success', res)
    } catch (error) {
      return responseController.error(error, res)
    }
  }
  /* product category  */
  async category(req, res) {
    try {
      let data = await User.category(req.body);
      return responseController.success(data, 'category inserted successfully', res)
    } catch (error) {
      return responseController.error(error, res)
    }
  }
  /* product  */
  async product(req, res) {
    try {
      await validator.productValidation(req.body);
      let data = await User.product(req.body);
      return responseController.success(data, 'product', res);
    } catch (error) {
      return responseController.error(error, res)
    }
  }
  /* searching product  */
  async search(req, res) {
    try {
      await validator.searchValidation(req.body)
      let data = await User.search(req.body);
      return responseController.success(data, 'search', res);
    } catch (error) {
      return responseController.error(error, res);
    }
  }
  /* product add-to-cart  */
  async addtocart(req, res) {
    try {
      await validator.addtocartValidation(req.body);
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey')
      var id = decodedData.user.id;
      let data = await User.addtocart(req.body, id);
      return responseController.success(data, 'quantity add-to-cart- updated', res);
    } catch (error) {
      return responseController.error(error, res)
    }
  }
  /* add-to-cart product remove from table  */
  async deletecart(req, res) {
    try {
      await validator.deleteValidation(req.body);
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey')
      var id = decodedData.user.id;
      let data = await User.deletecart(req.body, id);
      return responseController.success(data, 'deleted-product from add-to-cart', res);
    } catch (error) {
      return responseController.error(error, res)
    }
  }
  /*  user cart list product */
  async cartlist(req, res) {
    try {
      // await validator.cartlistValidation(req.body);
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey')
      var id = decodedData.user.id;
      let data = await User.cartlist(req.body, id)
      return responseController.success(data, 'cart-list', res);
    } catch (error) {
      return responseController.error(error, res);
    }
  }
  /* product wishlist */
  async wishlist(req, res) {
    try {
      await validator.wishlistValidation(req.body);
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey');
      var id = decodedData.user.id;
      var data = await User.wishlist(req.body, id);
      return responseController.success(data, 'wishlist', res);
    } catch (error) {
      return responseController.error(error, res);
    }
  }
  /* product getwishlist  */
  async getwishlist(req, res) {
    try {
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey');
      var id = decodedData.user.id;
      let data = await User.getwishlist(id);
      return responseController.success(data, 'getwishlist', res)
    } catch (error) {
      return responseController.error(error, res);
    }
  }
  /* product of  brand   */
  async brandsfilter(req, res) {
    try {
      let data = await User.brandsfilter(req.body)
      return responseController.success(data, 'brandsfilter', res);
    } catch (error) {
      return responseController.error(error, res);
    }
  }

  /* product discount  */
  async discount(req, res) {
    try {
      let data = await User.discount(req.body)
      return responseController.success(data, 'discount', res);
    } catch (error) {
      return responseController.error(error, res);
    }
  }
  /*  product price sortby */
  async sortby(req, res) {
    try {
      let data = await User.sortby(req.body)
      return responseController.success(data, 'sortby', res);
    } catch (error) {
      return responseController.error(error, res);
    }
  }
  /*  brands searching*/
  async brandsearch(req, res) {
    try {
      await validator.brandsearchValidation(req.body);
      let data = await User.brandsearch(req.body.search)
      return responseController.success(data, 'brandsearch', res)
    } catch (error) {
      return responseController.error(error, res)
    }
  }
  /* product price range */
  async pricerange(req, res) {
    try {
      let data = await User.pricerange(req.body)
      return responseController.success(data, 'pricerange', res)
    } catch (error) {
      return responseController.error(error, res)
    }
  }
  /* user add  address */
  async addaddress(req, res) {
    try {
      await validator.addressvalidation(req.body);
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey')
      var id = decodedData.user.id
      let data = await User.addaddress(req.body, id)
      return responseController.success(data, 'address inserted successfully', res)
    } catch (error) {
      return responseController.error(error, res)
    }
  }
  /* user delete  address */
  async deleteaddress(req, res) {
    try {
      await validator.deleteaddressValidation(req.body);
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey');
      var id = decodedData.user.id;
      let data = await User.deleteaddress(req.body, id);
      return responseController.success(data, 'address deleted', res)
    } catch (error) {
      return responseController.error(error, res)
    }
  }
  /* user address-list */
  async addresslist(req, res) {
    try {
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey');
      var id = decodedData.user.id;
      let data = await User.addresslist(id);
      return responseController.success(data, 'address-list', res);
    } catch (error) {
      return responseController.error(error, res);
    }
  }

  async homepage(req, res) {
    try {
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey')
      var id = decodedData.user.id;
      let data = await User.homepage(id)
      return responseController.success(data, 'homepage', res)
    } catch (error) {
      return responseController.error(error, res)
    }
  }

  async checkout(req, res) {
    try {
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey')
      var id = decodedData.user.id;
      let data = await User.checkout(id,req.body)
      return responseController.success(data, 'checkout', res)
    } catch (error) {
      console.log("error================>",error)
      return responseController.error(error, res)
    }
  }

  async orderlist(req, res) {
    try {
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey')
      var id = decodedData.user.id;
      let data = await User.orderlist(id)
      return responseController.success(data, 'checkout', res)
    } catch (error) {
      console.log("error================>",error)
      return responseController.error(error, res)
    }
  }


  async orderdetail(req, res) {
    try {
      var token = req.headers.authorization;
      var decodedData = jwt.verify(token, 'secretkey')
      var id = decodedData.user.id;
      let data = await User.orderdetail(id,req.body)
      return responseController.success(data, 'checkout', res)
    } catch (error) {
      console.log("error================>",error)
      return responseController.error(error, res)
    }
  }
}
module.exports = new Usercontroller()