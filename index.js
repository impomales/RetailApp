var express = require('express');
var wagner = require('wagner-core');

require('./models')(wagner);

var app = express();

app.use('/api/v1', require('./utils/api')(wagner));

app.listen(process.env.PORT);
console.log("listening on port " + process.env.PORT);