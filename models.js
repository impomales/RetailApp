var mongoose = require('mongoose');

module.exports = function(wagner) {
    mongoose.connect('mongodb://' + process.env.IP + ':27017/test');
    
    var Category = mongoose.model('Category', require('./schemas/category'), 'categories');
    
    wagner.factory('Category', function() {
        return Category;
    });
    
    return {
        Category: Category
    };
};