const Offer = require('../model/offerModel')
const Category = require('../model/categoryModel')
const Product = require('../model/poductModel')
const { products } = require('./admincontroller')
const moment = require('moment');
const express = require('express');

const cron = require('node-cron');
const app = express()


cron.schedule('0 0 * * *', () => {
  handleexpiredoffers()

});

const offerLoad = async (req, res) => {
  try {
    const offerdata = await Offer.find()

    if (offerdata.length > 0) {
      res.render("adminofferlist", { data: offerdata, text: "" })
    } else {
      res.render("adminofferlist", { data: offerdata, text: "no ofers" })
    }
  } catch (error) {
    console.log(error.message)
  }
}
const productoffercreate = async (req, res) => {
  try {
    const productData = await Product.find()
    res.render('adminproductoffercreate', { data: productData })
  } catch (error) {
    console.log(error.message)
  }
}

const addproductoffer = async (req, res) => {
  try {
    const offerName = req.body.name;
    const offerPercentage = parseInt(req.body.percentage, 10);
    const product = req.body.product;

    const lowerOfferName = offerName.toLowerCase();
    const offerExist = await Offer.findOne({ name: lowerOfferName });

    if (!offerExist) {
      const existingProduct = await Product.findById({ _id: product });
      const originalProductPrice = existingProduct.price;
      const newPrice = Math.round(
        originalProductPrice *
        ((100 - (existingProduct.offerPercentage + offerPercentage)) / 100)
      );

      const duration = req.body.duration;
      const expiryDate = moment().add(duration, 'days').toDate();

      await Product.findByIdAndUpdate(
        { _id: product },
        { $set: { price: newPrice } }
      );
      await Product.findByIdAndUpdate(
        { _id: product },
        { $set: { offerPercentage: existingProduct.offerPercentage + offerPercentage } }
      );

      const newOffer = new Offer({
        name: offerName,
        percentage: offerPercentage,
        product: product,
        duration: duration,
        expiryDate: expiryDate,
        status: "Active",
      });
      await newOffer.save();

      await Product.findByIdAndUpdate(
        { _id: product },
        { $set: { isActiveOffer: true } }
      );

      res.redirect("/offer");
    } else {
      res.redirect("/productOfferCreate");
    }
  } catch (error) {
    console.log(error.message);
  }
};



const categoryoffercreate = async (req, res) => {
  try {
    const categoryData = await Category.find()
    res.render('admincategorycreate', { data: categoryData })
  } catch (error) {
    console.log(error.message)
  }
}
const addcategoryoffer = async (req, res) => {
  try {
    const offerName = req.body.name
    const offerPercentage = parseInt(req.body.percentage, 10)
    const category = req.body.category
    const upperoffername = offerName.toUpperCase()
    const offerExist = await Offer.findOne({ name: upperoffername })

    if (!offerExist) {
      await Product.find({ category: category })
        .then((products) => {
          products.forEach((product) => {
            product.price = Math.round(product.offerPrice - product.offerPrice * ((product.offerPercentage + offerPercentage)) / 100),
              product.offerPercentage = product.offerPercentage + offerPercentage;
            product.save();
          })
        })

      const newOffer = new Offer({
        name: offerName,
        percentage: offerPercentage,
        category: category,
      })
      await newOffer.save()

      res.redirect('/offer')
    } else {
      res.redirect('/categoryoffercreate')
    }
  } catch (error) {
    console.log(error.message)
  }
}
const deleteCategoryOffer = async (req, res) => {
  try {
    const offerDoc = await Offer.findById(req.params.id);
    await Product.find({ category: offerDoc.category })
      .then((products) => {
        products.forEach((product) => {
          const newOffer = product.offerPercentage - offerDoc.percentage
          const newPrice = (100 - newOffer) * product.offerPrice / 100
          product.price = newPrice;
          product.offerPercentage = newOffer;
          product.save();
        });
      })
    await Offer.deleteOne({ _id: req.params.id });
    const offerData = await Offer.find();
    if (offerData.length > 0) {
      res.render("adminOfferList", { data: offerData, text: "" });
    } else {
      res.render("adminOfferList", { data: offerData, text: "All offers have been deleted" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProductOffer = async (req, res) => {
  try {
    const offerDoc = await Offer.findById(req.params.id);
    const offerValidProductId = offerDoc.product;
    const productData = await Product.findById({ _id: offerValidProductId });
    const newOffer = productData.offerPercentage - offerDoc.percentage
    const newPrice = (100 - newOffer) * productData.offerPrice / 100
    const previousProductPrice = productData.offerPrice
    await Product.findByIdAndUpdate({ _id: offerValidProductId }, { $set: { price: newPrice } });
    await Product.findByIdAndUpdate({ _id: offerValidProductId }, { $set: { offerPercentage: newOffer } });
    await Offer.deleteOne({ _id: req.params.id });
    const offerdata = await Offer.find();
    if (offerdata.length > 0) {
      res.render("adminOfferList", { data: offerdata, text: "" });
    } else {
      res.render("adminOfferList", { data: offerdata, text: "All offers have been deleted" });
    }
  } catch (error) {
    console.log(error.message);
  }
};









const handleexpiredoffers = async () => {
  console.log("hajaajajajajha");
  try {
    const now = new Date();
    const expiredOffers = await Offer.find({ expiryDate: { $lt: now }, status: "Active" }).populate("product");

    for (const offer of expiredOffers) {
      offer.status = "Expired";
      await offer.save();

      const product = await Product.findById(offer.product);
      product.price = product.offerPrice
      product.offerPercentage = 0;
      await product.save();
    }

    console.log("Expired offers handled:", expiredOffers.length);
  } catch (error) {
    console.error("Error handling expired offers:", error.message);
  }
};



app.get('/handleexpiredoffers', handleexpiredoffers);



module.exports = {
  offerLoad,
  productoffercreate,
  addproductoffer,
  categoryoffercreate,
  addcategoryoffer,
  handleexpiredoffers,
  deleteCategoryOffer,
  deleteProductOffer,

}