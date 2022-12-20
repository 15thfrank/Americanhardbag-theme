/**
 * Facebook script version: V_5
 * Google script version: V_11
 *
 * This piece of JS code is created by ROI Hunter Easy application
 * and it contains code that is necessary for correct functioning of Facebook pixel and conversion tracking
 * It is strongly recommended not to change the code
 */

/* <![CDATA[ */
// if Checkout data exists then the user is on the ThankYou page
if (typeof Shopify.checkout !== 'undefined') {

    // cookies package https://www.npmjs.com/package/cookies
    (function(d,f){"use strict";var h=function(d){if("object"!==typeof d.document)throw Error("Cookies.js requires a `window` with a `document` object");var b=function(a,e,c){return 1===arguments.length?b.get(a):b.set(a,e,c)};b._document=d.document;b._cacheKeyPrefix="cookey.";b._maxExpireDate=new Date("Fri, 31 Dec 9999 23:59:59 UTC");b.defaults={path:"/",secure:!1};b.get=function(a){b._cachedDocumentCookie!==b._document.cookie&&b._renewCache();a=b._cache[b._cacheKeyPrefix+a];return a===f?f:decodeURIComponent(a)};
        b.set=function(a,e,c){c=b._getExtendedOptions(c);c.expires=b._getExpiresDate(e===f?-1:c.expires);b._document.cookie=b._generateCookieString(a,e,c);return b};b.expire=function(a,e){return b.set(a,f,e)};b._getExtendedOptions=function(a){return{path:a&&a.path||b.defaults.path,domain:a&&a.domain||b.defaults.domain,expires:a&&a.expires||b.defaults.expires,secure:a&&a.secure!==f?a.secure:b.defaults.secure}};b._isValidDate=function(a){return"[object Date]"===Object.prototype.toString.call(a)&&!isNaN(a.getTime())};
        b._getExpiresDate=function(a,e){e=e||new Date;"number"===typeof a?a=Infinity===a?b._maxExpireDate:new Date(e.getTime()+1E3*a):"string"===typeof a&&(a=new Date(a));if(a&&!b._isValidDate(a))throw Error("`expires` parameter cannot be converted to a valid Date instance");return a};b._generateCookieString=function(a,b,c){a=a.replace(/[^#$&+\^`|]/g,encodeURIComponent);a=a.replace(/\(/g,"%28").replace(/\)/g,"%29");b=(b+"").replace(/[^!#$&-+\--:<-\[\]-~]/g,encodeURIComponent);c=c||{};a=a+"="+b+(c.path?";path="+
            c.path:"");a+=c.domain?";domain="+c.domain:"";a+=c.expires?";expires="+c.expires.toUTCString():"";return a+=c.secure?";secure":""};b._getCacheFromString=function(a){var e={};a=a?a.split("; "):[];for(var c=0;c<a.length;c++){var d=b._getKeyValuePairFromCookieString(a[c]);e[b._cacheKeyPrefix+d.key]===f&&(e[b._cacheKeyPrefix+d.key]=d.value)}return e};b._getKeyValuePairFromCookieString=function(a){var b=a.indexOf("="),b=0>b?a.length:b,c=a.substr(0,b),d;try{d=decodeURIComponent(c)}catch(k){console&&"function"===
        typeof console.error&&console.error('Could not decode cookie with key "'+c+'"',k)}return{key:d,value:a.substr(b+1)}};b._renewCache=function(){b._cache=b._getCacheFromString(b._document.cookie);b._cachedDocumentCookie=b._document.cookie};b._areEnabled=function(){var a="1"===b.set("cookies.js",1).get("cookies.js");b.expire("cookies.js");return a};b.enabled=b._areEnabled();return b},g=d&&"object"===typeof d.document?h(d):h;"function"===typeof define&&define.amd?define(function(){return g}):"object"===
    typeof exports?("object"===typeof module&&"object"===typeof module.exports&&(exports=module.exports=g),exports.Cookies=g):d.Cookies=g})("undefined"===typeof window?this:window);

    (function conversionTrackingROIHunterEasy() {
        var cookie_name = "roihuntereasy_shopify_order_ids_collection";
        function getCollection() {
            var collection = Cookies.get(cookie_name);
            if (typeof collection === 'undefined') {
                return null;
            }

            return JSON.parse(collection);
        }
        var roiHunterEasyCookiesCollection = {
            order_ids: getCollection(),
            append: function(element) {
                if (this.order_ids !== null) {
                    this.order_ids.push(element);
                }
            },
            save: function() {
                Cookies.set(cookie_name, JSON.stringify(this.order_ids), {expires: 24*60*60*30 }) /* 30 days */
            },
            make: function () {
                this.order_ids = []
            }
        };

        // initialize 'rheasy_fbq' global object which is pixel tracking function
        (function(window, document) {
            if (window.rheasy_fbq) return;
            window.rheasy_fbq = (function() {
                if (arguments.length === 0) {
                    return;
                }

                var pixelId, trackType, contentObj;     //get parameters:

                if (typeof arguments[0] === 'string') pixelId = arguments[0];       //param string PIXEL ID
                if (typeof arguments[1] === 'string') trackType = arguments[1];     //param string TRACK TYPE (PageView, Purchase)
                if (typeof arguments[2] === 'object') contentObj = arguments[2];    //param object (may be null):
                                                                                    //    {value : subtotal_price,
                                                                                    //     content_type : some_string,
                                                                                    //     currency : shop_curency,
                                                                                    //     contents : [{id, quantity, item_price}, ...] instance of array
                                                                                    //    }

                var argumentsAreValid = typeof pixelId === 'string' && pixelId.replace(/\s+/gi, '') !== '' &&
                    typeof trackType === 'string' && trackType.replace(/\s+/gi, '') !== '';

                if (!argumentsAreValid) {
                    console.error('RH PIXEL - INVALID ARGUMENTS');
                    return;
                }

                var params = [];
                params.push('id=' + encodeURIComponent(pixelId));
                switch (trackType) {
                    case 'PageView':
                    case 'ViewContent':
                    case 'Search':
                    case 'AddToCart':
                    case 'InitiateCheckout':
                    case 'AddPaymentInfo':
                    case 'Lead':
                    case 'CompleteRegistration':
                    case 'Purchase':
                    case 'AddToWishlist':
                        params.push('ev=' + encodeURIComponent(trackType));
                        break;
                    default:
                        console.error('RH PIXEL - BAD TRACKTYPE');
                        return;
                }

                params.push('dl=' + encodeURIComponent(document.location.href));
                if (document.referrer) params.push('rl=' + encodeURIComponent(document.referrer));
                params.push('if=false');
                params.push('ts=' + new Date().getTime());

                /* Custom parameters to string */
                if (typeof contentObj === 'object') {                                               //`contents : [{id, quantity, item_price}, ...]` to string
                    for (var u in contentObj) {
                        if (typeof contentObj[u] === 'object' && contentObj[u] instanceof Array) {  // `[{id, quantity, item_price}, ...]` to string
                            if (contentObj[u].length > 0) {
                                for (var y = 0; y < contentObj[u].length; y++) {
                                    if (typeof contentObj[u][y] === 'object') {                     // `{id, quantity, item_price}` to string
                                        contentObj[u][y] = JSON.stringify(contentObj[u][y]);
                                    }
                                    contentObj[u][y] = (contentObj[u][y] + '')  //JSON to string
                                        .replace(/^\s+|\s+$/gi, '')             //delete white characterts from begin on end of the string
                                        .replace(/\s+/gi, ' ')                  //replace white characters inside string to ' '
                                }
                                params.push('cd[' + u + ']=' + encodeURIComponent(contentObj[u].join(',')   //create JSON array - [param1,param2,param3]
                                    .replace(/^/gi, '[')
                                    .replace(/$/gi, ']')))
                            }
                        } else if (typeof contentObj[u] === 'string') {
                            params.push('cd[' + u + ']=' + encodeURIComponent(contentObj[u]));
                        }
                    }
                }

                var imgId = new Date().getTime();
                var img = document.createElement('img');
                img.id = 'fb_' + imgId, img.src = 'https://www.facebook.com/tr/?' + params.join('&'), img.width = 1, img.height = 1, img.style = 'display:none;';
                document.head.appendChild(img);
                window.setTimeout(function() { var t = document.getElementById('fb_' + imgId);
                    t.parentElement.removeChild(t); }, 1000);

            });
        })(window, document);
        // end of 'rheasy_fbq'


        // loadScript function we use for dynamically loading scripts to the customer page
        // https://stackoverflow.com/questions/7718935/load-scripts-asynchronously
        // begin: initialize our loadScript function
        var loadScript = function(src, callback)
        {
            var s,
                r,
                t;
            r = false;
            s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = src;
            s.onload = s.onreadystatechange = function() {
                if ( !r && (!this.readyState || this.readyState == 'complete') )
                {
                    r = true;
                    callback();
                }
            };
            t = document.getElementsByTagName('script')[0];
            t.parentNode.insertBefore(s, t);
        };
        // end of: initializing loadScript function

        function facebook_conversion_code() {
            rheasy_fbq('228159771091334', 'PageView');   //track PageView event

            var cart_items = [];
            Shopify.checkout.line_items.forEach(function(order_item) {  //collect all products from checkout for Purchase event
                cart_items.push({
                    id: 'shopify_' + order_item.product_id + '_' + order_item.variant_id,
                    quantity: order_item.quantity,
                    item_price: order_item.price
                });
            });

            var params = {
                value: Shopify.checkout.subtotal_price,
                content_type: 'product',
                currency: Shopify.checkout.currency,
                contents: cart_items
            };

            rheasy_fbq('228159771091334', 'Purchase', params);       //track Purchase event
        }

        function google_conversion_code() {
            var orderdetails = Shopify.checkout;

            // create array of purchased product ids
            var product_ids = [];
            var products = orderdetails["line_items"];
            for (var i = 0; i < products.length; i++) {
                product = products[i];
                product_ids.push('shopify_'+product.product_id+'_'+product.variant_id)
            }

            var googleRemarketingType = 'OTHER';
            var googleParams = {};
            if (googleRemarketingType === 'OTHER') {
                googleParams.dynx_itemid = product_ids;
                googleParams.dynx_pagetype = 'conversion';
                googleParams.dynx_totalvalue = orderdetails.subtotal_price;
            } else {
                googleParams.ecomm_prodid = product_ids;
                googleParams.ecomm_pagetype = 'purchase';
                googleParams.ecomm_totalvalue = orderdetails.subtotal_price;
            }

            // Google Code for Purchase Remarketing Tag
            var conversionId = '849050929';
            var conversionLabel = 'ZnY8CISZr34QsfrtlAM';
            var gtagJsId = 'AW-' + conversionId + '/' + conversionLabel;
            loadScript('https://www.googletagmanager.com/gtag/js?id=AW-' + conversionId, function () {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', gtagJsId);

                googleParams.send_to = gtagJsId;
                googleParams.value = orderdetails.subtotal_price;
                googleParams.currency = Shopify.checkout.currency;
                gtag('event', 'purchase', googleParams);
            });
        }

        if (roiHunterEasyCookiesCollection.order_ids === null) {    //first purchase on this shop - create cookies
            roiHunterEasyCookiesCollection.make();
        }

        var order_id = Shopify.checkout.order_id.toString();
        if (!roiHunterEasyCookiesCollection.order_ids.includes(order_id)) {     //check if order not in cookies yet (duplicity protection - F5, etc.)
            roiHunterEasyCookiesCollection.append(order_id);                    //add new purched item into cookies and run event to FB
            roiHunterEasyCookiesCollection.save();

            var facebookRemarketingActive = JSON.parse('true'); /* boolean true/false */
            var googleRemarketingActive = JSON.parse('true');     /* boolean true/false */

            if (facebookRemarketingActive) {
                facebook_conversion_code();
            }

            if (googleRemarketingActive) {
                google_conversion_code();
            }
        }
    })();
}
/* ]]> */
