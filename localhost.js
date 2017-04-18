var Promise = require('bluebird');
var request = require('request');

module.exports = {
    getPlans: function (destination) {
        return new Promise(function (resolve) {

        var plans = [{name: 'First', plan_period_name: '1 year', price: '10$', shopping_cart_url: 'http:google.com'}];

        // request('http://c7eb09d9.ngrok.io/api/v2/client/market.json?limit=' + destination, function (error, response, body) {
        //         console.log(body);
        //         let test = JSON.parse(body);
        //         console.log('============');
        //         console.log(test.all_plans);
        //         plans = test.all_plans;

        //     }

        // );
        resolve(plans);
        });
    },
};
