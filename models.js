var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner) {
    mongoose.connect('mongodb://' + process.env.IP + ':27017/test');
    
    var Category = mongoose.model('Category', require('./schemas/category'), 'categories');
    var Product = mongoose.model('Product', require('./schemas/product'), 'products');
    
    var models = {
        Category: Category,
        Product: Product
    }
    
    _.each(models, function(value, key) {
        wagner.factory(key, function() {
            return value;
        });   
    });
    
    return models;
};