const mongoose = require('mongoose')
const cartSchema = mongoose.Schema({
    userID: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    item: [{
        product: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number
    }
})
module.exports = mongoose.model('Cart', cartSchema)