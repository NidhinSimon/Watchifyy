const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  is_verified: {
    type: Number,
    default: 100,
  },
  isblocked: {
    type: Boolean,
    default: false,
  },

  token: {
    type: String,
    default: "",
  },
  address: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
      },
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      email: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
     
    },
  ],
  otp: {
    type: String,
  },
  cart: [
    {
      productId: { type: ObjectId },
      quantity: { type: Number, default: 1 },
      _id: false,
    },
  ],

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  referral:{
    type:String,
  },
  wallet: {
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model("User", userSchema);
