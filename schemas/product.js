'use strict';

var mongoose = require('mongoose');
var Category = require('./category');

var productSchema = {
    name: {type: String, required: true},
    pictures: [{type: String, match: /^http:\/\//i}],
    price: {
        amount: {type: Number, required: true},
        currency: {
            type: String,
            enum: ['USD', 'EUR', 'GBP'],
            required: true
        }
    },
    category: Category.categorySchema
};

var schema = new mongoose.Schema(productSchema);
var currencySymbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
};

// human readable string of price.
schema.virtual('displayPrice').get(function() {
    return currencySymbols[this.price.currency] + '' + this.price.amount;
});

schema.set('toObject', {virtuals: true});
schema.set('toJSON', {virtuals: true});

module.exports = schema;
module.exports.productSchema = productSchema;