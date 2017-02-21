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

describe('Category API', function() {
    var server;
    var Category;
    
    before(function() {
        app = express();
        models = require('./models')(wagner);
        app.use(require('./api')(wagner));
        
        server = app.listen(process.env.PORT);
        Category = models.Category;
    });
    
    after(function() {
        server.close();
    });
    
    beforeEach(function(done) {
        Category.remove({}, function(err) {
            assert.ifError(err);
            done();
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
});