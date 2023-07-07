const mongoose = require('mongoose')
const Schema = mongoose.Schema
ObjectId = Schema.ObjectId;

const productSchema = new Schema({

    productName: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true,
    },
    images: {
        type: Array,
    },
    size: {
        type: String,
        required: true

    },
    stock: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true,
    },
    isDeleted: {
        type: Boolean,
    },
    isCategoryDeleted: {
        type: Boolean,
        default: false,
      },
      offerPrice:{
        type:Number
      },
      offerPercentage:{
        type:Number,
        default:0
      },
      isActiveOffer: {
        type: Boolean,
        default: false
      },

})
module.exports = mongoose.model('Product', productSchema)