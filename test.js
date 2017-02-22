var assert = require('assert');
var mongoose = require('mongoose');
var express = require('express');
var categorySchema = require('./schemas/category');
var productSchema = require('./schemas/product');
var superagent = require('superagent');
var app = require('./server');
var wagner = require('wagner-core');
var url_root = 'http://' + process.env.IP + ':' + process.env.PORT + '/';

var models;

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

describe('API', function() {
    var server;
    var Category;
    var Product;
    
    before(function() {
        app = express();
        models = require('./models')(wagner);
        app.use(require('./api')(wagner));
        
        server = app.listen(process.env.PORT);
        Category = models.Category;
        Product = models.Product;
    });
    
    after(function() {
        server.close();
    });
    
    beforeEach(function(done) {
        var wait = true;
        Category.remove({}, function(err) {
            assert.ifError(err);
            if (!wait) done();
            wait = false;
        });
        Product.remove({},function(err) {
            assert.ifError(err);
            if (!wait) done();
            wait = false;
        });
    });
    
    it('can load a category by id', function(done) {
        // create one category
        Category.create({ _id: 'Electronics' }, function(err, doc) {
            assert.ifError(err);
            var url = url_root + 'category/id/Electronics';
            superagent.get(url, function(err, res)  {
                assert.ifError(err);
                var result;
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.ok(result.category);
                assert.equal(result.category._id, 'Electronics');
                done();
            }); 
        });
    });
    
    it('can load all categories that have a certain parent', function(done) {
        var categories = [
            { _id: 'Electronics' },
            { _id: 'Phones', parent: 'Electronics' },
            { _id: 'Laptops', parent: 'Electronics'},
            { _id: 'Pancakes' }
        ];
        
        Category.create(categories, function(err, categories) {
           assert.ifError(err);
           var url = url_root + 'category/parent/Electronics';
           superagent.get(url, function(err, res) {
               assert.ifError(err);
               var result;
               assert.doesNotThrow(function() {
                   result = JSON.parse(res.text);
               });
               assert.equal(result.categories.length, 2);
               assert.equal(result.categories[0]._id, 'Laptops');
               assert.equal(result.categories[1]._id, 'Phones');
               done();
           });
        });
    });
    
    it('can load a product by id', function(done) {
        var PRODUCT_ID = '000000000000000000000001';
        var product = {
            name: 'LG G4',
            _id: PRODUCT_ID,
            price: {
                amount: 300,
                currency: 'USD'
            }
        };
        
        Product.create(product, function(err, doc) {
            assert.ifError(err);
            var url = url_root + 'product/id/' + PRODUCT_ID;
            superagent.get(url, function(err, res) {
                assert.ifError(err);
                var result;
                assert.doesNotThrow(function() {
                    result = JSON.parse(res.text);
                });
                assert.ok(result.product);
                assert.equal(result.product._id, PRODUCT_ID);
                assert.equal(result.product.name, 'LG G4');
                done();
            });
        });
    });
    
    it('can load all products in a category with sub-categories', function(done) {
        var categories = [
            { _id: 'Electronics' },
            { _id: 'Phones', parent: 'Electronics' },
            { _id: 'Laptops', parent: 'Electronics'},
            { _id: 'Pancakes' }
        ];
        var products = [
            {
                name: 'LG G4',
                category: { _id: 'Phones', ancestors: ['Electronics', 'Phones'] },
                price: {
                    amount: 300,
                    currency: 'USD'
                }
            },
            {
                name: 'Asus Zenbook Prime',
                category: { _id: 'Laptops', ancestors: ['Electronics', 'Laptops'] },
                price: {
                    amount: 2000,
                    currency: 'USD'
                }
            },
            {
                name: 'Red Velvet Pancakes',
                category: { _id: 'Pancakes', ancestors: ['Pancakes'] },
                price: {
                    amount: 20,
                    currency: 'USD'
                }
            }
        ];
        Category.create(categories, function(err, categories) {
            assert.ifError(err);
            Product.create(products, function(err, products) {
                assert.ifError(err);
                var url = url_root + 'product/category/Electronics';
                superagent.get(url, function(err, res) {
                    assert.ifError(err);
                    var result;
                    assert.doesNotThrow(function() {
                        result = JSON.parse(res.text);
                    });
                    assert.equal(result.products.length, 2);
                    assert.equal(result.products[0].name, 'Asus Zenbook Prime');
                    assert.equal(result.products[1].name, 'LG G4');
                    
                    var url = url_root + 'product/category/Electronics?price=1';
                    superagent.get(url, function(err, res) {
                        assert.ifError(err);
                        var result;
                        assert.doesNotThrow(function() {
                            result = JSON.parse(res.text);
                        })
                        assert.equal(result.products.length, 2);
                        assert.equal(result.products[0].name, 'LG G4');
                        assert.equal(result.products[1].name, 'Asus Zenbook Prime');
                        done();
                    });
                });
            });
        });
    });
});

