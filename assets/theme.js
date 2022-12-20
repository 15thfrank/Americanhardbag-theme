window.theme = window.theme || {};

theme.icons = {
  left: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
  right: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
  close: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/><path d="M0 0h24v24H0z" fill="none"/></svg>',
  chevronLeft: '<svg fill="#000000" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M14.298 18.187l1.061-1.061-5.127-5.126 5.127-5.126-1.061-1.061-6.187 6.187z"></path></svg>',
  chevronRight: '<svg fill="#000000" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M9.702 18.187l-1.061-1.061 5.127-5.126-5.127-5.126 1.061-1.061 6.187 6.187z"></path></svg>',
  chevronDown: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/><path d="M0-.75h24v24H0z" fill="none"/></svg>',
  tick: '<svg fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
};

theme.Sections = new function(){
  var _ = this;
  
  var sections = [];
  var instances = [];
  
  _.init = function(){
    $(document).on('shopify:section:load', function(e){
      // load a new section
      var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
      if(target) {
        _.sectionLoad(target);
      }
    }).on('shopify:section:unload', function(e){
      // unload existing section
      var target = _._themeSectionTargetFromShopifySectionTarget(e.target);
      if(target) {
        _.sectionUnload(target);
      }
    });
  }
  
  // register a type of section
  _.register = function(type, section){
    sections.push({ type: type, section: section });
    $('[data-section-type="'+type+'"]').each(function(){
      _.sectionLoad(this);
    });
  }
  
  // load in a section
  _.sectionLoad = function(target){
    var target = target;
    var section = _._sectionForTarget(target);
    if(section !== false) {
      instances.push({
        target: target,
        section: section
      });
      section.onSectionLoad(target);
      $(target).on('shopify:block:select', function(e){
        _._callWith(section, 'onBlockSelect', e.target);
      }).on('shopify:block:deselect', function(e){
        _._callWith(section, 'onBlockDeselect', e.target);
      });
    }
  }
  
  // unload a section
  _.sectionUnload = function(target){
    var instanceIndex = -1;
    for(var i=0; i<instances.length; i++) {
      if(instances[i].target == target) {
        instanceIndex = i;
      }
    }
    if(instanceIndex > -1) {
      $(target).off('shopify:block:select shopify:block:deselect');
      _._callWith(instances[instanceIndex].section, 'onSectionUnload', target);
      instances.splice(instanceIndex);
    }
  }
  
  // helpers
  _._callWith = function(object, method, param) {
    if(typeof object[method] === 'function') {
      object[method](param);
    }
  }
  
  _._themeSectionTargetFromShopifySectionTarget = function(target){
    var $target = $('[data-section-type]:first', target);
    if($target.length > 0) {
      return $target[0];
    } else {
      return false;
    }
  }
  
  _._sectionForTarget = function(target) {
    var type = $(target).attr('data-section-type');
    for(var i=0; i<sections.length; i++) {
      if(sections[i].type == type) {
        return sections[i].section;
      }
    }
    return false;
  }
}

// Loading third party scripts
theme.scriptsLoaded = [];
theme.loadScriptOnce = function(src, callback) {
  if(theme.scriptsLoaded.indexOf(src) < 0) {
    theme.scriptsLoaded.push(src);
    var tag = document.createElement('script');
    tag.src = src;
    
    if(typeof callback == 'function') {
      if (tag.readyState) { // IE, incl. IE9
        tag.onreadystatechange = function() {
          if (tag.readyState == "loaded" || tag.readyState == "complete") {
            tag.onreadystatechange = null;
            callback();
          }
        };
      } else {
        tag.onload = function() { // Other browsers
          callback();
        };
      }
    }
    
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    return true;
  } else {
    if(typeof callback == 'function') {
      callback();
    }
    return false;
  }
}

