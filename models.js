var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function(wagner) {
    mongoose.connect('mongodb://imp88:izzi1231@ds137220.mlab.com:37220/retail_app');
    
    wagner.factory('db', function() {
        return mongoose;
    });
    
    var Category = mongoose.model('Category', require('./schemas/category'), 'categories');
    var User = mongoose.model('User', require('./schemas/user'), 'users');
    
    
    var models = {
        Category: Category,
        User: User
    };
    
    _.each(models, function(value, key) {
        wagner.factory(key, function() {
            return value;
        });
    });
    
    wagner.factory('Product', require('./schemas/product'));
    
    return models;
};