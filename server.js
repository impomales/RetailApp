var express = require('express');

module.exports = function() {
    var app = express();
    
    app.get('/', function(req, res) {
        res.send('hello...it\'s me');
    });
    
    app.get('/user/:user', function(req, res) {
        res.send('Page for user ' + req.params.user + ' with option ' + req.query.option);
    });
    
    return app;
};