// Manage videos
theme.VideoManager = new function(){
  var _ = this;
  
  // Youtube
  _.youtubeVars = {
    incrementor: 0,
    apiReady: false,
    videoData: {},
    toProcessSelector: '.video-container[data-video-type="youtube"]:not(.video--init)'
  };
  
  _.youtubeApiReady = function() {
    _.youtubeVars.apiReady = true;
    _._loadYoutubeVideos();
  }
  
  _._loadYoutubeVideos = function(container) {
    if($(_.youtubeVars.toProcessSelector, container).length) {
      if(_.youtubeVars.apiReady) {
        // play those videos
        $(_.youtubeVars.toProcessSelector, container).addClass('video--init').each(function(){
          _.youtubeVars.incrementor++;
          var containerId = 'theme-yt-video-'+_.youtubeVars.incrementor;
          var videoElement = $('<div>').attr('id', containerId).appendTo(this);
          var player = new YT.Player(containerId, {
            height: '390',
            width: '640',
            videoId: $(this).data('video-id'),
            events: {
              onReady: _._onYoutubePlayerReady,
              onStateChange: _._onYoutubePlayerStateChange
            }
          });
          _.youtubeVars.videoData[player.h.id] = {
            id: containerId,
            container: this,
            videoElement: videoElement,
            player: player,
            autoPlay: !!$(this).data('video-autoplay')
          };
        });
      } else {
        // load api
        theme.loadScriptOnce('https://www.youtube.com/iframe_api');
      }
    }
  }
  
  _._onYoutubePlayerReady = function(event) {
    event.target.setPlaybackQuality('hd1080');
    var videoData = _._getYoutubeVideoData(event);
    if(videoData.autoPlay) {
      event.target.playVideo();
    }
  }
       
  _._onYoutubePlayerStateChange = function(event) {
  }
    
  _._getYoutubeVideoData = function(event) {
    return _.youtubeVars.videoData[event.target.h.id];
  }
  
  _._unloadYoutubeVideos = function(container) {
    for(var dataKey in _.youtubeVars.videoData) {
      var data = _.youtubeVars.videoData[dataKey];
      if($(container).find(data.container).length) {
        data.player.destroy();
        delete _.youtubeVars.videoData[dataKey];
        return;
      }
    }
  }
  
  // Vimeo
  _.vimeoVars = {
    incrementor: 0,
    apiReady: false,
    videoData: {},
    toProcessSelector: '.video-container[data-video-type="vimeo"]:not(.video--init)'
  };
  
  _.vimeoApiReady = function() {
    _.vimeoVars.apiReady = true;
    _._loadVimeoVideos();
  }
  
  _._loadVimeoVideos = function(container) {
    if($(_.vimeoVars.toProcessSelector, container).length) {
      if(_.vimeoVars.apiReady) {
        // play those videos
        $(_.vimeoVars.toProcessSelector, container).addClass('video--init').each(function(){
          _.vimeoVars.incrementor++;
          var $this = $(this);
          var containerId = 'theme-vi-video-'+_.vimeoVars.incrementor;
          var videoElement = $('<div>').attr('id', containerId).appendTo(this);
          var autoplay = !!$(this).data('video-autoplay');
          var player = new Vimeo.Player(containerId, {
            id: $(this).data('video-id'),
            width: 640,
            loop: false,
            autoplay: autoplay
          });
          player.ready().then(function(){
            if(player.element && player.element.width && player.element.height) {
              var ratio = parseInt(player.element.height) / parseInt(player.element.width);
              $this.css('padding-bottom', (ratio*100) + '%');
            }
          });
          _.vimeoVars.videoData[containerId] = {
            id: containerId,
            container: this,
            videoElement: videoElement,
            player: player,
            autoPlay: autoplay
          };
        });
      } else {
        // load api
        theme.loadScriptOnce('https://player.vimeo.com/api/player.js', function(){
          _.vimeoVars.apiReady = true;
          _._loadVimeoVideos();
        });
      }
    }
  }
  
  _._unloadVimeoVideos = function(container) {
    for(var dataKey in _.vimeoVars.videoData) {
      var data = _.vimeoVars.videoData[dataKey];
      if($(container).find(data.container).length) {
        data.player.unload();
        delete _.vimeoVars.videoData[dataKey];
        return;
      }
    }
  }
  
  // Compatibility with Sections
  this.onSectionLoad = function(container){
    _._loadYoutubeVideos(container);
    _._loadVimeoVideos(container);
  }
  
  this.onSectionUnload = function(container){
    _._unloadYoutubeVideos(container);
    _._unloadVimeoVideos(container);
  }
}

// Youtube API callback
function onYouTubeIframeAPIReady() {
  theme.VideoManager.youtubeApiReady();
}

theme.CustomRowSection = new function(){
  this.onSectionLoad = function(container){
    theme.VideoManager.onSectionLoad(container);
  }
  
  this.onSectionUnload = function(container){
    theme.VideoManager.onSectionUnload(container);
  }
}

theme.InstagramSection = new function(){
  this.onSectionLoad = function(target){
    $('.willstagram:not(.willstagram-placeholder)', target).each(function(){
      var user_id = $(this).data('user_id');
      var tag = $(this).data('tag');
      var access_token = $(this).data('access_token');
      var count = $(this).data('count') || 10;
      var $willstagram = $(this);
      var url = '';
      if(typeof user_id != 'undefined') {
        url = 'https://api.instagram.com/v1/users/' + user_id + '/media/recent?count='+count;
      } else if(typeof tag != 'undefined') {
        url = 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?count='+count;
      }
      $.ajax({
        type: "GET",
        dataType: "jsonp",
        cache: false,
        url: url
        + (typeof access_token == 'undefined'? '' : ('&access_token='+access_token)),
        success: function(res) {
          if(typeof res.data != 'undefined') {
            var $itemContainer = $('<ul class="items">').appendTo($willstagram);
            var limit = Math.min(20, res.data.length);
            for(var i = 0; i < limit; i++) {
              var photo_url = res.data[i].images.low_resolution.url.replace('http:', '');
              var link = res.data[i].link;
              var caption = res.data[i].caption != null ? res.data[i].caption.text : '';
              $itemContainer.append($('<li class="item"/>').append('<div><a target="_blank" href="'+link+'"><img src="'+photo_url+'" /></a><div class="desc">'+caption+'</div></div>'));
            }
          } else if(typeof res.meta !== 'undefined' && typeof res.meta.error_message !== 'undefined') {
            $willstagram.append('<div class="willstagram__error">'+res.meta.error_message+'</div>');
          }
      	}
      });
    });
  }
}

