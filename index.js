var express = require('express');
var wagner = require('wagner-core');

require('dotenv').load();

require('./models')(wagner);
require('./dependencies')(wagner);

var app = express();

app.get('/', function(req, res) {
    res.send('hello...');
});

wagner.invoke(require('./auth'), {app: app});
app.use('/api/v1', require('./api')(wagner));

app.use(express.static('./static', {maxAge: 4 * 60 * 60 * 1000 /* 2 hrs */}));

app.listen(process.env.PORT);
console.log("listening on port " + process.env.PORT);