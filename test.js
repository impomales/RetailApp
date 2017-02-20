var assert = require('assert');
var mongoose = require('mongoose');
var categorySchema = require('./schemas/category');
var productSchema = require('./schemas/product');
var userSchema = require('./schemas/user');
var superagent = require('superagent');
var app = require('./server');

/* will add more tests later */
// schema tests.
describe('Mongoose Schemas', function() {
    var Category = mongoose.model('Category', categorySchema, 'categories');
    var Product = mongoose.model('Product', productSchema, 'products');
    
    describe('Product', function() {
        var category = new Category({
            _id: 'Electronics',
            parent: '',
            ancestors: []
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
        it('has a "displayPrice" virtual', function() {
            assert.equal(product.displayPrice, '$999.99');
        });
    });
});

//server tests.
describe('server', function() {
    var server;
    
    beforeEach(function() {
        server = app().listen(process.env.PORT);
    });
    
    afterEach(function() {
        server.close();
    });
    
    it('prints out "hello...it\'s me" when user goes to /', function(done) {
        superagent.get('http://' + process.env.IP + ':' + process.env.PORT + '/', function(err, res) {
            assert.ifError(err);
            assert.equal(res.status.OK);
            assert.equal(res.text, "hello...it's me");
            done();
        });
    });
});