theme.SlideshowSection = new function(){
  this.onSectionLoad = function(target){
    $('.slideshow', target).each(function(){
      $(this).slick({
        autoplay: $(this).hasClass('auto-play'),
        fade: true,
        infinite: true,
        useTransform: true,
        prevArrow: '<button type="button" class="slick-prev">'+theme.icons.chevronLeft+'</button>',
        nextArrow: '<button type="button" class="slick-next">'+theme.icons.chevronRight+'</button>',
        responsive: [
          {
            breakpoint: 768,
            settings: {
              fade: false,
              arrows: false
            }
          }
        ],
        autoplaySpeed: 7000 // milliseconds to wait between slides
      });
    });
    
    theme.resizeScalingTextFromColumn();
    
    // Make slideshow page height
    $('.slideshow.type-full-page:not(.full-page-init)', target).addClass('full-page-init').each(function(){
      var $this = $(this);
      $(window).on('debouncedresize checkfullheightsliders', function(){
        $this.find('.slide').css('height', $(window).height() - $('.page-header').outerHeight());
      }).trigger('checkfullheightsliders');

      $this.find('img').willFillParent({ closest: '.slide', windowEvent: 'debouncedresize' });
    });
  }
  
  this.onSectionUnload = function(target){
    $('.slick-slider', target).slick('unslick');
  }
  
  this.onBlockSelect = function(target){
    $(target).closest('.slick-slider')
      .slick('slickGoTo', $(target).data('slick-index'))
      .slick('slickPause');
  }
  
  this.onBlockDeselect = function(target){
    $(target).closest('.slick-slider').slick('slickPlay');
  }
}

theme.HeaderSection = new function(){
  this.onSectionLoad = function(target){
    // Expand sidebar nav on page load, and limit expanded items to 1
    $('.mainnav .tier1 > ul > li.expanded:first > a').each(function(){
      var $tier1 = $(this).closest('.tier1');
      // only show if inside-mode
      if($('#navbar').hasClass('nav-style-in')) {
        $tier1.addClass('removetrans showback');
        $(this).click();
      }
      // only one expanded item allowed
      $(this).closest('li').siblings('.expanded').removeClass('expanded');
      setTimeout(function(){
        $tier1.removeClass('removetrans');
      }, 10);
    });
  }
}

theme.ProductTemplateSection = new function(){
  this.onSectionLoad = function(target){
    // gallery
    $('.product-gallery', target).trigger('initProductGallery');
    
    // product options
    theme.OptionManager.initProductOptions($('select[name="id"]'));
    
    // related products layout
    $(document).trigger('loadmasonry');
    
    theme.reloadCurrency();
  }
}

theme.CartTemplateSection = new function(){
  this.onSectionLoad = function(target){
    $('#checkout-note', target).toggleClass('hide-note', $('#note', target).val().length <= 0);
    $('#toggle-note', target).on('click', function(){
      $('#checkout-note', target).toggleClass('hide-note');
      return false;
    });
    
    theme.reloadCurrency();
  }
  
  this.onSectionUnload = function(target) {
    $('#toggle-note', target).off('click');
  }
}

theme.FeaturedCollectionSection = new function(){
  this.onSectionLoad = function(target){
    $(document).trigger('loadmasonry');
    
    theme.reloadCurrency();
  }
}

theme.FeaturedCollectionsSection = new function(){
  this.onSectionLoad = function(target){
    $(document).trigger('loadmasonry');
  }
}

theme.FeaturedBlogSection = new function(){
  this.onSectionLoad = function(target){
    $('.fix-img-ratio img').willFillParent({ closest: '.fix-img-ratio', windowEvent: 'debouncedresize' });
  }
}
    

theme.CollectionTemplateSection = new function(){
  this.onSectionLoad = function(target){
    // Sorting
    var $sortBy = $('#sort-by', target);
    if($sortBy.length > 0) {
      var queryParams = {};
      if (location.search.length) {
        for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
          aKeyValue = aCouples[i].split('=');
          if (aKeyValue.length > 1) {
            queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
          }
        }
      }
      $sortBy.val($sortBy.data('initval')).trigger('change').on('change', function() {
        queryParams.sort_by = $(this).val();
        location.search = $.param(queryParams);
      });
    }
    
    // Filter group URLs - dropdowns are for switching between tags
    var $filterConts = $('.filter--dropdown select', target);
    if($filterConts.length) {
      $filterConts.each(function(){
        var activeTag = $(this).find('option[selected]').data('custom');
        $(this).find('option').each(function(){
          var spl = $(this).val().split('/');
          var tags = spl[spl.length-1].split('+');
          var index = tags.indexOf(activeTag);
          if (index > -1) {
            tags.splice(index, 1);
          }
          spl.splice(spl.length-1, 1);
          var value = spl.join('/') + '/' + tags.join('+');
          $(this).attr('value', value);
        });
      });
    }

    // Masonry layout
    $(document).trigger('loadmasonry');
    
    
    // Infinite scroll (requires max one on page)
    if($('.pagination:not(.init-infiniscroll)', target).length == 1 && $('.blocklayout.do-infinite', target).length == 1) {
      var $pager = $('.pagination', target).addClass('init-infiniscroll');
      var $moreBtn = $('<a href="'+$pager.find('a.next').attr('href')+'" class="infiniscroll" />').html("More products");
      $pager.empty().append($moreBtn);

      // Click to show more
      $pager.on('click', 'a.infiniscroll:not(.loading)', function(){
        $moreBtn.addClass('loading').html("Loading...");
        $.get($pager.find('a').attr('href'), function(data){
          var $data = $($.parseHTML(data));
          var $newbies = $data.find('.blocklayout .block').appendTo('.blocklayout');
          $newbies.imagesLoaded(function(){
            // Add to masonry, & reveal
            $newbies.css('visibility', 'hidden');
            $('.blocklayout').masonry('appended', $newbies);
            theme.MasonryManager.remasonry();
            $newbies.staggerEvent(function($this){
              $this.css('visibility', 'visible').removeClass('initially-hidden');
            }, 100);

            // Any more?
            var $next = $data.find('.pagination a.next');
            if($next.length == 0) {
              //We are out of products
              $pager.html('<span class="infiniscroll no-more">'+"No more products"+'</span>').fadeOut(5000);
            } else {
              //More to show
              $moreBtn.attr('href', $next.attr('href')).removeClass('loading').html("More products");
            }
          });
          theme.reloadCurrency();
        });
        return false;
      });

      // Scroll event to trigger click
      $(window).on('scroll.infiniscroll', function(){
        var $pager = $('.pagination.init-infiniscroll');
        if($pager.length && $(window).scrollTop() + $(window).height() > $pager.offset().top) {
          $pager.find('a').trigger('click');
        }
      });
      
      theme.reloadCurrency();
    }
  }
  
  this.onSectionUnload = function(target){
    $('#sort-by', target).off('change');
    
    $(window).off('scroll.infiniscroll')
  }
}

