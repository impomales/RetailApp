var express = require('express');
var wagner = require('wagner-core');

require('./models')(wagner);

var app = express();
require('dotenv').load();

app.get('/', function(req, res) {
    res.send('hello...');
});

wagner.invoke(require('./auth'), {app: app});
app.use('/api/v1', require('./api')(wagner));

app.listen(process.env.PORT);
console.log("listening on port " + process.env.PORT);