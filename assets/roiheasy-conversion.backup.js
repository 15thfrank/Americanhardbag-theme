/*  It is not possible to edit layout/theme.liquid on Checkout page.
  Thus we create a Script Tag which is called on Checkout page after the order is made.
  This code is turned into Asset and this Asset is called with Script Tag.
 */
// duplicate of loadScript code - loadScript is inside layout/theme.liquid is ignored
var loadScript = function(url, callback){
  var script = document.createElement("script");
  script.type = "text/javascript";

  // If the browser is Internet Explorer.
  if (script.readyState){
    script.onreadystatechange = function(){
      if (script.readyState == "loaded" || script.readyState == "complete"){
        script.onreadystatechange = null;
        callback();
      }
    };
  // For any other browser.
  } else {
    script.onload = function(){
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

// if Checkout data exists then the user is on the ThankYou page
/* <![CDATA[ */
if (typeof Shopify.checkout !== 'undefined') {
    var orderdetails = Shopify.checkout;
    var shopdomain = Shopify.shop;

    // create array of purchased product ids
    var product_ids = []
    var products = orderdetails["line_items"]
    for (var i = 0; i < products.length; i++) {
        product = products[i];
        product_ids.push('shopify_'+product.product_id+'_'+product.variant_id)
    }

    var google_conversion_id = 849050929;
    // Google Code for Purchase Remarketing Tag
    loadScript('https://www.googleadservices.com/pagead/conversion_async.js', function(){
      window.google_trackConversion({
        google_conversion_id: 849050929,
        google_custom_params: {
            ecomm_prodid: product_ids,
            ecomm_pagetype: 'purchase',
            ecomm_totalvalue: orderdetails.subtotal_price,
        },
        google_remarketing_only: true
      });

      window.google_trackConversion({
        google_conversion_id: 849050929,
        google_conversion_order_id: orderdetails.order_id,
        google_conversion_label : "ZnY8CISZr34QsfrtlAM",
        google_conversion_language : "en_US",
        google_conversion_format : "1",
        google_conversion_color : "666666",
        google_conversion_currency : "USD",
    	google_conversion_value : orderdetails.subtotal_price,
        google_remarketing_only: false
      })
    });
}
/* ]]> */
