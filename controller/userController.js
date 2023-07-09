
const User = require('../model/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Category = require("../model/categoryModel");
const Products = require('../model/poductModel')
const { ObjectId } = require('mongodb');
const Order = require('../model/orderModel');
const Coupon = require('../model/couponModel')
const moment = require("moment");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path')
const Offer = require('../model/offerModel')







const generateInvoicePDF = async (orderId, res) => {
  try {
    const orderData = await Order.find({ orderId: orderId }).lean();

    // Create a new PDF document
    const doc = new PDFDocument();

    // Set the response headers for PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);

    // Create a write stream for PDF file
    const pdfPath = `./public/files/invoice_${orderId}.pdf`;
    const writeStream = fs.createWriteStream(pdfPath);

    // Pipe the PDF document to the write stream
    doc.pipe(writeStream);

    // Add content to the PDF document
    doc.font('Helvetica-Bold').fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(`Order ID: ${orderId}`);
    // Add more content to the PDF document based on your invoice data

    // Finalize the PDF document
    doc.end();

    // Download the PDF file
    res.download(pdfPath, function (error) {
      if (error) {
        console.log(error);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};






const crypto = require('crypto');
const randomstring = require('randomstring');
const { elements } = require('chart.js');
const { error, log } = require('console');

function generateOTP() {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

const securePass = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const sendOtpMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'n758899@gmail.com',
        pass: 'hczdjlgrlqrfpbrc',
      },
    });
    const mailOptions = {
      from: 'n758899@gmail.com',
      to: email,
      subject: 'OTP Verification',
      html: `<p>Your  registration one-time password is ${otp}</p>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error.message);
      } else {
        console.log('Email has been sent:', info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

let savedotp;
let name;
let email;
let password;
let confirmPassword;
let mobile;
let city;
let refCode

const sendotp = async (req, res) => {
  try {
    const otp = generateOTP();
    savedotp = otp;
    console.log(otp, "otp");
    name = req.body.name;
    email = req.body.email;
    password = req.body.password;
    confirmPassword = req.body.confirmPassword;
    mobile = req.body.mobile;
    city = req.body.city;
    refCode = req.body.referral


    const already = await User.findOne({ email: req.body.email });
    if (!already) {
      sendOtpMail(email, otp);
      res.render('otpverify');

    } else {
      res.render('signup', {
        message: 'Your email is already registered',
      });
    }
  } catch (error) {
    res.status(500).send('Error sending OTP');

  }
};

const verifyotp = async (req, res) => {
  const already = await User.find({ referral: refCode })
  if (already.length == 0) {
    const otp = req.body.otp;
    if (otp === savedotp) {
      try {
        const referralCode = generateReferralCode(8);
        const spassword = await securePass(password);
        const user = new User({
          name: name,
          email: email,
          password: spassword,
          confirmPassword: spassword,
          mobile: mobile,
          city: city,
          isblocked: false,
          is_admin: 0,
          referral: referralCode
        });
        const userEmail = await User.findOne({ email: email });
        if (!userEmail) {
          const userData = await user.save();
          if (userData) {
            res.render('login', {
              message: '',
            });
          } else {
            res.render('login', {
              message: '',
            });
          }
        } else {
          res.render('signup', {
            message: 'The entered email already exists.',
          });
        }
      } catch (error) {
        console.log(error.message);
        res.render('error')
      }
    }
    else {
      res.render('otpverify', { error: 'Invalid OTP' });
    }
  } else {
    const referraluserId = already[0]._id
    let existingwallet = already[0].wallet
    let updatedwalletamounnt = existingwallet + 100
    await User.findByIdAndUpdate(referraluserId, { $set: { wallet: updatedwalletamounnt } })
    const otp = req.body.otp;
    if (otp == savedotp) {
      const referralCode = generateReferralCode(8)
      const spassword = await securePass(password)
      const newuser = new User({
        name: name,
        email: email,
        password: spassword,
        confirmPassword: spassword,
        mobile: mobile,
        city: city,
        isblocked: false,
        is_admin: 0,
        referral: referralCode,
        wallet: 100
      })
      await newuser.save()
      res.render('login', { message: "Account created successfully" })
    } else {
      res.render('otpverify', { error: "invalid opt" })
      res.render('error')
    }
  }




};


function generateReferralCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}

const loadSignup = async (req, res) => {
  try {
    const user = req.session.user
    if (!user) {
      res.render('signup');
    }
    else {
      res.redirect('/')
    }

  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};

const loadlogin = async (req, res) => {
  try {
    const user = req.session.user
    if (!user) {
      res.render('login');
    } else {
      res.redirect('/')
    }

  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    let message = '';

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (!userData.isblocked) {
          if (userData.is_verified == 0) {
            message = 'Email is incorrect';
          } else {
            const categoryData = await Category.find({ isDeleted: false });
            const productData = await Products.find({ isDeleted: false, });
            if (categoryData.length > 0) {
              req.session.user = userData._id;
              res.redirect("/");
              return res.render("userHome", { data: categoryData, product: productData, user: userData, message: message, userdata });
            } else {
              return res.render("userHome", { data: categoryData, product: productData, message: message });
            }
          }
        } else {
          message = 'User is blocked';
        }
      } else {
        message = 'Email and Password do not match';
      }
    } else {
      message = 'Email and Password do not match';
    }

    res.render('login', { message: message, email: email });
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};

const loadHome = async (req, res) => {
  try {
    const categoryData = await Category.find({ isDeleted: false });
    const productData = await Products.find({ isDeleted: false });

    if (req.session.user) {
      const user = new ObjectId(req.session.user)

      const userdata = await User.findById(user)
      console.log("data", categoryData);

      res.render("userHome", { data: categoryData, product: productData, user: user, userdata: userdata });

    }
    else {

      res.render("userHome", { data: categoryData, product: productData });
    }
  } catch (error) {
    console.log(error.message);

  }
};




const categorydetails = async (req, res) => {
  try {
    const user = new ObjectId(req.session.user);
    const userdata = await User.findById(user);
    const sortOption = req.query.sort || 'default';
    const currentPage = parseInt(req.query.page) || 1;
    const pageSize = 8; // Number of products per page
    const id = req.params.id;
    const categoryData = await Category.find();
    const totalProducts = await Products.countDocuments({
      isDeleted: false,
      category: id
    });
    const totalPages = Math.ceil(totalProducts / pageSize);
    const skip = (currentPage - 1) * pageSize;
    let sortQuery = {};

    if (sortOption === 'lowToHigh') {
      sortQuery = { price: 1 };
    } else if (sortOption === 'highToLow') {
      sortQuery = { price: -1 };
    }

    const searchKeyword = req.query.search || '';

    const pipeline = [
      {
        $match: {
          isDeleted: false,
          category: new ObjectId(id),
          productName: { $regex: searchKeyword, $options: 'i' }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      }
    ];

    if (Object.keys(sortQuery).length > 0) {
      pipeline.push({ $sort: sortQuery });
    }

    pipeline.push(
      { $skip: skip },
      { $limit: pageSize }
    );

    const productData = await Products.aggregate(pipeline);


    if (req.session.user) {
      const usersession = req.session.user;
      const userdata = await User.findById(usersession);
      const user = await User.findById(req.session.user);


      res.render('products', {
        catdetails: productData,
        user: user,
        userdata: userdata,
        sortOption,
        currentPage,
        totalPages,
        data: categoryData,
        searchKeyword
      });

    }
    else {
      res.render('products', {
        catdetails: productData,
        sortOption,
        currentPage,
        totalPages,
        data: categoryData,
        searchKeyword
      });

    }




  } catch (error) {
    console.log(error.message);
    res.render('error');
  }
};



const productdetails = async (req, res) => {
  try {

    const productid = req.params.id
    const productdetail = await Products.findById({ _id: productid })
    const Related = await Products.aggregate([
      { $match: { isDeleted: false } },
      { $sample: { size: 4 } }
    ]);
    if (req.session.user) {
      const usersession = req.session.user;
      const userdata = await User.findById(usersession);
      const user = await User.findById(req.session.user);
      res.render('product-detail', { prodetail: productdetail, user, userdata, Related })
    }
    else {
      res.render('product-detail', { prodetail: productdetail, Related })
    }

  } catch (error) {
    console.log(error.message)
  }
}
const cart = async (req, res) => {
  try {
    const usersession = req.session.user;
    const userdata = await User.findById(usersession);
    const user = await User.findById(req.session.user);
    const userData = req.session.user;
    const cartData = await User.aggregate([
      { $match: { _id: new ObjectId(userData) } },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$cartItems.productId"] } } },
          ],
          as: "productcartData",
        },
      },
    ]);
    const productDat = await Products.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "products",
        },
      },
    ]);

    const cartProducts = cartData[0].productcartData;

    // Update quantity for each cart item in cartProducts
    cartProducts.forEach((cartProduct) => {
      const cartItem = user.cart.find((item) =>
        cartProduct._id && item.productId && item.productId.equals(cartProduct._id)
      );
      cartProduct.quantity = cartItem ? cartItem.quantity : 1;
    });

    let subtotal = 0;
    cartProducts.forEach((cartProduct) => {
      subtotal = subtotal + Number(cartProduct.price) * cartProduct.quantity;
    });

    const length = cartProducts.length;
    res.render("cart", { cartProducts, subtotal, length, user, userdata });
  } catch (error) {
    console.log(error.message);
  }
};



const removeCartProduct = async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      { _id: req.session.user },
      { $pull: { cart: { productId: req.params.id } } }
    );
    res.json("success");
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};



const checkincart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userid = req.session.user;

    const user = await User.findById(userid);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const cartItems = user.cart.map((item) => item.productId);
    const inCart = cartItems.includes(productId);

    res.json({ inCart });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
    res.render('error')
  }
}

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userid = req.session.user;
    const cartData = await User.updateOne(
      { _id: userid },
      { $addToSet: { cart: { productId: productId } } }
    );

    const updatedWishlist = await User.findByIdAndUpdate(
      { _id: req.session.user },
      { $pull: { wishlist: productId } },
      { new: true }
    );
    res.json("success");
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
    res.render('error')
  }
};





const loadallproducts = async (req, res) => {
  try {

    const categoryData = await Category.find()
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    const sortOption = req.query.sort || 'default';
    const categoryId = req.query.category || '';

    let categoryQuery = {};

    if (categoryId) {
      categoryQuery = { category: categoryId };
    }

    let sortQuery = {};

    if (sortOption === 'lowToHigh') {
      sortQuery = { price: 1 };
    } else if (sortOption === 'highToLow') {
      sortQuery = { price: -1 };
    }

    const totalProducts = await Products.countDocuments(categoryQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    let productData;

    if (sortOption === 'category') {
      productData = await Products.find(categoryQuery)
        .populate('category')
        .sort({ 'category.name': 1 })
        .skip(skip)
        .limit(limit);
    } else {
      productData = await Products.find(categoryQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit);
    }
    if (req.session.user) {
      const usersession = req.session.user;
      const userdata = await User.findById(usersession);
      const user = await User.findById(req.session.user);

      res.render('allproducts', {
        productData,
        totalPages,
        currentPage: page,
        sortOption,
        selectedCategory: categoryId,
        categories: categoryData,
        userdata,
        user
      });
    } else {
      res.render('allproducts', {
        productData,
        totalPages,
        currentPage: page,
        sortOption,
        selectedCategory: categoryId,
        categories: categoryData,

      });
    }


  } catch (error) {
    console.log(error.message);
   
  }
};















const loadWishlist = async (req, res) => {
  try {
    const usersession = req.session.user
    const userData = await User.findById(usersession);

    const session = req.session.user
    const wishlist = await User.findById(new ObjectId(session));

    if (!wishlist) {
      res.render('wishlist', { items: [], user: session })
    }
    const items = await Products.find({ _id: { $in: wishlist.wishlist } })

    res.render("wishlist", { items, user: session, userdata: userData });


  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}
const addWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.session.user;
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $addToSet: { wishlist: productId } },
      { new: true }
    );
    res.json({ wishlist: user.wishlist }); // Return only the wishlist items
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error adding product to wishlist!" });
    res.render('error')
  }
};
const removefromWishlist = async (req, res) => {
  try {
    console.log(".oooooooooooooooooooooooooooooo");
    const { productId, index } = req.body;
    const userId = req.session.user;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    );
    console.log("perfeeeeect okkkkkkkkkkkk", updatedUser);

    if (!updatedUser) {
      throw new Error("Error removing the product from the wishlist!");
    }

    const wishlistProducts = updatedUser.wishlist;
    res.status(200).json({
      wishlistProducts,
      message: "Product removed from the wishlist",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


const generateResetToken = () => {
  const token = crypto.randomBytes(20).toString('hex');
  return token;
};




const loadForgot = async (req, res) => {
  try {
    res.render('forgetpassword');
  } catch (error) {
    console.log(error.message);
    res.render('error')

  }
};


const sendResetMail = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password',
      html: `<p>Hello,</p>
               <p>Click the link below to reset your password:</p>
               <a href="http://localhost:3000/reset-password?token=${token}">Reset Password</a>
               `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email has been sent:', info.response);
    return info;
  } catch (error) {
    console.log(error.message);
    throw new Error('Error sending password reset email');
    res.render('error')
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('forgetpassword', { message: 'User not found.' });
    }

    if (user.is_verified === 100) {
      const token = randomstring.generate();
      user.token = token;
      await user.save();

      const info = await sendResetMail(user.email, token);

      if (info) {
        return res.render('forgetpassword', {
          message: 'Please check your email for password reset instructions.',
        });
      } else {
        throw new Error('Failed to send the password reset email');
      }
    } else {
      return res.render('forgetpassword', {
        message: 'Please verify your email before resetting the password.',
      });
    }
  } catch (error) {
    console.log(error.message);
    res.render('error')
    return res.render('forgetpassword', {
      message: 'An error occurred. Please try again.',
    });
  }
};
const forgetpasswordload = async (req, res) => {
  try {
    const token = req.query.token
    const tokendata = await User.findOne({ token: token })
    if (tokendata) {
      res.render('reset-password', { user_id: tokendata._id })
    } else {
      res.render('inavlid')
    }

  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}
const resetpassword = async (req, res) => {
  try {
    const password = req.body.password
    const user_id = req.body.user_id

    const secure_password = await securePass(password)

    const updateddata = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } })
    res.redirect('/login')
  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}

const addadress = async (req, res) => {
  try {
    const userData = new ObjectId(req.session.user);

    const address = await User.findByIdAndUpdate(
      { _id: userData },
      { $addToSet: { address: req.body } }
    );
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
};




const coupon = async (req, res, next) => {
  try {
    const codeId = req.body.code;
    const total = req.body.total;
    const couponData = await Coupon.findOne({ code: codeId }).lean();

    const userData = await Coupon.findOne({
      code: codeId,
      userId: req.session.user
    }).lean();

    if (couponData && couponData.date > moment().format("YYYY-MM-DD")) {
      const offerPrice = couponData.percentage;

      if (userData) {
        res.json("fail");
      } else {
        const amount = (total * offerPrice) / 100;
        const gtotal = total - amount;
        res.json({ offerPrice, gtotal });


      }
    } else {
      res.json("fail");
    }
  } catch (error) {
    next(error);
    res.render('error')
  }

};



const loadeditaddresscheckoutpage = async (req, res) => {
  try {
    const user = await User.findById(req.session.user);

    const userData = new ObjectId(req.session.user);
    const id = req.query.id;
    const userAddress = await User.findOne(
      { address: { $elemMatch: { _id: id } } },
      { "address.$": 1, _id: 0 }
    );
    res.render("checkoutEditAddress", { address: userAddress, user, userdata: userData });
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};

const editAddressCheckout = async (req, res) => {
  try {

    const id = req.query.id;
    console.log("id>>>>>>>>", id)
    console.log(req.body);
    const userAddress = await User.updateOne(
      { address: { $elemMatch: { _id: id } } },
      { $set: { "address.$": req.body } }
    );
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};



const addAddressCheckout = async (req, res) => {
  try {

    const userData = req.session.user;
    const address = await User.findByIdAndUpdate(
      { _id: userData },
      { $addToSet: { address: req.body } }
    );
    res.redirect("/loadcheckout");
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};


const addNewAddressCheckout = async (req, res) => {
  try {
    const user = await User.findById(req.session.user);

    const userData = new ObjectId(req.session.user);
    res.render("addNewAddressCheckout", { user, userdata: userData });
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};



let user;
let couponCode;
let couponAmount;

const placeOrder = async (req, res) => {
  try {
    console.log("jhdsjajdhjdsjdsahkjadjkjgggggggggggggggggggggggggggggggggggggggggggggggggggg");
    const userId = req.session.user;
    user = await User.findById(userId);


    const addressId = req.body.addressId;
    const address = user.address;

    if (!address) {
      return res.status(400).json({ error: "Address not found." });
    }

    const {
      productid,
      productname,
      price,
      quantity,
      payment,
      subtotal,
    } = req.body;

    // Generate the order ID
    const result = Math.random().toString(36).substring(2, 7);
    const id = Math.floor(100000 + Math.random() * 900000);
    const orderId = result + id;

    const shoeProduct = productid.map((item, i) => ({
      id: productid[i],
      name: productname[i],
      price: price[i],
      quantity: quantity[i],
    }));

    let total = subtotal;
    let remainingAmount = total;


    if (req.body.coupon) {
      const couponCode = req.body.coupon;
      const appliedCoupon = await Coupon.findOne({ code: couponCode });

      if (appliedCoupon) {
        const couponAmount = appliedCoupon.percentage;
        const amount = (subtotal * couponAmount) / 100;
        total = subtotal - amount;
      }
    }

    if (payment === "3") {
      const walletBalance = user.wallet;

      if (walletBalance >= total) {
        remainingAmount = 0;
        const updatedWalletBalance = walletBalance - total;
        user.wallet = updatedWalletBalance;
        await user.save();
      } else {
        return res.status(400).json({ error: "Insufficient wallet balance." });
      }
    }

    const orderData = {
      userId: userId,
      product: shoeProduct,
      orderId: orderId,
      date: moment().toDate(),
      status: "processing",
      payment_method: String(payment),
      addressId: addressId,
      address: address,
      subtotal: subtotal,
      total: total,
      remainingAmount: remainingAmount,
      user: user,
    };

    // Save the order
    const orderPlacement = new Order(orderData);

    try {
      const savedOrder = await orderPlacement.save();
      if (savedOrder) {
        user.cart = [];
        await user.save();
        req.session.page = "fghnjm";
        return res.json({ res: "success", data: orderData });
      } else {
        throw new Error("Order placement failed.");
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ error: "An error occurred. Please try again." });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: "An error occurred. Please try again." });
  }
};



const loadcheckoutpage = async (req, res) => {
  try {
    const coupon = await Coupon.find({ status: "Active" });

    const usersession = req.session.user;
    const userdata = await User.findById(usersession);
    const address = await User.findById(req.session.user).select("address");
    const cartData = await User.aggregate([
      {
        $match: { _id: new ObjectId(req.session.user) },
      },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$cartItems.productId"] } } },
          ],
          as: "Cartproducts",
        },
      },
    ]);

    let subtotal = 0;
    const cartProducts = cartData[0].Cartproducts;

    cartProducts.map((cartProduct, i) => {
      cartProduct.quantity = quantitys[i];
      subtotal = subtotal + cartProduct.price * quantitys[i];
    });

    res.render("checkout", {
      productDetails: cartData[0].Cartproducts,
      subtotal: subtotal,
      address: address.address,
      logged: 1,
      total: subtotal,
      offer: 0,
      user: usersession,
      userdata,
      coupon,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const quantitys = [];
const checkOut = async (req, res) => {
  try {
    const coupon = await Coupon.find({ status: "Active" });

    const usersession = req.session.user;
    const userdata = await User.findById(usersession);
    const address = await User.findById(req.session.user).select("address");
    const cartData = await User.aggregate([
      {
        $match: { _id: new ObjectId(req.session.user) },
      },
      {
        $lookup: {
          from: "products",
          let: { cartItems: "$cart" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$cartItems.productId"] } } },
          ],
          as: "Cartproducts",
        },
      },
    ]);

    let subtotal = 0;
    const cartProducts = cartData[0].Cartproducts;

    cartProducts.map((cartProduct, i) => {
      cartProduct.quantity = req.body.quantity[i];
      subtotal = subtotal + cartProduct.price * req.body.quantity[i];
      quantitys[i] = req.body.quantity[i];
    });

    res.render("checkout", {
      productDetails: cartData[0].Cartproducts,
      subtotal: subtotal,
      address: address.address,
      logged: 1,
      total: subtotal,
      offer: 0,
      user: usersession,
      userdata,
      coupon,
    });
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};


const cancelOrder = async (req, res) => {
  try {
    const id = req.query.id;
    const orderData = await Order.findById({ _id: id }).lean();

    if (orderData.status === "Cancelled" || orderData.status === "Returned") {
      res.redirect("/order");
      return;
    }


    if (orderData.status == "Approved") {
      const userWallet = await User.findOne({ _id: orderData.userId });


      await cancelOrderAndUpdateStock(orderData, id);
      res.redirect("/order");
      return;
    }

    const updateOrder = await Order.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: "Pending",
        },
      }
    );

    res.redirect("/order");
  } catch (error) {
    console.log(error.message);
    res.redirect("/order");
    res.render('error')
  }
};



const logout = async (req, res) => {
  try {
    req.session.user = false
    res.redirect('/login')
  } catch (error) {
    error.message
    res.render('error')
  }
}

const updateCartQuantity = async (req, res) => {
  try {
    const productId = req.params.productId;
    const newQuantity = req.body.quantity;

    const user = await User.findById(req.session.user);
    const cartItem = user.cart.find(item => item.productId.toString() === productId.toString());

    if (cartItem) {
      cartItem.quantity = newQuantity;
    }

    await user.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
    res.render('error')
  }
};


const walletupdate = async (req, res) => {
  //   try {
  //     console.log("walllet update route");
  //     const { amount } = req.body;


  //  await User.findOne({ _id: req.user.id }, (err, user) => {
  //     if (err) {

  //       return res.json({ success: false, message: "Error occurred while deducting amount from the wallet." });
  //     }

  //     if (!user) {

  //       return res.json({ success: false, message: "User not found." });
  //     }

  //     if (user.wallet >= amount) {

  //       user.wallet -= amount;


  //       user.save((err) => {
  //         if (err) {

  //           return res.json({ success: false, message: "Error occurred while deducting amount from the wallet." });
  //         }

  //         return res.json({ success: true, message: "Amount deducted from the wallet successfully." });
  //       });
  //     } else {

  //       return res.json({ success: false, message: "Insufficient balance in the wallet." });
  //     }
  //   });
  //   } catch (error) {
  //     console.log(error.message);
  //     res.render('error')
  //   }
}

const addnewaddress = async (req, res) => {
  try {
    res.render('addnewaddress')
  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}

const loadprofile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user);

    const userData = new ObjectId(req.session.user);
    const id = await User.findById({ _id: userData });
    res.render('profile', { userData: id, address: id.address, user, userdata: userData })
  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}

const profileEdit = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id });
    if (userData) {
      res.render("profileedit", { userData: userData });
    } else {
      res.redirect("/profile");
    }
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};


const updateProfile = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          email: req.body.email,
          mobile: req.body.mobile,
        },
      }
    );
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};


const decrementOrIncrementCart = async (req, res) => {
  try {
    const cartId = req.body.cartId;
    const itemId = req.body.itemId;
    const value = req.body.value;
    const cartDoc = await Cart.findOne({ _id: cartId });
    const item = cartDoc.item.find((i) => i._id.toString() === itemId);
    const product = await Product.findOne({ _id: item.product });
    let updatedPrice = (item.quantity + value) * product.price.toFixed(2)
    incPrice = value * product.price.toFixed(2)
    if (item) {
      if (item.quantity + value >= product.stock) {
        res.status(400).json({ error: " Out of stock" });
      } else {
        if (item.quantity + value == 0) {
          await Cart.updateOne(
            { _id: cartId },
            {
              $pull: {
                item: { "_id": new ObjectId(item._id) }
              }
            }
          )
        }
        const updates = [
          {
            updateOne: {
              filter: { _id: cartId, "item._id": itemId },
              update: { $inc: { "item.$.quantity": value } }
            }
          },
          {
            updateOne: {
              filter: { _id: cartId },
              update: { $inc: { "totalPrice": incPrice } }
            }
          }
        ];
        await Cart.bulkWrite(updates)
        res.json({ success: true });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};

const successorder = async (req, res, next) => {
  try {

    if (req.session.page) {
      delete req.session.page;
      const orderData = await Order.find({}).sort({ _id: -1 }).limit(1);

      res.render("successorder", { logged: 1, order: orderData });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
}

const checklogin = async (req, res) => {

  // Check if the user is logged in
  if (req.session.user) {
    // User is logged in
    res.json({ loggedIn: true });
  } else {
    // User is not logged in
    res.json({ loggedIn: false });
  }



}

const loadorder = async (req, res) => {
  try {
    const usersession = req.session.user
    const userData = await User.findById(usersession);
    const orderData = await Order.find({
      userId: req.session.user,
    }).sort({ _id: -1 });
    res.render("order", { order: orderData, user: usersession, userdata: userData });
  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
}




const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findByIdAndUpdate(
      { _id: new ObjectId(req.session.user) },
      { $pull: { address: { _id: id } } }
    );

    res.redirect("/profile");
  } catch (error) {
    console.log(error.message)
    res.render('error')
  }
};
// const invoicedownload = async (req, res) => {
//   try {
//     const orderId = req.query.id;
//     console.log("req.query", req.query);
//     console.log("invoideeeeeee", orderId);
//     const browser = await puppeteer.launch({ headless: "new" });
//     const page = await browser.newPage();
//     const url = `${req.protocol}://${req.get('host')}/invoice?orderId=${orderId}`;

//     await page.goto(url, {
//       waitUntil: "networkidle2"
//     });

//     await page.setViewport({ width: 1680, height: 1050 });
//     const todayDate = new Date();
//     const pdfPath = path.join(__dirname, '../public/files', todayDate.getTime() + ".pdf");

//     await page.pdf({
//       path: pdfPath,
//       printBackground: true,
//       format: "A4"
//     });

//     await browser.close();

//     // res.set({
//     //   "Content-Type": "application/pdf",
//     //   "Content-Length": pdfPath.length
//     // });

//     // res.sendFile(pdfPath);
//     res.download(pdfPath, function (error) {
//       if (error) {
//         console.log(error);
//       }
//     })
//   } catch (error) {
//     console.log(error.message);
//   }
// };



// const invoice = async (req, res) => {
//   try {

//     const orderId = req.query.orderId
//     console.log("orderid", orderId);
//     const orderData = await Order.find({ orderId: orderId }).lean();
//     console.log("invoice data", orderData);

//     res.render("orderDetailspdf", { order: orderData });
//   } catch (error) {
//     console.log(error.message);
//   }
// };



const loadSingleOrder = async (req, res) => {
  try {
    const orderData = await Order.findOne({ orderId: req.query.id })
      .populate({
        path: 'product',
        select: 'name price quantity image',
      })
      .lean();

    console.log("orderData:");
    console.log(orderData);

    res.render("orderDetails", { orders: [orderData] });

  } catch (error) {
    console.log(error.message);
    res.render('error')
  }
};


const removeaddresscheckoutpage = async (req, res) => {
  try {
    const id = req.body.addressId;

    const userId = req.session.user;

    const updateResult = await User.updateOne(
      {
        _id: userId,
        "address._id": id,
      },
      {
        $pull: {
          address: { _id: id },
        },
      }
    );
    res.json({
      res: "success",
    });
  } catch (error) {
    console.log(error.message);
  }
};
const sortedProductList = async (req, res) => {
  try {
    const categoryId = new ObjectId(req.query.id);
    const sortValue = parseInt(req.query.value, 10);
    const page = parseInt(req.query.page, 10) - 1;
    const limitVal = parseInt(req.query.limit, 10);

    let query = {
      isDeleted: false,
      isCategoryDeleted: false,
      "category._id": categoryId,
      stock: { $ne: 0 }
    };

    let sort = {};

    if (sortValue === 1) {
      sort = { price: 1 }; // Sort by price low to high
    } else if (sortValue === -1) {
      sort = { price: -1 }; // Sort by price high to low
    }

    const sortedProductData = await Product.find(query)
      .sort(sort)
      .skip(page * limitVal)
      .limit(limitVal);

    res.json(sortedProductData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const productssort = async (req, res) => {

  const sortParam = req.query.sort; // Get the sorting parameter from the query string

  try {
    let sortQuery = {};

    if (sortParam === 'lowToHigh') {

      sortQuery = { price: 1 };
    } else if (sortParam === 'highToLow') {

      sortQuery = { price: -1 };
    } else {

      return res.status(400).json({ error: 'Invalid sorting parameter' });
    }


    const products = await Products.find().sort(sortQuery).exec();

    return res.json(products);
  } catch (error) {

    return res.status(500).json({ error: 'An error occurred' });
  }
}



module.exports = {
  loadSignup,
  loadlogin,
  verifyLogin,
  loadHome,
  verifyotp,
  sendotp,
  categorydetails,
  productdetails,
  loadWishlist,
  removefromWishlist,
  forgotPassword,
  loadForgot,
  forgetpasswordload,
  resetpassword,
  addadress,
  addToCart,
  cart,
  removeCartProduct,
  checkOut,
  logout,
  updateCartQuantity,
  addnewaddress,
  loadprofile,
  decrementOrIncrementCart,
  loadcheckoutpage,
  placeOrder,
  successorder,
  loadorder,
  loadSingleOrder,
  deleteAddress,
  removeaddresscheckoutpage,
  addNewAddressCheckout,
  addAddressCheckout,
  loadeditaddresscheckoutpage,
  editAddressCheckout,
  coupon,
  cancelOrder,
  profileEdit,
  updateProfile,
  addWishlist,
  checklogin,
  sortedProductList,
  checkincart,
  walletupdate,
  productssort,
  generateInvoicePDF,
  loadallproducts



};
