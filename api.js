var express = require('express');
var status = require('http-status');

module.exports = function(wagner) {
    var api = express.Router();
    
    /*api.get('/product/id/:id', wagner.invoke(function(Product) {
        return function(req, res) {
            Product.findOne({ _id: req.params.id }, 
            handleOne.bind(null, 'product', res));
        }
    }));*/
    
    api.get('/category/id/:id', wagner.invoke(function(Category) {
        return function(req, res) {
            Category.findOne({ _id: req.params.id }, function(err, category) {
                if (err) {
                    return res.
                        status(status.INTERNAL_SERVER_ERROR).
                        json({ error: err.toString() });
                }
                if (!category) {
                    return res.
                        status(status.NOT_FOUND).
                        json({ error: 'Not found' });
                }
                res.json({category: category });
            });
        };
    }));
    
    api.get('/category/parent/:id', wagner.invoke(function(Category) {
        return function(req, res) {
            Category.
                find({ parent: req.params.id }).
                sort({ _id: 1 }).
                exec(function(err, categories) {
                    if (err) {
                        return res.
                            status(status.INTERNAL_SERVER_ERROR).
                            json({ error: err.toString() });
                    }
                    res.json({categories: categories});
                });
        };
    }));
    
    return api;
};

function handleOne(property, res, error, result) {
    if (error) {
        return res.
                status(status.INTERNAL_SERVER_ERROR).
                json({ error: error.toString() });
    }
    if (!result)  {
        return res.
                status(status.NOT_FOUND).
                json({ error: 'not found' });
    }
    
    var json = {};
    json[property] = result;
    res.json(json);
}