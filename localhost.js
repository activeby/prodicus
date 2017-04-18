var request = require('request');

module.exports = {
    getPlans: function (destination) {
        return new Promise(function (resolve) {

        var plans = [{name: 'Cloud', plan_period_name: '1 year', price: '10$', shopping_cart_url: 'http://c7eb09d9.ngrok.io/'}, {name: 'Azure', plan_period_name: '2 year', price: '20$', shopping_cart_url: 'http://c7eb09d9.ngrok.io/'}];
        // var plans = [];

        // request('http://c7eb09d9.ngrok.io/api/v2/client/market.json?limit=' + destination, function (error, response, body) {
        //         let test = JSON.parse(body);
        //         // console.log(test);
        //         // console.log('=============');
        //         // console.log(test.all_plans);
        //         // console.log(test.all_plans instanceof(Array));
        //         plans = test.all_plans[0];
        //     }

        // );

        // console.log(plans);
        resolve(plans);
        });
    },
};