theme.BlogTemplateSection = new function(){
  this.onSectionLoad = function(target){
    $(document).trigger('loadmasonry');
  }
}

// Manage option dropdowns
theme.OptionManager = new function(){
  var _ = this;

  _.selectors = {
    container: '.product-container',
    gallery: '.product-gallery',
    priceArea: '.pricearea',
    submitButton: 'input[type=submit], button[type=submit]',
    multiOption: '.option-selectors'
  };
  
  _.strings = {
    priceNonExistent: "Unavailable",
    priceSoldOut: '[PRICE]',
    buttonDefault: "Add to cart",
    buttonNoStock: "Out of stock",
    buttonNoVariant: "Unavailable"
  };
  
  _._getString = function(key, variant){
    var string = _.strings[key];
    if(variant) {
      string = string.replace('[PRICE]', '<span class="theme-money">'+Shopify.formatMoney(variant.price, theme.money_format)+'</span>');
    }
    return string;
  }
  
  _.getProductData = function($form) {
    return theme.productData[$form.data('product-id')];
  }
  
  _.addVariantUrlToHistory = function(variant) {
    if(variant) {
      var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
      window.history.replaceState({path: newurl}, '', newurl);
    }
  }
  
  _.updateSku = function(variant, $container){
    $container.find('.sku .sku__value').html( variant ? variant.sku : '' );
    $container.find('.sku').toggleClass('sku--no-sku', !variant || !variant.sku);
  }
  
  _.updateBarcode = function(variant, $container){
    $container.find('.barcode .barcode__value').html( variant ? variant.barcode : '' );
    $container.find('.barcode').toggleClass('barcode--no-barcode', !variant || !variant.barcode);
  }
  
  _.updateBackorder = function(variant, $container){
    var $backorder = $container.find('.backorder');
    if($backorder.length) {
      if (variant.available) {
        if (variant.inventory_management && variant.inventory_quantity <= 0) {
          var productData = _.getProductData($backorder.closest('form'));
          $backorder.find('.selected-variant').html(productData.title + (variant.title.indexOf('Default') >= 0 ? '' : ' - '+variant.title) );
          $backorder.show();
        } else {
          $backorder.hide();
        }
      } else {
        $backorder.hide();
      }
    }
  }
  
  _.updatePrice = function(variant, $container) {
    var $priceArea = $container.find(_.selectors.priceArea);
    $priceArea.removeClass('on-sale');
    
    if(variant && variant.available == true) {
      var $newPriceArea = $('<div>');
      if(variant.compare_at_price > variant.price) {
        $('<span class="was-price theme-money">').html(Shopify.formatMoney(variant.compare_at_price, theme.money_format)).appendTo($newPriceArea);
        $newPriceArea.append(' ');
        $priceArea.addClass('on-sale');
      }
      $('<span class="current-price theme-money">').html(Shopify.formatMoney(variant.price, theme.money_format)).appendTo($newPriceArea);
      $priceArea.html($newPriceArea.html());
    } else {
      if(variant) {
        $priceArea.html(_._getString('priceSoldOut', variant));
      } else {
        $priceArea.html(_._getString('priceNonExistent', variant));
      }
    }
  }
  
  _._updateButtonText = function($button, string, variant) {
    $button.each(function(){
      var newVal;
      newVal = _._getString('button' + string, variant);
      if(newVal !== false) {
        if($(this).is('input')) {
          $(this).val(newVal);
        } else {
          $(this).html(newVal);
        }
      }
    });
  }
  
  _.updateButtons = function(variant, $container) {
    var $button = $container.find(_.selectors.submitButton);
    
    if(variant && variant.available == true) {
      $button.removeAttr('disabled');
      _._updateButtonText($button, 'Default', variant);
    } else {
      $button.attr('disabled', 'disabled');
      if(variant) {
        _._updateButtonText($button, 'NoStock', variant);
      } else {
        _._updateButtonText($button, 'NoVariant', variant);
      }
    }
  }
  
  _.initProductOptions = function(originalSelect) {
    $(originalSelect).not('.theme-init').addClass('theme-init').each(function(){
      var $originalSelect = $(this);
      var productData = _.getProductData($originalSelect.closest('form'));
      
      // change state for original dropdown
      $originalSelect.on('change', function(e, variant){
        if($(this).is('input[type=radio]:not(:checked)')) {
          return; // handle radios - only update for checked
        }
        var variant = variant;
        if(!variant && variant !== false) {
          for(var i=0; i<productData.variants.length; i++) {
            if(productData.variants[i].id == $(this).val()) {
              variant = productData.variants[i];
            }
          }
        }
        var $container = $(this).closest(_.selectors.container);
        
        // update price
        _.updatePrice(variant, $container);
        
        // update buttons
        _.updateButtons(variant, $container);

        // variant images
        if (variant && variant.featured_image) {
          $container.find(_.selectors.gallery).trigger('variantImageSelected', variant);
        }

        // extra details
        _.updateBarcode(variant, $container);
        _.updateSku(variant, $container);
        _.updateBackorder(variant, $container);

        // variant urls
        var $form = $(this).closest('form');
        if($form.data('enable-history-state')) {
          _.addVariantUrlToHistory(variant);
        }

        // multi-currency
        if(typeof Currency != 'undefined' && typeof Currency.convertAll != 'undefined' && $('[name=currencies]').length) {
          theme.reloadCurrency();
          $('.selected-currency').text(Currency.currentCurrency);
        }
      });

      // split-options wrapper
      $originalSelect.closest(_.selectors.container).find(_.selectors.multiOption).on('change', 'select', function(){
        var selectedOptions = [];
        $(this).closest(_.selectors.multiOption).find('select').each(function(){
          selectedOptions.push($(this).val());
        });
        // find variant
        var variant = false;
        for(var i=0; i<productData.variants.length; i++) {
          var v = productData.variants[i];
          var matches = true;
          for(var j=0; j<selectedOptions.length; j++) {
            if(v.options.indexOf(selectedOptions[j]) < 0) {
              matches = false;
            }
          }
          if(matches) {
            variant = v;
            break;
          }
        }
        // trigger change
        if(variant) {
          $originalSelect.val(variant.id);
        }
        $originalSelect.trigger('change', variant);
      });
      
      // first-run
      $originalSelect.trigger('change');
    });
  }
};

