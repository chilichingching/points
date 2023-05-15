var $ = Dom7;

var device = Framework7.getDevice();
var app = new Framework7({
  name: 'Points', // App name
  theme: 'md', // Automatic theme detection

  darkMode: true,
  el: '#app', // App root element

  // App store
  store: store,
  // App routes
  routes: routes,
  // Register service worker
  serviceWorker: {
    path: '/service-worker.js',
  },
  view: {
    mdSwipeBack: true
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
      
      more_options_modal = f7.sheet.create({
        el: '.more-options-modal',
        swipeToClose: true,
        swipeToStep: true,
        push: true,
        backdrop: true
      });

      $("#app .page .navbar .title")[0].onclick = function() {
        this.style.color = 'red';
      };

      $("#app .page .navbar .title")[0].click();

    },
  },
});

var finishedLoopingHashes = false;

function loopHash(x) {
  if (x > 0) {
    location.hash = "#" + x;
    setTimeout(function() {
      loopHash(x - 1);
    }, 1);
  } else {
    finishedLoopingHashes = true;
  }
}

loopHash(10);

$(window).on('hashchange', function() {
  if (finishedLoopingHashes) {
    alert(location.hash);
  } else {
    console.log("change " + location.hash)
  }
});

// app.router.on("swipebackMove", function(data) {
  
// });