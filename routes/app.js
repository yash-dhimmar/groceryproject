const path = require('path')
const express = require('express');
const User = require('../models/user')
const UserController = require('../controllers/Usercontroller');
const authMiddleware = require('../middleware/auth');
const router = express.Router()

/* user login api */
router.post('/login', UserController.login);

/* send otp to user mobile number */
router.post('/sendotp', UserController.sendotp)

/* update user detail */
router.post('/update', authMiddleware.authenticate, UserController.update);

/* resend otp to user mobile number */
router.post('/resendotp', UserController.resendotp);

/* product category  */
router.post('/category', UserController.category);

/* product subcategory  */
router.post('/subcategory-product-list', UserController.product);

/* product search  */
router.post('/product-search', UserController.search);

/* user product add-to-cart */
router.post('/add-to-cart', authMiddleware.authenticate, UserController.addtocart);

/* user product add-to-cart delete */
router.post('/delete_cart_product', authMiddleware.authenticate, UserController.deletecart);

/* user product display cart-list */
router.post('/cart-list', authMiddleware.authenticate, UserController.cartlist);

/* user product wishlist */
router.post('/wishlist', authMiddleware.authenticate, UserController.wishlist);

/* user product getwishlist */
router.post('/getwishlist', authMiddleware.authenticate, UserController.getwishlist);

/* brands of product */
router.post('/brandsfilter', UserController.brandsfilter);

/* product discount */
router.post('/discount', UserController.discount);

/* product sortBy */
router.post('/sortby', UserController.sortby);

/* product  of brand search */
router.post('/brandsearch', UserController.brandsearch);

/* product of price (min/max) */
router.post('/pricerange', UserController.pricerange);

/* user add-address */
router.post('/add-address', authMiddleware.authenticate, UserController.addaddress);

/* user address delete */
router.post('/delete-address', authMiddleware.authenticate, UserController.deleteaddress);

/* user address list */
router.post('/address-list', authMiddleware.authenticate, UserController.addresslist);

/* user home management */
router.get('/homepage', authMiddleware.authenticate,UserController.homepage)

router.post('/checkout',authMiddleware.authenticate,UserController.checkout)

router.post('/order-list',authMiddleware.authenticate,UserController.orderlist)

router.post('/order-details',authMiddleware.authenticate,UserController.orderdetail)









module.exports = router;

//yash