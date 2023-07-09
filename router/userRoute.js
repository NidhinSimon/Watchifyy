const express = require('express')
const userController = require('../controller/userController')
const session = require('express-session');
const user_route = express()
const { v4: uuidv4 } = require('uuid')
const userauth = require('../middleware/userauth');
const { Long } = require('mongodb');
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: 'rzp_test_wGbm1yWaFa8Vyh', key_secret: 'DvdveTngGfDRR6evZLhLQ8sq', });
user_route.use(express.json());
user_route.use(express.urlencoded({ extended: false }))


user_route.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: true,
  }
}))



user_route.set('view engine', 'ejs')
user_route.set('views', './views/users')




user_route.get('/signup', userController.loadSignup);
// user_route.post('/signup',userController.insertuser)
user_route.post('/signup', userController.sendotp)
user_route.post('/verify-otp', userController.verifyotp)

user_route.post('/loadcheckout', userController.checkOut);




user_route.get("/edit-checkOutAddress", userController.loadeditaddresscheckoutpage);
user_route.post("/edit-checkOutAddress", userController.editAddressCheckout);



user_route.get('/checkout-address', userController.addNewAddressCheckout);
user_route.post('/checkout-address', userController.addAddressCheckout);

user_route.get('/login', userController.loadlogin);
user_route.post('/login', userController.verifyLogin)
user_route.get('/logout', userController.logout)
user_route.get('/catdetail/:id', userController.categorydetails)
user_route.get('/productdetail/:id', userController.productdetails)

user_route.delete('/removeproduct/:id', userauth.userLogin, userController.removeCartProduct);

user_route.get("/loadcheckout", userauth.userLogin, userController.loadcheckoutpage);
user_route.post('/cart/update/:productId', userauth.userLogin, userController.updateCartQuantity);


user_route.get('/wishlist', userauth.userLogin, userController.loadWishlist)
user_route.post('/addwishlist', userController.addWishlist);
user_route.post('/removefromwishlist', userController.removefromWishlist)



user_route.post('/forgotpassword', userController.forgotPassword);
user_route.get('/forgotpassword', userController.loadForgot);
user_route.get('/reset-password', userController.forgetpasswordload)
user_route.post('/reset-password', userController.resetpassword)

user_route.get('/success', userauth.userLogin, userController.successorder);


user_route.get("/cart", userauth.userLogin, userController.cart);
user_route.post('/addtocart', userauth.userLogin, userController.addToCart);

user_route.post('/addnewaddress', userController.addadress)
user_route.get('/address', userController.addnewaddress)

user_route.get('/', userController.loadHome)

user_route.post('/place-order', userauth.userLogin, userController.placeOrder);

user_route.post('/validateCoupon', userController.coupon)

user_route.get('/single-order', userController.loadSingleOrder);

user_route.get('/profile', userauth.userLogin, userController.loadprofile)

user_route.get('/order', userController.loadorder)

user_route.get('/delete-address', userController.deleteAddress);

user_route.post("/removeaddress-checkoutpage", userController.removeaddresscheckoutpage);

user_route.get('/cancel-order', userauth.userLogin, userController.cancelOrder)

user_route.get('/profileEdit', userauth.userLogin, userController.profileEdit);

user_route.post('/profileEdit', userauth.userLogin, userController.updateProfile);
user_route.get('/check-login', userController.checklogin)

user_route.post('/checkcart', userController.checkincart)

user_route.get('/sortfilter', userController.sortedProductList);


user_route.post('/cart/update/:productId', userauth.userLogin, userController.updateCartQuantity);

// user_route.get('/reportgenerate', userauth.userLogin, userController.invoicedownload)
// user_route.get('/invoice', userController.invoice)


user_route.post('/deduct-amount',userController.walletupdate)


user_route.get('/products',userController.productssort)

user_route.get('/invoice/:orderId',userController.generateInvoicePDF)

user_route.get('/shop',userController.loadallproducts)
// Route to generate and download the invoice PDF




user_route.post('/create/orderId', (req, res) => {
  console.log("Create OrderId Request", req.body)
  var options = {
    amount: req.body.amount,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "rcp1"
  };
  instance.orders.create(options, function (err, order) {
    console.log(order);
    res.send({ orderId: order.id });//EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
  });
});





user_route.post("/api/payment/verify", (req, res) => {

  let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

  var crypto = require("crypto");
  var expectedSignature = crypto.createHmac('sha256',process.env.RZR_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  console.log("sig received ", req.body.response.razorpay_signature);
  console.log("sig generated ", expectedSignature);
  var response = { "signatureIsValid": "false" }
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { "signatureIsValid": "true" }
  res.send(response);
});




module.exports = user_route;