/// Footer position
theme.repositionFooter = function(){
  var $preFooterContent = $('#content');
  var $footer = $('.page-footer');
  var offset = $(window).height() - ($preFooterContent.offset().top + $preFooterContent.outerHeight()) - $footer.outerHeight();
  $footer.css('margin-top', offset > 0 ? offset : '');
};

/// Text that scales based on column width
theme.resizeScalingTextFromColumn = function() {
  $('.scaled-text').each(function(){
    var $base = $(this).closest('.scaled-text-base');
    var scale = $base.width() / 1200;
    $(this).css('font-size', (scale * 100) + '%');
  });
}

//Function to show a quick generic text popup above an element
theme.showQuickPopup = function(message, $origin){
  var $popup = $('<div>').addClass('simple-popup hidden');
  var offs = $origin.offset();
  $('body').append($popup);
  $popup.html(message).css({ 'left':offs.left - ($popup.outerWidth() - $origin.outerWidth()), 'top':offs.top });
  $popup.css('margin-top', - $popup.outerHeight() - 10).removeClass('hidden');
  setTimeout(function(){
    $popup.addClass('hidden');
    setTimeout(function(){
      $popup.remove();
    }, 500);
  }, 4000);
}

// Reload multi-currency
theme.reloadCurrency = function() {
  
}

theme.MasonryManager = new function(){
  var _ = this;
  _.getInitialisedMasonry = function() {
    return $('.blocklayout').filter(function(){
      return !!$(this).data('masonry');
    });
  }
  _.remasonry = function(){
    _.getInitialisedMasonry().masonry({
      columnWidth: _.setBlockWidths()
    });
  }
  _.getUnInitialisedMasonry = function() {
    return $('.blocklayout').filter(function(){
      return !$(this).data('masonry');
    });
  }
  
  _.getBlockMargin = function($masonry) {
    var $firstBlock = $masonry.find('.block:first');
    return $firstBlock.length ? parseInt($firstBlock.css('margin-left')) : 20;
  }
  
  _.columnWidth = function($masonry) {
    var baseWidth = 150;
    if(typeof $masonry.data('block-width') !== 'undefined') {
      baseWidth = parseInt($masonry.data('block-width'));
    }
    var defWidth = baseWidth * ($masonry.hasClass('double-sized')?2:1) + _.getBlockMargin($masonry) * 2;
    var cols = Math.ceil(($masonry.width() - 200) / defWidth);
    
    //Min two per row on mobile (delete to go 1-a-row)
    var isProductGrid = $masonry.find('.block:not(.product)').length == 0;
    if(isProductGrid && $(window).width() < 768) {
      cols = Math.max(2, cols);
    }
    
    return Math.floor($masonry.width() / cols);
  }
  
  _.setBlockWidths = function() {
    var colWidth = 0;
    _.getInitialisedMasonry().each(function(){
      var $masonry = $(this);
      colWidth = _.columnWidth($masonry);
      var marginWidth = _.getBlockMargin($masonry) * 2;
      $masonry.children(':not(.size-large)').css('width', colWidth - marginWidth);
      if($(window).width() < colWidth*2 + marginWidth*2) {
        $masonry.children('.size-large').css('width', colWidth - marginWidth);
      } else {
        $masonry.children('.size-large').css('width', colWidth * 2 - marginWidth);
      }
    });
    return colWidth;
  }
}


