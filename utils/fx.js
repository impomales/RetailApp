var superagent = require('superagent');
var _ = require('underscore');

module.exports = function() {
    var url = 'http://openexchangerates.org/api/latest.json?app_id=' + process.env.OPEN_EXCHANGE_KEY;

    var rates = {
        USD: 1,
        EUR: 1.1,
        GBP: 1.5
    };
    
    var ping = function(callback) {
        superagent.get(url, function(err, res) {
            if (err) {
                if (callback) callback(err);
                return;
            }
        
            var results;
            try {
                results = JSON.parse(res.text);
                _.each(results.rates || {}, function(v, k) {
                    rates[k] = v;
                });
                if (callback) callback(null, rates);
            } catch (e) {
                if (callback) callback(e);
            }
        });
    };
    
    setInterval(ping, 60 * 60 * 1000); // repeat every hour.
    var ret = function() {
        return rates;
    };
    
    ret.ping = ping;
    return ret;
};