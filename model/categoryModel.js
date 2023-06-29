const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categorySchema = new Schema({
  category: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  Image: {
    type: String,
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },

});

module.exports = mongoose.model('category', categorySchema)