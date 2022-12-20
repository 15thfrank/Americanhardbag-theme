/**
 * Facebook script version: V_5
 * Google script version: V_11
 */

(function() {
    var facebookRemarketingActive = JSON.parse('true'); /* boolean true/false */
    var googleRemarketingActive = JSON.parse('true'); /* boolean true/false */

    // see initialization of this object in liquid/roi_hunter_easy_head_snippet.liquid
    var objectHash = 'ROIHunterEasy_5a83c915b9f3150f071dd42973557062ac2f30b295a5b6393544410da07ecb27';
    var ourAmazingGlobalObject = window[objectHash];
    if (typeof ourAmazingGlobalObject === 'undefined') {
        return;
    }

    if (facebookRemarketingActive) { // if customer has active facebook

        ourAmazingGlobalObject.rheasy_fbq('228159771091334', 'PageView');

        if (ourAmazingGlobalObject.cartPage.active) {
            ourAmazingGlobalObject.rheasy_fbq('228159771091334', 'AddToCart', ourAmazingGlobalObject.cartPage.facebookEventParams);
        } else if (ourAmazingGlobalObject.productPage.active) {
            ourAmazingGlobalObject.rheasy_fbq('228159771091334', 'ViewContent', ourAmazingGlobalObject.productPage.facebookEventParams);
        }
    }

    if (googleRemarketingActive) {
        var googleParams;
        // event names can be custom but google recommend use names from it's list
        // https://developers.google.com/analytics/devguides/collection/gtagjs/events#recommended-events
        var googleEventName;
        if (ourAmazingGlobalObject.cartPage.active) {
            googleParams = ourAmazingGlobalObject.cartPage.googleTagParams;
            googleEventName = 'add_to_cart';
        } else if (ourAmazingGlobalObject.productPage.active) {
            googleParams = ourAmazingGlobalObject.productPage.googleTagParams;
            googleEventName = 'view_item';
        } else if (ourAmazingGlobalObject.collectionPage.active) {
            googleParams = ourAmazingGlobalObject.collectionPage.googleTagParams;
            googleEventName = 'view_item_list';
        } else if (ourAmazingGlobalObject.mainPage.active) {
            googleParams = ourAmazingGlobalObject.mainPage.googleTagParams;
            googleEventName = 'homepage'; // we did not find a proper event from google's list and decided to use this name
        } else {
            return;
        }

        var conversionId = '849050929';
        googleParams.send_to = 'AW-' + conversionId;
        gtag('event', googleEventName, googleParams);
    }
})();