$(function($){
  $(document).on('variantImageSelected', '.product-gallery', function(e, variant){
    var $swiperImgLinks = $('.swiper-container:first .swiper-slide a', this);
    var swiper = $('.swiper-container:first', this).data('swiper');
    if(swiper) {
      var toMatch = variant.featured_image.src.replace(/http[s]+:/, '').split('?')[0];
      var $match = $swiperImgLinks.filter(function(){
        return $(this).data('full-size-src').split('?')[0] == toMatch;
      }).first();

      if($match.length) {
        swiper.slideTo($match.parent().index());
      }
    }
  });
  
  //Staggered events on array of els
  $.fn.staggerEvent = function(ev, delay, initialDelay){
    var ev = ev, delay = delay, $els = $(this);
    if(typeof initialDelay === 'undefined') initialDelay = 0;
    setTimeout(function(){
      $els.each(function(i){
        var $this = $(this);
        setTimeout(function(){
          if(typeof ev === 'function') {
            ev($this);
          } else {
            $this.trigger(ev);
          }
        }, delay * i);
      });
    }, initialDelay);
    return $(this);
  };
  
  /// Fixed-pos header
  var $pageHeader = $('.page-header');
  $(window).on('load debouncedresize assessheaderheight', function(){
    var newPad = $pageHeader.css('position') == 'fixed' ? $pageHeader.outerHeight() : '';
    $('#content').css('padding-top', newPad);
  }).trigger('assessheaderheight');
  
  
  //First masonry load
  $(document).on('loadmasonry', function(){
    theme.MasonryManager.getUnInitialisedMasonry().each(function(){
      var $masonry = $(this);
      $masonry.imagesLoaded(function(){
        $masonry.masonry({
          isResizeBound: false,
          itemSelector : '.block',
          columnWidth: theme.MasonryManager.setBlockWidths,
          isLayoutInstant: true, //Built-in transforms are buggy, using CSS instead
          isAnimated: !Modernizr.csstransitions
        });

        $masonry.children('.block').staggerEvent(function($this){
          $this.removeClass('initially-hidden');
        }, 80);
        
        setTimeout(function(){
          theme.MasonryManager.remasonry();
          // pagination hidden until products loaded, on collections
          $('.hidden-pagination').removeClass('hidden');
          // layout has changed
          theme.repositionFooter();
        }, 10);
      });
    });
  }).trigger('loadmasonry');
  
  //Re-up the masonry after fonts are loaded, or on resize
  $(window).on('load debouncedresize', theme.MasonryManager.remasonry);
  
  
  if(Modernizr.input.placeholder){
    //Placeholder text will vanish upon focus
    $('input[placeholder]').each(function(){
      $(this).data('placeholder', $(this).attr('placeholder'));
    });
    $(document).on('focusin', 'input[placeholder]', function(){
      $(this).attr('placeholder', '');
    }).on('focusout', 'input[placeholder]', function(){
      if($(this).val() == '' && typeof($(this).data('placeholder')) != 'undefined') {
        $(this).attr('placeholder', $(this).data('placeholder'));
      }
    });
  } else {
    //Simulate placeholder with JS
    $(document).on('focusin', 'input[placeholder]', function(){
      $(this).val('');
    }).on('focusout', 'input[placeholder]', function(){
      if($(this).val() == '' && typeof($(this).attr('placeholder')) != 'undefined') {
        $(this).val($(this).attr('placeholder'));
      }
    });
    $('input[placeholder]').trigger('focusout');
    $('input[placeholder]').parents('form').submit(function() {
      $(this).find('input[placeholder]').each(function() {
        var $input = $(this);
        if ($input.val() == $input.attr('placeholder')) {
          $input.val('');
        }
      });
    });
  }
  
  /// Redirect dropdowns
  $(document).on('change', 'select.navdrop', function(){
    window.location = $(this).val();
  });
    
  /// General purpose lightbox
  $('a[rel="fancybox"]').fancybox({ titleShow: false });
  
  /// Main nav
  // Inside mode: Click top level item
  $(document).on('click', '.nav-style-in .mainnav .tier1 > ul > li > a, .show-nav-mobile .mainnav .tier1 > ul > li > a', function(e){
    if($(this).siblings('div').length) {
      e.preventDefault();
      $(this).parent().addClass('expanded');
      var $tier1 = $(this).closest('.tier1').addClass('inside-expanded-tier2');
      setTimeout(function(){
        $tier1.addClass('showback');
      }, 250);
    }
  });
  // Inside mode: Go back up
  $(document).on('click', '#navpanel .mainnav .back', function(e){
    e.preventDefault();
    var $tier1 = $(this).closest('.tier1').removeClass('showback');
    setTimeout(function(){
      $tier1.removeClass('inside-expanded-tier2');
      // after trans
      setTimeout(function(){
        $tier1.find('.expanded').removeClass('expanded');
      }, 260);
    }, 210);
  });
  
  
  // Flyout mode: Hover over nav
  var navHoverRemoveTimeoutId = -1;
  $(document).on('mouseenter mouseleave', 'body:not(.show-nav-mobile) .nav-style-out #navpanel .mainnav .tier1 > ul > li', function(e){
    if($(this).children('div').length) {
      e.preventDefault();
      var doShow = e.type == 'mouseenter';
      var w = $('#content').width();
      var $thisLi = $(this);
      clearTimeout(navHoverRemoveTimeoutId);
      if(doShow) {
        // clear existing visible items
        var $existing = $('.mainnav .outside-expanded').removeClass('outside-expanded');
        
        // prepare to show
        if(!$('body').hasClass('nav-outside-expanded-mode')) {
          $('body').addClass('nav-outside-expanded-mode');
          $('.bodywrap, .page-header').css('margin-right', $('#content').width() - w); // cater for scrollbar
        }
        $thisLi.find('.tier2').css('padding-top', $('#navpanel .shoplogo').outerHeight());
        
        // show (after reflow caused by css changes)
        $('body').addClass('nav-outside-expanded-show');
        $thisLi.addClass('outside-expanded');

      } else {
        // hide, after small delay
        navHoverRemoveTimeoutId = setTimeout(function(){
          $('body').removeClass('nav-outside-expanded-show');
          $thisLi.removeClass('outside-expanded');
          
          navHoverRemoveTimeoutId = setTimeout(function(){
            // remove hover mode & scrollbar margin
            $('body').removeClass('nav-outside-expanded-mode');
            $('.mainnav .tier2').css('padding-top', '');
            $('.bodywrap, .page-header').css('margin-right', '');
          }, 260); //post trans
        }, 500);
      }
    }
  });
  
  // Tier 3 expansion
  $(document).on('click', '.tier2 > ul > li > a', function(e){
    var $sib = $(this).siblings('ul');
    if($sib.length) {
      e.preventDefault();
      if($sib.is(':visible')) {
        $sib.slideUp(250);
        $(this).parent().removeClass('expanded');
      } else {
        $sib.slideDown(250);
        $(this).parent().addClass('expanded');
      }
    }
  });
  
  // Mobile nav visibility
  $(document).on('click', '.nav-toggle', function(e){
    e.preventDefault();
    $('body').toggleClass('show-nav-mobile');
  });
  $(document).on('click touchend', 'body.show-nav-mobile', function(e){
    if(e.target == this) {
      $(this).removeClass('show-nav-mobile');
      return false;
    }
  });
  
    
  
  //AJAX add to cart
  var shopifyAjaxAddURL = '/cart/add.js';
  var shopifyAjaxStorePageURL = '/search';
  $(document).on('submit', 'form[action="/cart/add"][data-ajax="true"]', function(e) {
    var $form = $(this);
    //Disable add button
    // Bold:POv2
    $form.find('button[type="submit"]:not(.bold_clone)').attr('disabled', 'disabled').html("Adding...");
    // Bold:POv2

    // Add to cart
    $.post(shopifyAjaxAddURL, $form.serialize(), function(data) {
      // Bold:POv2
      var data = JSON.parse(data);
      if(typeof window.BOLD !== 'undefined'
         && typeof window.BOLD.common !== 'undefined'
         && typeof window.BOLD.common.cartDoctor !== 'undefined') {
        // NOTE: "cart" should be the variable containing the cart json data
        data = window.BOLD.common.cartDoctor.fixItem(data);
      }              
      // Bold:POv2
      
      // Enable add button
      // Bold:POv2
      var $btn = $form.find('button[type="submit"]:not(.bold_clone)').removeAttr('disabled');
      // Bold:POv2
      
      // Show added message
      $btn.html(theme.icons.tick + ' ' + "Added to cart");
      
      // Back to default button text
      setTimeout(function(){
        $btn.html("Add to cart");
      }, 3000);

      // Added, show CTA
      if($btn.next('.added-cta').length == 0) {
        var $cta = $('<a class="added-cta" href="/cart">').hide().insertAfter($btn);
        $cta.append($('<span class="beside-img">').html("Go to cart"));
        $cta.append(' ').append(theme.icons.chevronRight);
        $cta.slideDown(500, function(){
          $(this).addClass('show');
          // resize lightbox, if in quick-buy
          if($btn.closest('#fancybox-content').length) {
            $.fancybox.resize();
          }
        });
      }

      // Update header
      $.get(shopifyAjaxStorePageURL, function(data){
        var $newCartObj = $(data).find('.page-header .cartsummary');
        var $currCart = $('.page-header .cartsummary');
        $currCart.html($newCartObj.html());

        
      });
    }, 'text').error(function(data) {
      // Enable add button
      $form.find('button[type="submit"]').removeAttr('disabled').html("Add to cart");

      // Not added, show message
      if(typeof(data) != 'undefined' && typeof(data.status) != 'undefined') {
        var jsonRes = $.parseJSON(data.responseText);
        theme.showQuickPopup(jsonRes.description, $form.find('button[type="submit"]:first'));
      } else {
        //Some unknown error? Disable ajax and add the old-fashioned way.
        $form.addClass('noAJAX');
        $form.submit();
      }
    });
    return false;
  });
  
     
  /// Quick buy popup
  $(document).on('click', '.block.product .quick-buy', function(){
    var productSelector = '.product:not(.insert)';
    var $prod = $(this).closest(productSelector);
    var prevIndex = $prod.index(productSelector) - 1;
    var nextIndex = $prod.index(productSelector) + 1;
    if(nextIndex > $prod.siblings(productSelector).length) {
      nextIndex = -1;
    }
    
    $.fancybox.showActivity();
    
    $.get($(this).attr('href'), function(data){
      var $template = $('<div class="quickbuy-form">').append(data);
      
      $template.imagesLoaded(function(){
        $.fancybox({
          padding: 0,
          showCloseButton: false,
          content: $($template.wrap('<div>').parent().html()).prepend(
            ['<div class="action-icons">',
             '<a href="#" class="prev-item action-icon" data-idx="',prevIndex,'">', theme.icons.left, '</a>',
             '<a href="#" class="next-item action-icon" data-idx="',nextIndex,'">', theme.icons.right, '</a>',
             '<a href="#" class="close-box action-icon">', theme.icons.close, '</a>',
             '</div>'].join('')
          ),
          onComplete: function(){
            theme.reloadCurrency();

            // init product form, if required
            theme.OptionManager.initProductOptions($('.quickbuy-form select[name=id]'));

            // gallery
            $('.quickbuy-form .product-gallery').trigger('initProductGallery').imagesLoaded($.fancybox.resize);
          }
        });
      });
    });
    
    return false;
  });
  $(document).on('click', '.quickbuy-form .close-box', function(){
    $.fancybox.close();
    return false;
  }).on('click', '.quickbuy-form .prev-item, .quickbuy-form .next-item', function(){
    $($('.block.product:not(.insert)').get($(this).data('idx'))).find('.quick-buy').click();
    return false;
  });
  
  // lightbox on click
  $(document).on('click', '.product-gallery .gallery-top a', function(e){
    e.preventDefault();
    if($(this).closest('.quickbuy-form').length == 0) {
      var $gall = $(this).closest('.product-gallery');
      if($('.gallery-top .swiper-slide', $gall).length > 1) {
        var imgs = Array();
        var srcToShow = $(this).attr('href');
        var indexToShow = 0;
        $('.gallery-top .swiper-slide a', $gall).each(function(index){
          imgs.push({
            href: $(this).attr('href'),
            title: $(this).attr('title')
          });
          if($(this).attr('href') == srcToShow) {
            indexToShow = index;
          }
        });
        $.fancybox(imgs, { index: indexToShow });
      } else {
        $.fancybox([{href: $(this).attr('href'), title:$(this).attr('title')}]);
      }
    }
  });
  
  
  $(window).on('load debouncedresize', theme.resizeScalingTextFromColumn);
  
  /// Terms requirement on cart
  $(document).on('click', '#cartform[data-require-terms="true"] #update-cart, #cartform[data-require-terms="true"] .additional-checkout-buttons a, #cartform[data-require-terms="true"] .additional-checkout-buttons input', function() {
    var $form = $(this).closest('form');
    if($form.has('#terms') && $form.find('#terms:checked').length == 0) {
      alert("You must agree to the terms and conditions before continuing.");
      return false;
    }
  });
  
  /// Assess footer position on ready/load/resize
  theme.repositionFooter();
  $(window).on('load debouncedresize', theme.repositionFooter);
  
  /// Product gallery
  $(document).on('initProductGallery', '.product-gallery', function(){
    $('.gallery-thumbs:not(.gallery-init)', this).each(function(){
      $(this).addClass('gallery-init');
      var $top = $(this).closest('.product-gallery').find('.gallery-top');
      // only if more than one
      if($top.find('.swiper-slide').length > 1) {
        var initial = 0;
        var $feat = $top.find('.swiper-slide[data-featured="true"]');
        if($feat.length) {
          initial = $feat.index();
        }
        var galleryTop = new Swiper($top, {
          nextButton: $top.find('.swiper-button-next'),
          prevButton: $top.find('.swiper-button-prev'),
          slidesPerView: 'auto',
          spaceBetween: 10,
          speed: 500,
          autoHeight: $(window).width() < 768, // if true, adjusts the height of the gallery to match the current image
          initialSlide: initial
        });
        $top.imagesLoaded(function(){
          galleryTop.slideTo(initial, 0);
        });
        // gallery control
        $(this).on('click', 'a', function(e){
          e.preventDefault();
          galleryTop.slideTo($(this).index());
        });
      }
    });
  });
  $('.product-gallery').trigger('initProductGallery');
     
  /// Tag filtering area
  $(document).on('click', '.filter-group .filter-toggle', function(e){
    e.preventDefault();
    var $group = $(this).closest('.filter-group');
    if($group.toggleClass('filter-group--show').hasClass('filter-group--show')) {
      $group.find('.filter-items').slideDown();
    } else {
      $group.find('.filter-items').slideUp();
    }
  });
  
  /// Custom share buttons
  $(document).on('click', '.sharing a', function(e){
    var $parent = $(this).parent();
    if($parent.hasClass('twitter')) {
      e.preventDefault();
      var url = $(this).attr('href');
      var width  = 575,
          height = 450,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          opts   = 'status=1, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0' +
          ',width='  + width  +
          ',height=' + height +
          ',top='    + top    +
          ',left='   + left;
      window.open(url, 'Twitter', opts);

    } else if($parent.hasClass('facebook')) {
      e.preventDefault();
      var url = $(this).attr('href');
      var width  = 626,
          height = 256,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          opts   = 'status=1, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0' +
          ',width='  + width  +
          ',height=' + height +
          ',top='    + top    +
          ',left='   + left;
      window.open(url, 'Facebook', opts);

    } else if($parent.hasClass('pinterest')) {
      e.preventDefault();
      var url = $(this).attr('href');
      var width  = 700,
          height = 550,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          opts   = 'status=1, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0' +
          ',width='  + width  +
          ',height=' + height +
          ',top='    + top    +
          ',left='   + left;
      window.open(url, 'Pinterest', opts);

    } else if($parent.hasClass('google')) {
      e.preventDefault();
      var url = $(this).attr('href');
      var width  = 550,
          height = 450,
          left   = ($(window).width()  - width)  / 2,
          top    = ($(window).height() - height) / 2,
          opts   = 'status=1, toolbar=0, location=0, menubar=0, directories=0, scrollbars=0' +
          ',width='  + width  +
          ',height=' + height +
          ',top='    + top    +
          ',left='   + left;
      window.open(url, 'Google+', opts);

    }
  });
  
  /// Register all sections
  theme.Sections.init();
  theme.Sections.register('header-section', theme.HeaderSection);
  theme.Sections.register('slideshow', theme.SlideshowSection);
  theme.Sections.register('instagram', theme.InstagramSection);
  theme.Sections.register('video', theme.VideoManager);
  theme.Sections.register('custom-row', theme.CustomRowSection);
  theme.Sections.register('featured-blog', theme.FeaturedBlogSection);
  theme.Sections.register('featured-collection', theme.FeaturedCollectionSection);
  theme.Sections.register('featured-collections', theme.FeaturedCollectionsSection);
  theme.Sections.register('collection-template', theme.CollectionTemplateSection);
  theme.Sections.register('blog-template', theme.BlogTemplateSection);
  theme.Sections.register('product-template', theme.ProductTemplateSection);
  theme.Sections.register('cart-template', theme.CartTemplateSection);
});
