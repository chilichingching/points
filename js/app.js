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
    mdSwipeBack: false
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

function onLoad() {
  document.addEventListener("deviceready", onDeviceReady, false);
  if (app.device.cordova) {
    universalLinks.subscribe('deep-link-game', deepLinkGame);
    universalLinks.subscribe('deep-link-root', deepLinkRoot);
  } else {
    onDeviceReady();
  }
};

if (isIphone) {
  visualViewport.addEventListener('resize', (event) => {
    document.body.style.maxHeight = event.target.height + "px";
  });
}

var users = [];
var namePrompt;
var namePromptAnimationEnded = false;

function onDeviceReady() {

  handleOpenUrl(cordova.plugins && cordova.plugins['deeplinks']);

  app.sheet.create({
    el: '.more-options-modal',
    swipeToClose: true,
    push: true,
    backdrop: true
  });

  namePrompt = app.dialog.create({
    title: 'Name',
    content: '<div class="dialog-input-field input"><input type="text" class="dialog-input" value="" autocomplete="off"></div>',
    buttons: [{
      text: 'Cancel'
    }, {
      text: 'OK',
      close: true,
      onClick: function() {
        if (namePromptAnimationEnded) {
          addName($(namePrompt.el).find("input")[0].value);
        }
      }
    }],
    on: {
      open: function() {
        $(namePrompt.el).find(".dialog-button")[1].classList.add("disabled");
        namePromptAnimationEnded = false;
      },
      opened: function() {
        namePromptAnimationEnded = true;

        $(namePrompt.el).find("input")[0].addEventListener("keypress", function(event) {
          if (event.key === "Enter") {
            event.preventDefault();
            if (!$(namePrompt.el).find(".dialog-button")[1].classList.contains("disabled")) {
              $(namePrompt.el).find(".dialog-button")[1].click();
            }
          }
        });

        $(namePrompt.el).find("input")[0].addEventListener("input", function() {
          var name = validateName($(namePrompt.el).find("input")[0].value);
          if (name.length < 3 || users.includes(name)) {
            $(namePrompt.el).find(".dialog-button")[1].classList.add("disabled");
          } else {
            $(namePrompt.el).find(".dialog-button")[1].classList.remove("disabled");
          }
        });
      }
    }
  });

}

function handleOpenUrl(deeplinks) {
  if (deeplinks) {
    deeplinks.route({
      '/': function(match) {
        app.toast.create({
          text: 'Match1: ' + match,
          closeTimeout: 2000,
        }).open();
      },
      '/game': function(match) {
        app.toast.create({
          text: 'Match2: ' + match,
          closeTimeout: 2000,
        }).open();
      }
    });
  }
}

function deepLinkGame(eventData) {
  app.toast.create({
    text: 'Game Hash: ' + eventData.hash,
    closeTimeout: 2000,
  }).open();
}

function deepLinkRoot(eventData) {
  app.toast.create({
    text: 'Path: ' + eventData.path,
    closeTimeout: 2000,
  }).open();
}

$(".add-player-btn").on("click", function() {
  $(namePrompt.el).find("input")[0].value = "";
  namePrompt.open();
  $(namePrompt.el).find("input")[0].focus();
});

$(window).on("sortable:sort", function() {
  users = [];
  $(".players-list li div.item-inner div.item-title").each(function(obj, i) {
    users.push(obj.innerHTML);
  });
});

$(".start-game-btn").on("click", function() {
  initGame();
});

function validateName(str) {
  var splitStr = str.toLowerCase().trim().replace(/[^a-zA-Z0-9 ]+/g, "").split(' ');
  for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
  }
  return splitStr.join(' '); 
}

function addName(name) {
  name = validateName(name);

  if (!users.includes(name)) {
    var name_li = document.createElement("li");
    name_li.classList.add("swipeout");
    var name_div1 = document.createElement("div");
    name_div1.classList.add("item-content");
    name_div1.classList.add("swipeout-content");
    name_li.appendChild(name_div1);
    var name_div2 = document.createElement("div");
    name_div2.classList.add("item-inner");
    name_div1.appendChild(name_div2);
    var name_div3 = document.createElement("div");
    name_div3.classList.add("item-title");
    name_div3.innerHTML = name;
    name_div2.appendChild(name_div3);
    var name_div4 = document.createElement("div");
    name_div4.classList.add("item-after");
    name_div1.appendChild(name_div4);
    var name_div5 = document.createElement("div");
    name_div5.classList.add("sortable-handler");
    name_div4.appendChild(name_div5);
    var name_div6 = document.createElement("div");
    name_div6.classList.add("swipeout-actions-right");
    name_li.appendChild(name_div6);
    var name_a1 = document.createElement("a");
    name_a1.classList.add("swipeout-delete");
    name_a1.innerHTML = "Delete";
    name_div6.appendChild(name_a1);
  
    $(".players-list ul")[0].appendChild(name_li);

    users.push(name);

    checkUsersCount();
  }
}

$(window).on('swipeout:delete', function(e) {
  const deletedName = $(e.srcElement).find(".item-title")[0].innerHTML;

  users.splice(users.indexOf(deletedName), 1);

  checkUsersCount();
});

function checkUsersCount() {
  if (users.length > 2) {
    $(".start-game-btn")[0].classList.remove("disabled");
  } else {
    $(".start-game-btn")[0].classList.add("disabled");
  }
}

/** INIT GAME STUFF */

function initGame() {
  $(".add-player-btn")[0].style.display = "none";
  $(".start-game-btn")[0].style.display = "none";
  $(".start-game-btn")[0].style.disabled = true;
  $(".players-list-page-content")[0].style.display = "none";
  $(".players-list ul")[0].innerHTML = "";
  $(".game-page-content")[0].style.display = "block";
  $(".home-nav-btn-cont")[0].style.display = "block";
  $(".leaderboard-nav-btn-cont")[0].style.display = "block";
  $(".more-options-nav-btn-cont")[0].style.display = "none";
  $(".home-nav-title")[0].classList.remove("title-margin-left-8");
}

/** BACK TO HOME */

function goBackHome() {
  $(".add-player-btn")[0].style.display = "block";
  $(".start-game-btn")[0].style.display = "block";
  $(".players-list-page-content")[0].style.display = "block";
  $(".game-page-content")[0].style.display = "none";
  $(".home-nav-btn-cont")[0].style.display = "none";
  $(".leaderboard-nav-btn-cont")[0].style.display = "none";
  $(".more-options-nav-btn-cont")[0].style.display = "block";
  $(".home-nav-title")[0].classList.add("title-margin-left-8");
  users = [];
}

$(".home-nav-btn").click(function() {
  goBackHome();
});