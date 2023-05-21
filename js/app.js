var $ = Dom7;

var isIphone = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
var hashHistory = [];
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

/** HOME STUFF */

var namePrompt = app.dialog.create({
  title: 'Name',
  content: '<div class="dialog-input-field input"><input type="text" class="dialog-input" value=""></div>',
  buttons: [{
    text: 'Cancel',
    onClick: function() {
      if (!isIphone) { window.history.back(); }
    }
  }, {
    text: 'OK',
    onClick: function() {
      addName($(namePrompt.el).find("input")[0].value);
      if (!isIphone) { window.history.back(); }
    }
  }],
  on: {
    open: function() {
      pageBeforeIn();
    },
    opened: function() {
      pageAfterIn();
    }
  }
});

$(".add-player-btn").on("click", function() {
  $(namePrompt.el).find("input")[0].value = "";
  namePrompt.open();
  $(namePrompt.el).find("input")[0].focus();
});

function validateName(str) {
  var splitStr = str.toLowerCase().toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-").split(' ');
  for (var i = 0; i < splitStr.length; i++) {
      // You do not need to check if i is larger than splitStr length, as your for does that for you
      // Assign it back to the array
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  // Directly return the joined string
  return splitStr.join(' '); 
}

visualViewport.addEventListener('resize', (event) => {
  document.body.style.maxHeight = event.target.height + "px";
});

function addName(name) {
  name = validateName(name);

  var name_li = document.createElement("li");
  name_li.classList.add("swipeout");
  var name_div1 =  document.createElement("div");
  name_div1.classList.add("item-content");
  name_div1.classList.add("swipeout-content");
  name_li.appendChild(name_div1);
  var name_div2 =  document.createElement("div");
  name_div2.classList.add("item-inner");
  name_div1.appendChild(name_div2);
  var name_div3 =  document.createElement("div");
  name_div3.classList.add("item-title");
  name_div3.innerHTML = name;
  name_div2.appendChild(name_div3);
  var name_div4 =  document.createElement("div");
  name_div4.classList.add("item-after");
  name_div1.appendChild(name_div4);
  var name_div5 =  document.createElement("div");
  name_div5.classList.add("sortable-handler");
  name_div4.appendChild(name_div5);
  var name_div6 =  document.createElement("div");
  name_div6.classList.add("swipeout-actions-right");
  name_li.appendChild(name_div6);
  var name_a1 =  document.createElement("a");
  name_a1.classList.add("swipeout-delete");
  name_a1.innerHTML = "Delete";
  name_div6.appendChild(name_a1);

  $(".players-list ul")[0].appendChild(name_li);
}

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
      if (!isIphone) { window.history.back(); }
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
            } else if (namePrompt.opened) {
              namePrompt.close();
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

    if (e.newURL.slice(-1) == hashHistory.at(-2) && e.oldURL.slice(-1) == hashHistory.at(-1)) {
      hashHistory.pop();
    } else {
      hashHistory.push(e.newURL.slice(-1));
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

function pageBeforeIn(timeToWait=1550) {
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
      }, timeToWait);
    } else { location.hash = "#3"; }
  }
}

function pageAfterIn(e, page) {
  pageAfterIn();
}

function pageAfterIn() {
  isPageLoading = false;
}