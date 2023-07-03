const Offer = require('../model/offerModel')
const Category = require('../model/categoryModel')
const Product = require('../model/poductModel')
const { products } = require('./admincontroller')
const moment = require('moment');
const express = require('express');

const cron = require('node-cron');
const app=express()


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
        const originalProductPrice = existingProduct.offerPrice;
        const newPrice = Math.round(
          originalProductPrice * ((100 - (existingProduct.offerPercentage + offerPercentage)) / 100)
        );
        console.log("new priceeeee", newPrice);
  
        const duration = req.body.duration;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + duration);
  
        await Product.findByIdAndUpdate({ _id: product }, { $set: { price: newPrice } });
        await Product.findByIdAndUpdate({ _id: product }, { $set: { offerPercentage: existingProduct.offerPercentage + offerPercentage } });
  
        const newOffer = new Offer({
          name: offerName,
          percentage: offerPercentage,
          product: product,
          duration: duration,
          expiryDate: expiryDate,
          status: 'Active',
        });
        await newOffer.save();
  
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


const handleexpiredoffers = async (req, res) => {
    try {
     
      const now = moment();
      const expiredOffers = await Offer.find({
        expirationDate: { $lt: now.toDate() } 
      });
  
      
      expiredOffers.forEach(async (offer) => {
        offer.status = 'expired';
        await offer.save();
      });
  
      console.log('Expired offers handled:', expiredOffers.length);
      res.send('Expired offers handled: ' + expiredOffers.length);
    } catch (error) {
      console.error('Error handling expired offers:', error.message);
      res.status(500).send('Error handling expired offers: ' + error.message);
    }
  };
  app.get('/handleexpiredoffers', handleexpiredoffers);
  
module.exports = {
    offerLoad,
    productoffercreate,
    addproductoffer,
    categoryoffercreate,
    addcategoryoffer,
    handleexpiredoffers

}