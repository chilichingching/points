var $ = Dom7;

var isIphone = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
var device = Framework7.getDevice();
var app = new Framework7({
  name: 'Points', // App name
  theme: 'md', // Automatic theme detection

  darkMode: true,
  el: '#app', // App root element

  // App store
  store: store,
  // App routes
  routes: [
    {
      path: '/',
      url: './index.html',
    },
    {
      path: '/about/',
      url: './pages/about.html',
      on: {
        pageBeforeIn: pageBeforeIn,
        pageAfterIn: pageAfterIn
      }
    },
    {
      path: '(.*)',
      url: './pages/404.html',
    },
  ],
  // Register service worker
  serviceWorker: {
    path: '/service-worker.js',
  },
  view: {
    mdSwipeBack: isIphone
  },


  // Input settings
  input: {
    scrollIntoViewOnFocus: device.cordova,
    scrollIntoViewCentered: device.cordova,
  },
  // Cordova Statusbar settings
  statusbar: {
    iosOverlaysWebView: true,
    androidOverlaysWebView: false,
  },
  on: {
    init: function () {
      var f7 = this;
      if (f7.device.cordova) {
        // Init cordova APIs (see cordova-app.js)
        cordovaApp.init(f7);
      }
    },
  },
});

/** BACK BUTTON STUFF */

var finishedLoopingHashes = false;
var backBtnPressed = false;
var backBtnPressedBeforePageLoaded = false;
var isPageLoading = false;
var backdropEl = $(".sheet-backdrop")[0];
var lastOpenedModal;
var moreOptionsModal = app.sheet.create({
  el: '.more-options-modal',
  swipeToClose: true,
  push: true,
  backdrop: true,
  on: {
    open: function() {
      pageBeforeIn();
    },
    opened: function() {
      pageAfterIn();
    }
  }
});

$(document).on('sheet:open', function(e) {
  lastOpenedModal = e.target;
});

$(backdropEl).on("click", function() {
  if (lastOpenedModal == moreOptionsModal.el) {
    if (moreOptionsModal.opened) {
      pageBeforeIn();
    } else {
      window.history.back();
    }
  }
});

function loopHash(x=1) {
  if (x != 3) {
    location.hash = "#" + x;
    setTimeout(function() {
      loopHash(x + 1);
    }, 10);
  } else {
    finishedLoopingHashes = true;
  }
}

if (!isIphone) {
  loopHash();

  let backBtnToast = app.toast.create({
    text: 'Press back again to exit',
    closeTimeout: 1500,
  });
  
  
  $(window).on('hashchange', function(e) {
    if (finishedLoopingHashes) {
      if (location.hash == "#1") {
        backBtnToast.open();
        setTimeout(function() {
          if (!backBtnPressedBeforePageLoaded) {
            location.hash = "#2";
          }
        }, 1500);
      } else if (location.hash == "#3") {
        if (e.oldURL.slice(-1) == "4" && !isPageLoading) {
          if (!backBtnPressed) {
            if (moreOptionsModal.opened) {
              moreOptionsModal.close();
            } else {
              app.views.main.router.back();
            }
          }
          window.history.back();
        } else {
          setTimeout(function() {
            location.hash = "#4";
          }, 50);
        }
      }
    }
  });
}

function backBtn() {
  if (!isIphone) {
    window.history.back();
    backBtnPressed = true;
    setTimeout(function() {
      backBtnPressed = false;
    }, 100);
  }
}

function pageBeforeIn(e, page) {
  pageBeforeIn();
}

function pageBeforeIn() {
  isPageLoading = true;
  if (!isIphone) {
    if (location.hash == "#1") {
      backBtnPressedBeforePageLoaded = true;
      location.hash = "#2";
      setTimeout(function() {
        location.hash = "#3";
      }, 10);
      setTimeout(function() {
        backBtnPressedBeforePageLoaded = false;
      }, 1550);
    } else { location.hash = "#3"; }
  }
}

function pageAfterIn(e, page) {
  pageAfterIn();
}

function pageAfterIn() {
  isPageLoading = false;
}