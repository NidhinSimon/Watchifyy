const mongoose = require("mongoose");

const offerSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    percentage: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
      },
      expiryDate: {
        type: Date,
        required: true,
      },
      status: {
        type: String,
        default: "Active",
      },
});

module.exports = mongoose.model("Offer", offerSchema);