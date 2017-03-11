var express = require('express');
var status = require('http-status');
var bodyparser = require('body-parser');
var _ = require('underscore');

module.exports = function(wagner) {
    var api = express.Router();
    api.use(bodyparser.json());
    
    //checkout
    api.post('/checkout', wagner.invoke(function(User, Stripe) {
        return function(req, res) {
            if (!req.user) {
                return res.
                    status(status.UNAUTHORIZED).
                    json({error: 'Not logged in'});
            }
            
            // populate products in user's cart.
            req.user.populate({path: 'data.cart.product', model: 'Product'}, function(err, user) {
                if (err) throw new err('error in populating user cart');
                
                // sum total price in USD.
                var totalCostUSD = 0;
                _.each(user.data.cart, function(item) {
                    totalCostUSD += item.product.internal.approximatePriceUSD * item.quantity;
                });
                
                // create charge in Stripe corresponding to price.
                Stripe.charges.create(
                    {
                        // price in cents, mult by 100 and ceiling.
                        amount: Math.ceil(totalCostUSD * 100),
                        currency: 'usd',
                        source: req.body.stripeToken,
                        description: 'example charge'
                    },
                    function(err, charge) {
                        if (err && err.type ==='StripeCardError') {
                            return res.
                                status(status.BAD_REQUEST).
                                json({error: err.toString()});
                        }
                        if (err) {
                            console.log(err);
                            return res.
                                status(status.INTERNAL_SERVER_ERROR).
                                json({error: err.toString()});
                        }
                        
                        req.user.data.cart = [];
                        req.user.save(function() {
                            // ignore error of user cart. (not necessarily a failure)
                            return res.json({id: charge.id});
                        });
                    }
                );
            });
        };
    }));
    
    // modify currently logged in user cart.
    api.put('/me/cart', wagner.invoke(function(User) {
        return function(req, res) {
            try {
                var cart = req.body.data.cart;
            } catch(e) {
                return res.
                        status(status.BAD_REQUEST).
                        json({ error: 'no cart specified!' });
            }
            
            req.user.data.cart = cart;
            req.user.save(function(err, user) {
                if (err) {
                    return res.
                            status(status.INTERNAL_SERVER_ERROR).
                            json({ error: err.toString() });
                }
                return res.json({ user: user });
            });
        };
    }));
    
    // get currently logged in user.
    api.get('/me', function(req, res) {
        if (!req.user) {
            return res.
                    status(status.UNAUTHORIZED).
                    json({ error: 'Not logged in' });
        }
        // behaves like a superficial join
        // gets all products that are in user cart.
        req.user.populate(
            { path: 'data.cart.product', model: 'Product' },
            handleOne.bind(null, 'user', res));
    });
    
    // get product by id.
    api.get('/product/id/:id', wagner.invoke(function(Product) {
        return function(req, res) {
            Product.findOne({ _id: req.params.id }, 
            handleOne.bind(null, 'product', res));
        };
    }));
    
    // get products by category.
    api.get('/product/category/:id', wagner.invoke(function(Product) {
        return function(req, res) {
            var sort = { name: 1 };
            if (req.query.price === '1') sort = { 'internal.approximatePriceUSD': 1 };
            if (req.query.price === '-1') sort = { 'internal.approximatePriceUSD': -1 };
            
            Product.
                find({ 'category.ancestors': req.params.id }).
                sort(sort).
                exec(handleMany.bind(null, 'products', res));
        };
    }));
    
    // get category by id.
    api.get('/category/id/:id', wagner.invoke(function(Category) {
        return function(req, res) {
            Category.findOne({ _id: req.params.id }, 
            handleOne.bind(null, 'category', res));
        };
    }));
    
    // get categories by parent.
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
    
    api.get('/product/text/:query', wagner.invoke(function(Product) {
        return function(req, res) {
            Product.
                find(
                    {$text: {$search: req.params.query }},
                    {score: {$meta: 'textScore'}}
                ).
                sort({score: {$meta: 'textScore'}}).
                limit(10).
                exec(handleMany.bind(null, 'products', res));
        };
    }));
    
    return api;
};

// handles one result from request to server. 
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

// handles many results from request to server.
function handleMany(property, res, error, results) {
    if (error) {
        return res.
                status(status.INTERNAL_SERVER_ERROR).
                json({ error: error.toString() });
    }
    
    var json = {};
    json[property] = results;
    res.json(json);
}