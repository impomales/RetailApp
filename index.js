var mongoose = require('mongoose');
var productSchema = require('./schemas/product');
var categorySchema = require('./schemas/category');

var uri = 'mongodb://' + process.env.IP + ':27017/retail';
mongoose.connect(uri);

var Product = mongoose.model('Product', productSchema, 'products');
var Category = mongoose.model('Category', categorySchema, 'categories');

var category = new Category({
    _id: 'Electronics',
    parent: '',
    ancestors: []
});

category.save(function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});

var product = new Product({
    name: 'iphone',
    pictures: ['http://support.apple.com/content/dam/edam/applecare/images/en_US/iphone/featured-content-iphone-transfer-content-ios10_2x.png'],
    price: {
        amount: 999.99,
        currency: 'USD'
    },
    category: category
});

product.save(function(err) {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    Product.find({name: 'iphone'}, function(err, docs) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(require('util').inspect(docs));
        process.exit(0);
    });
});