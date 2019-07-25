var app = new Framework7({
  root: '#points',
  name: 'Points',
  id: 'chirag.awesomeness.points',
  routes: [
    {
      path: '/history/',
      url: 'pages/history.html'
    },
    {
      path: '/predictions/',
      url: 'pages/predictions.html'
    },
    {
      path: '/leaderboard/',
      url: 'pages/leaderboard.html'
    },
    {
      path: '/game_/',
      redirect: function (route, resolve, reject) {
        if (route.query.id) {
          game_(route.query.id);
          resolve("/game/");
        } else {
          reject();
        }
      }
    },
    {
      path: '/game/',
      url: 'pages/game.html'
    },
    {
      path: '/predictions_/',
      redirect: function (route, resolve, reject) {
        if (route.query.no) {
          predictions_ = ((route.query.no == "-1") ? (rounds.length) - 1 : parseInt(route.query.no));
          resolve("/predictions/");
        } else {
          reject();
        }
      }
    },
    {
      path: '/predictions/',
      url: 'pages/predictions.html'
    },
    {
      path: '/results_/',
      redirect: function (route, resolve, reject) {
        if (route.query.no) {
          results_ = ((route.query.no == "-1") ? (rounds.length) - 1 : parseInt(route.query.no));
          resolve("/results/");
        } else {
          reject();
        }
      }
    },
    {
      path: '/results/',
      url: 'pages/results.html'
    }
  ],
});
var mainView = app.views.create('.view-main');
var $$ = Dom7;
var fab = "add_player";
var game = "";
var names = [];
var rounds = [];
var gnids = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var leaderboard;
var predictions_;
var results_;
var predictions_temp;
var exit_toast = app.toast.create({text: "Press back again to exit", closeTimeout: 1200, closeButton: false});
window.onload = function(e){
  if (window.localStorage.getItem("theme-color") == null) {
    window.localStorage.setItem("theme-color", "deeppurple");
  }
  document.documentElement.classList.add("color-theme-" + window.localStorage.getItem("theme-color"));

  document.head.innerHTML += "<style>.full-table { max-height: "+(window.innerHeight-72)+"px } .half-table { max-height: "+(window.innerHeight-143)+"px }</style>";
}

function update_colour(c) {
  document.documentElement.classList.replace("color-theme-"+window.localStorage.getItem("theme-color"), "color-theme-"+c);
  window.localStorage.setItem("theme-color", c);
  app.popover.close(document.getElementsByClassName("popover-colours")[0], true);
}
function game_(id) {
    game = atob(id);
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
function show_toast(s) {
  app.toast.create({
    text: s,
    closeTimeout: 2000,
    closeButton: true,
  }).open();
}
function save() {
  if (JSON.parse(window.localStorage.getItem("savedGames")) == null) {
    var savedGames = {};
  } else {
    var savedGames = JSON.parse(window.localStorage.getItem("savedGames"));
  }
  savedGames[game] = {"names":names, "rounds":rounds};
  window.localStorage.setItem("savedGames", JSON.stringify(savedGames));
}
document.addEventListener("backbutton", function() {
  if (exit_toast.opened) {
    navigator.app.exitApp();
  } else {
    if (mainView['router']['url'].includes("index.html")) {
      exit_toast.open();
    } else {
      mainView['router'].back();
    }
  }
}, false)

function createTable(table, rounds_, ammendable=false, names_=names) {
  table.innerHTML = '<div class="table ' + ((ammendable) ? "half-table" : "full-table") + ' data-table card"></div>';
  table = table.getElementsByTagName("div")[0];

  if (rounds_[rounds_.length - 1][0][3] != null && ammendable && rounds_.length < 19) {
    rounds.push([])
    for (var i = 0; i < names_.length; i++) {
        rounds[rounds.length - 1].push([null, null, null, null]);
    }
    rounds_ = rounds
  }

  var headers = '<table class="table-headers"><thead><tr><th></th>';
  for (var i = 0; i < names_.length; i++) { headers += "<th>" + names_[i] + "</th>"; }
  if (ammendable) { headers += "<th editheader><i class='material-icons md-only'>edit</i></th>"; }
  headers += "</tr></thead></table>";

  var number_headers = 0;

  var body = '<table class="table-data"><tbody>';
  for (var i = 0; i < rounds_.length; i++ ) {
    if (rounds_[i][0][0] != null || ammendable) {
        body += "<tr><td emptyhash></td>";
        for (var j = 0; j < rounds_[i].length; j++) {
          body += '<td '+((i == 0) ? "firstrowdataentry" : "")+'><table class="data_entry"><tr><td>' + ((rounds_[i][j][0] == null) ? "" : rounds_[i][j][0].toString()) + '</td><td>' + ((rounds_[i][j][2] == null) ? "" : rounds_[i][j][2].toString()) + '</td><td>' + ((rounds_[i][j][3] == null) ? "" : rounds_[i][j][3].toString()) + '</td></tr></table></td>';
        }
        if (ammendable) { body += "<td "+((i == 0) ? "firstroweditentry" : "")+" class='edit_btns'><div style='width:79px'><button "+((rounds_[i][0][0] != null) ? "" : "style='display:none;'")+" class='button button-raised button-round' onclick='edit_predictions(this.parentElement.parentElement.parentElement);'>P</button><button "+((rounds_[i][0][3] != null) ? "" : "style='display:none;'")+" class='button button-raised button-round' onclick='edit_results(this.parentElement.parentElement.parentElement);'>R</button></div></td>"; }
        body += "</tr>";
    } else {
        number_headers = 1;
    }
  }

  var numbers = '<table class="table-numbers"><tbody>';
  for (var i = 0; i < rounds_.length - number_headers; i++) { numbers += "<tr><td>" + gnids[i].toString() + "</td></tr>"; }
  numbers += "</tbody></table>";
  body += "</tbody></table>";
  table.innerHTML += "<table class='table-hashtag'><thead><tr><th>#</th></tr></thead></table>" + headers + numbers + body;

  if (ammendable) {
    if (rounds_[rounds_.length - 1][0][0] == null) { change_fab("predictions"); }
    else { change_fab("results"); }
    document.getElementsByClassName("player_info")[0].getElementsByTagName("div")[1].innerHTML = names[(rounds.length - 1) % names.length];
  }
}

function change_fab(a) {
    if (a == "predictions") {
        document.getElementById("fab").getElementsByTagName("a")[0].innerHTML = '<div class="fab-text">Input Predictions</div>';
        document.getElementById("fab").getElementsByTagName("a")[0].href = '/predictions_/?no=-1';
        fab = "input_predictions";
    } else if (a == "results") {
        document.getElementById("fab").getElementsByTagName("a")[0].innerHTML = '<div class="fab-text">Input Results</div>';
        document.getElementById("fab").getElementsByTagName("a")[0].href = '/results_/?no=-1';
        fab = "input_results";
    } else if (a == "add_player") {
        document.getElementById("fab").style.display = "block";
        document.getElementById("fab").getElementsByTagName("a")[0].innerHTML = '<i class="icon material-icons md-only" style="margin-left:4px;">add</i><div class="fab-text">Add Player</div>';
        document.getElementById("fab").getElementsByTagName("a")[0].href = '#';
        fab = "add_player";
    }
}

function home_onclick() {
  document.getElementById("player_cont").style.display = "block";
  document.getElementById("table_cont").style.display = "none";
  document.getElementById("table_cont").innerHTML = "";

  document.getElementsByClassName("player_info")[0].style.display = 'none';

  document.getElementById("palette_btn").style.display = 'block';
  document.getElementById("history_btn").style.display = 'block';
  document.getElementById("load_game_btn").style.display = 'block';
  document.getElementById("players_next_btn").style.display = 'block';
  document.getElementById("home_btn").style.display = 'none';
  document.getElementById("main_leadboard_btn").style.display = 'none';

  document.getElementById("fab").classList.add("fab-center-bottom");
  document.getElementById("fab").classList.remove("fab-right-bottom");
  change_fab("add_player");

  document.querySelectorAll('[data-name=home]')[0].getElementsByClassName("title")[0].style.marginLeft = "16px";
}

function initGame() {
  document.getElementById("player_cont").style.display = "none";
  document.getElementById("table_cont").style.display = "block";
  document.getElementById("player_list").innerHTML = "";

  document.getElementsByClassName("player_info")[0].style.display = 'block';

  document.getElementById("palette_btn").style.display = 'none';
  document.getElementById("history_btn").style.display = 'none';
  document.getElementById("load_game_btn").style.display = 'none';
  document.getElementById("players_next_btn").style.display = 'none';
  document.getElementById("home_btn").style.display = 'block';
  document.getElementById("main_leadboard_btn").style.display = 'block';

  document.getElementById("fab").classList.add("fab-right-bottom");
  document.getElementById("fab").classList.remove("fab-center-bottom");

  document.querySelectorAll('[data-name=home]')[0].getElementsByClassName("title")[0].style.marginLeft = "0px";

  leaderboard = document.getElementById("table_cont");

  createTable(document.getElementById("table_cont"), rounds, true);

  save();
}

function fab_onclick() {
  if (fab == "add_player") { add_player(); }
  //else if (fab == "input_predictions") { input_predictions(); }
}

function add_player() {
  var add_player_dialog = app.dialog.prompt('', 'Name', function (name) {
    var cur_names = [];
    for (i = 0; i < document.getElementById("player_list").getElementsByTagName("li").length; i++) {
      cur_names.push(document.getElementById("player_list").getElementsByTagName("li")[i].getElementsByClassName("item-title")[0].innerHTML);
    }
    if (name != "" && cur_names.indexOf(toTitleCase(name)) == -1) {
      document.getElementById("player_list").innerHTML += '<li><div class="item-content"><div class="item-media"><div onclick="this.parentElement.parentElement.parentElement.outerHTML='+"''"+';" style="background-color: var(--f7-theme-color);" class="chip-media sortableListNumber"><i class="icon material-icons md-only" style="color:white;font-size:20px;margin-top:4px;">close</i></div></div><div class="item-inner"><div class="item-title">'+toTitleCase(name)+'</div><div class="item-after"></div></div></div><div class="sortable-handler"></div></li>';
    } else if (cur_names.indexOf(toTitleCase(name)) > -1) {
      show_toast('Player has already been added');
    }
  });
  add_player_dialog.el.getElementsByClassName("dialog-buttons")[0].getElementsByTagName("span")[1].innerHTML = "Add";
  add_player_dialog.el.getElementsByTagName("input")[0].focus();
}

function load_game_btn_onclick() {
    var savedGames = JSON.parse(window.localStorage.getItem("savedGames"));
    if (savedGames) {
        if (Object.keys(JSON.parse(window.localStorage.getItem("savedGames"))).length > 0) {
            game = Object.keys(savedGames)[Object.keys(savedGames).length - 1];
            if (savedGames[game]['rounds'].length == 19 && savedGames[game]['rounds'][savedGames[game]['rounds'].length - 1][0][1] != null) {
              show_toast("No game to load");
            } else {
              names = savedGames[game]['names'];
              rounds = savedGames[game]['rounds'];
              initGame();
            }
        } else {
            show_toast("No game to load");
        }
    } else {
        show_toast("No game to load");
    }
}

function players_next_btn_onclick() {
  if (document.getElementById("player_list").getElementsByTagName("li").length < 3) {
      show_toast("Add Players");
  } else {
    var now = new Date();
    var date = now.getDate() + " " + ["Jan", "Feb", "Mar","Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct","Nov", "Dec"][now.getMonth()] + " " + now.getFullYear() + " " + ((now.getHours() < 10) ? "0" : "") + now.getHours() + ":" + ((now.getMinutes() < 10) ? "0" : "") + now.getMinutes();
    app.dialog.prompt('', 'Game Name', function (name) {
      var savedGames = JSON.parse(window.localStorage.getItem("savedGames"));
      if (savedGames == null) {
        var savedGames = {};
      }
      if (name != "" && Object.keys(savedGames).indexOf(name) == -1) {
        names = [];
        game = name;
        for (var i = 0; i < document.getElementById("player_list").getElementsByTagName("li").length; i++) {
          names.push(document.getElementById("player_list").getElementsByTagName("li")[i].getElementsByClassName("item-title")[0].innerHTML);
        }

        rounds = [[]];
        for (var i = 0; i < names.length; i++) {
          rounds[0].push([null, null, null, null]);
        }

        initGame(rounds);
      } else if (name != "") {
        show_toast("Game name already in use");
      }
    }, function() {}, date);
  }
}

$$(document).on('page:init', '.page[data-name="history"]', function (e) {
  if (window.localStorage.getItem("savedGames") != null) {
    var history = "";
    var savedGames = JSON.parse(window.localStorage.getItem("savedGames"));
    var del_items = [];
    for (var i = Object.keys(savedGames).length - 1; i > -1; i--) {
      if (savedGames[Object.keys(savedGames)[i]]['rounds'][0][0][0] != null) {
        history += '<li><a href="/game_/?id='+btoa(Object.keys(savedGames)[i])+'" class="item-title">'+Object.keys(savedGames)[i]+'</a></li>';
      } else if (i != Object.keys(savedGames).length - 1) {
        del_items.push(Object.keys(savedGames)[i]);
      }
    }
    for (var i = 0; i < del_items.length; i++) {
      delete savedGames[del_items[i]];
    }
    window.localStorage.setItem("savedGames", JSON.stringify(savedGames));
    document.getElementsByClassName("history-page")[0].getElementsByTagName("ul")[0].innerHTML = history;
    app.searchbar.create({
      el: '.searchbar',
      searchContainer: '.list-history',
      searchIn: '.item-title',
      on: {
        search(sb, query, previousQuery) {}
      }
    });
    if (history.includes("<li>") == false) {
        mainView['router'].currentPageEl.getElementsByClassName("list")[0].style.display = "none";
    }
  } else {
    mainView['router'].currentPageEl.getElementsByClassName("list")[0].style.display = "none";
  }
});

$$(document).on('page:init', '.page[data-name="leaderboard"]', function (e) {
  var names_ = [];
  var ammendable = false;
  for (var i = 1; i < leaderboard.children[0].children[1].getElementsByTagName("th").length; i++) {
    if (leaderboard.children[0].children[1].getElementsByTagName("th")[i].innerHTML.includes("material-icons md-only") == false) {
      names_.push(leaderboard.children[0].children[1].getElementsByTagName("th")[i].innerHTML);
    } else { ammendable = true; }
  }
  var lb = [];
  if (leaderboard.children[0].children[3].children[0].children[0].children[1].getElementsByTagName("td")[2].innerHTML == "") {
    for (var i = 0; i < names_.length; i++) { lb.push([names_[i], 0]); }
  } else {
    var lbrow = leaderboard.children[0].children[3].children[0].children[leaderboard.children[0].children[3].children[0].children.length - 1];
    var lbdata = [];
    var scores = [];
    if (leaderboard.children[0].children[3].children[0].children[leaderboard.children[0].children[3].children[0].children.length - 1].children[1].getElementsByTagName("td")[2].innerHTML == "") {
      lbrow = leaderboard.children[0].children[3].children[0].children[leaderboard.children[0].children[3].children[0].children.length - 2];
    }
    for (var i = 1; i < names_.length + 1; i++) {
      lbdata.push([names_[i - 1], parseInt(lbrow.children[i].getElementsByTagName("td")[2].innerHTML)]);
      scores.push(parseInt(lbrow.children[i].getElementsByTagName("td")[2].innerHTML));
    }
    scores = scores.sort((a,b) => b - a);
    lb = lbdata.map(function(item) {
        var n = scores.indexOf(item[1]);
        scores[n] = '';
        return [n, item]
    }).sort().map(function(j) { return j[1] });
  }
  var ul = "";
  for (var i = 0; i < lb.length; i++) {
    ul += '<li><div class="item-content"><div class="item-media"><font style="width:100%;text-align:center;">'+(i+1).toString()+'</font></div><div class="item-inner"><div class="item-title">'+lb[i][0]+'</div><div class="item-after">'+lb[i][1]+'</div></div></div></li>';
  }
  mainView['router'].currentPageEl.getElementsByTagName("ul")[0].innerHTML = ul;
});

$$(document).on('page:init', '.page[data-name="game"]', function (e) {
  var saved_game = JSON.parse(window.localStorage.getItem("savedGames"))[game];
  leaderboard = mainView['router'].currentPageEl.getElementsByClassName("page-content")[0].getElementsByTagName("div")[0];
  createTable(mainView['router'].currentPageEl.getElementsByClassName("page-content")[0].getElementsByTagName("div")[0], saved_game['rounds'], false, saved_game['names']);
  document.getElementById("delete_game_btn").onclick = function() {
      app.dialog.confirm("Are you sure you want to delete this game?", "Delete Game", function() {
          var savedGames = JSON.parse(window.localStorage.getItem("savedGames"));
          delete savedGames[game];
          window.localStorage.setItem("savedGames", JSON.stringify(savedGames));
          show_toast("Deleted Game <b>"+game+"</b>");

          if (window.localStorage.getItem("savedGames") != null) {
            var history = "";
            var savedGames = JSON.parse(window.localStorage.getItem("savedGames"));
            var del_items = [];
            for (var i = Object.keys(savedGames).length - 1; i > -1; i--) {
              if (savedGames[Object.keys(savedGames)[i]]['rounds'][0][0][0] != null) {
                history += '<li><a href="/game_/?id='+btoa(Object.keys(savedGames)[i])+'" class="item-title">'+Object.keys(savedGames)[i]+'</a></li>';
              } else if (i != Object.keys(savedGames).length - 1) {
                del_items.push(Object.keys(savedGames)[i]);
              }
            }
            for (var i = 0; i < del_items.length; i++) {
              delete savedGames[del_items[i]];
            }
            window.localStorage.setItem("savedGames", JSON.stringify(savedGames));
            document.getElementsByClassName("history-page")[0].getElementsByTagName("ul")[0].innerHTML = history;
            app.searchbar.create({
              el: '.searchbar',
              searchContainer: '.list-history',
              searchIn: '.item-title',
              on: {
                search(sb, query, previousQuery) {}
              }
            });
            if (history.includes("<li>") == false) {
                document.getElementsByClassName("history-page")[0].getElementsByClassName("list")[0].style.display = "none";
            }
          } else {
            document.getElementsByClassName("history-page")[0].getElementsByClassName("list")[0].style.display = "none";
          }
          mainView['router'].back();
      }, function() {})
  };
  document.getElementById("rename_game_btn").onclick = function() {
    app.dialog.prompt('', 'Game Name', function (game__) {
      var savedGames = JSON.parse(window.localStorage.getItem("savedGames"));
      var saved_games_keys = Object.keys(savedGames);
      if (game__ != game && saved_games_keys.indexOf(game__) == -1) {
        var saved_games_new = {};
        for (var i = 0; i < saved_games_keys.length; i++) {
          saved_games_new[((saved_games_keys[i] == game) ? game__ : saved_games_keys[i])] = savedGames[saved_games_keys[i]];
        }
        window.localStorage.setItem("savedGames", JSON.stringify(saved_games_new));

        var history = "";
        var savedGames = JSON.parse(window.localStorage.getItem("savedGames"));
        var del_items = [];
        for (var i = Object.keys(savedGames).length - 1; i > -1; i--) {
          if (savedGames[Object.keys(savedGames)[i]]['rounds'][0][0][0] != null) {
            history += '<li><a href="/game_/?id='+btoa(Object.keys(savedGames)[i])+'" class="item-title">'+Object.keys(savedGames)[i]+'</a></li>';
          } else if (i != Object.keys(savedGames).length - 1) {
            del_items.push(Object.keys(savedGames)[i]);
          }
        }
        for (var i = 0; i < del_items.length; i++) {
          delete savedGames[del_items[i]];
        }
        window.localStorage.setItem("savedGames", JSON.stringify(savedGames));
        document.getElementsByClassName("history-page")[0].getElementsByTagName("ul")[0].innerHTML = history;
        app.searchbar.create({
          el: '.searchbar',
          searchContainer: '.list-history',
          searchIn: '.item-title',
          on: {
            search(sb, query, previousQuery) {}
          }
        });
        if (history.includes("<li>") == false) {
            document.getElementsByClassName("history-page")[0].getElementsByClassName("list")[0].style.display = "none";
        }
      }
    }, function() {}, game);
  };
});

$$(document).on('page:init', '.page[data-name="predictions"]', function (e) {
  predictions(predictions_);
});

$$(document).on('page:init', '.page[data-name="results"]', function (e) {
  results(results_);
});

function edit_predictions(e) {
    for (var i = 0; i < e.parentElement.children.length; i++) {
        if (e.parentElement.children[i] == e) {
            mainView.router.navigate('/predictions_/?no='+i);
            break;
        }
    }
}

function edit_results(e) {
    for (var i = 0; i < e.parentElement.children.length; i++) {
        if (e.parentElement.children[i] == e) {
            mainView.router.navigate('/results_/?no='+i);
            break;
        }
    }
}

function predictions(rounds_no) {
  var body = '<div class="block-title">Total # of hands : ' + gnids[rounds_no] + '</div><table style="width:100%;">';
  for (var i = 0; i < names.length; i++) {
    if (i % 2 == 0) { body += "<tr>"; }
      body += '<td width="50%"><div class="card"><div class="card-content card-content-padding"><center><h4>'+names[(((rounds_no) % names.length) + i) % names.length]+'</h4><div class="stepper-'+((((rounds_no) % names.length) + i) % names.length)+' stepper stepper-fill stepper-init"><div class="stepper-button-minus"></div><div class="stepper-input-wrap"><input type="text" value="'+((rounds[rounds_no][(((rounds_no) % names.length) + i) % names.length][0] == null) ? 0 : rounds[rounds_no][(((rounds_no) % names.length) + i) % names.length][0])+'" min="0" max="'+gnids[rounds_no]+'" onchange="predictions_changed('+((i == names.length - 1) ? 1 : 0)+');" readOnly></div><div class="stepper-button-plus"></div></div></center></div></div></td>';
    if (i % 2 == 1) { body += "</tr>"; }
  }
  body += "</table>";
  mainView['router'].currentPageEl.getElementsByClassName("page-content")[0].innerHTML = body;
  mainView['router'].currentPageEl.getElementsByClassName("fab")[0].setAttribute("data-round-no", rounds_no);
  predictions_changed(0);
}

function predictions_changed(j) {
    var total_predictions = 0;
    var last_val = parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value);
    for (var i = 0; i < names.length; i++) {
        total_predictions += parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[i].getElementsByTagName("input")[0].value);
    }
    if (j == 1) {
        var no_cards = gnids[mainView['router'].currentPageEl.getElementsByClassName("fab")[0].getAttribute("data-round-no")];
        if (total_predictions == no_cards) {
            if (predictions_temp > last_val) {
                if (last_val - 1 > -1) {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = last_val - 1;
                    last_val -= 1;
                    total_predictions -= 1;
                } else {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = last_val + 1;
                    last_val += 1;
                    total_predictions += 1;
                }
            } else {
                if (last_val + 1 < no_cards) {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = last_val + 1;
                    last_val += 1;
                    total_predictions += 1;
                } else {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = last_val - 1;
                    last_val -= 1;
                    total_predictions -= 1;
                }
            }
        }


        /*
        if (total_predictions == no_cards) {
            if (predictions_temp > last_val) {
                if (last_val - 1 > -1) {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = last_val - 1;
                    total_predictions -= 1;
                } else {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = last_val + 1;
                    total_predictions += 1;
                }
            } else {
                if (last_val < no_cards) {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = last_val + 1;
                    total_predictions += 1;
                } else {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = last_val - 1;
                    total_predictions -= 1;
                }
            }
        }


        if (gnids[mainView['router'].currentPageEl.getElementsByClassName("fab")[0].getAttribute("data-round-no")] == total_predictions) {
            if (predictions_temp > mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value) {
                if (parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value) + 1 > -1) {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value) - 1;
                    total_predictions -= 1;
                } else {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value) - 1;
                    total_predictions += 1;
                }
            } else {
                if (parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value) + 1 <= gnids[mainView['router'].currentPageEl.getElementsByClassName("fab")[0].getAttribute("data-round-no")]) {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value) + 1;
                    total_predictions += 1;
                } else {
                    mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value = parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value) - 1;
                    total_predictions -= 1;
                }
            }
        }*/
    }
    predictions_temp = last_val;
    mainView['router'].currentPageEl.getElementsByClassName("prediction_total")[0].innerHTML = total_predictions;

}

function save_predictions(a) {
    if (gnids[mainView['router'].currentPageEl.getElementsByClassName("fab")[0].getAttribute("data-round-no")] == parseInt(mainView['router'].currentPageEl.getElementsByClassName("prediction_total")[0].innerHTML)) {
        show_toast("Total predictions cannot equal " + gnids[mainView['router'].currentPageEl.getElementsByClassName("fab")[0].getAttribute("data-round-no")]);
    } else {
        for (var i = 0; i < names.length; i++) {
            rounds[a][i][0] = parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-"+i)[0].getElementsByTagName("input")[0].value);
        }
        /*if (a == rounds.length - 1 && fab == "input_predictions") {
            change_fab("results");
            leaderboard.getElementsByClassName("table-data")[0].children[0].children[a].lastChild.getElementsByTagName("button")[0].style.display = "block";
        }*/
        recalculate(a);
        mainView['router'].back();
    }
}

function results(rounds_no) {
  var body = '<div class="block-title">Total # of hands : ' + gnids[rounds_no] + '</div><table style="width:100%;">';
  for (var i = 0; i < names.length; i++) {
    if (i % 2 == 0) { body += "<tr>"; }
      body += '<td width="50%"><div class="card"><div class="card-content card-content-padding"><center><h4>'+names[(((rounds_no) % names.length) + i) % names.length]+'</h4><div class="stepper-'+((((rounds_no) % names.length) + i) % names.length)+' stepper stepper-fill stepper-init"><div class="stepper-button-minus"></div><div class="stepper-input-wrap"><input type="text" value="'+((rounds[rounds_no][(((rounds_no) % names.length) + i) % names.length][1] == null) ? 0 : rounds[rounds_no][(((rounds_no) % names.length) + i) % names.length][1])+'" min="0" max="'+gnids[rounds_no]+'" onchange="results_changed();" readOnly></div><div class="stepper-button-plus"></div></div></center></div></div></td>';
    if (i % 2 == 1) { body += "</tr>"; }
  }
  body += "</table>";
  mainView['router'].currentPageEl.getElementsByClassName("page-content")[0].innerHTML = body;
  mainView['router'].currentPageEl.getElementsByClassName("fab")[0].setAttribute("data-round-no", rounds_no);
  results_changed(0);
}

function results_changed() {
    var total_predictions = 0;
    var last_val = parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[names.length - 1].getElementsByTagName("input")[0].value);
    for (var i = 0; i < names.length; i++) {
        total_predictions += parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-input-wrap")[i].getElementsByTagName("input")[0].value);
    }
    mainView['router'].currentPageEl.getElementsByClassName("prediction_total")[0].innerHTML = total_predictions;
}

function save_results(a) {
    if (gnids[mainView['router'].currentPageEl.getElementsByClassName("fab")[0].getAttribute("data-round-no")] == parseInt(mainView['router'].currentPageEl.getElementsByClassName("prediction_total")[0].innerHTML)) {
        for (var i = 0; i < names.length; i++) {
            rounds[a][i][1] = parseInt(mainView['router'].currentPageEl.getElementsByClassName("stepper-"+i)[0].getElementsByTagName("input")[0].value);
        }
        /*if (a == rounds.length - 1 && fab == "input_results") {
            change_fab("predictions");
            leaderboard.getElementsByClassName("table-data")[0].children[0].children[a].lastChild.getElementsByTagName("button")[1].style.display = "block";
        }*/
        recalculate(a);
        mainView['router'].back();
    } else {
        show_toast("Total hands made must equal " + gnids[mainView['router'].currentPageEl.getElementsByClassName("fab")[0].getAttribute("data-round-no")]);
    }
}

function recalculate(a) {
    for (var i = 0; i < rounds.length; i++) {
        for (var j = 0; j < names.length; j++) {
            if (rounds[i][j][0] != null && rounds[i][j][1] != null) {
                rounds[i][j][2] = rounds[i][j][1] + ((rounds[i][j][0] == rounds[i][j][1]) ? 10 : 0);
                rounds[i][j][3] = ((i == 0) ? rounds[i][j][2] : rounds[i - 1][j][3] + rounds[i][j][2]);
                leaderboard.getElementsByClassName("table-data")[0].children[0].children[i].children[j + 1].getElementsByTagName("td")[0].innerHTML = rounds[i][j][0];
                leaderboard.getElementsByClassName("table-data")[0].children[0].children[i].children[j + 1].getElementsByTagName("td")[1].innerHTML = rounds[i][j][2];
                leaderboard.getElementsByClassName("table-data")[0].children[0].children[i].children[j + 1].getElementsByTagName("td")[2].innerHTML = rounds[i][j][3];
            } else if (rounds[i][j][0] != null) {
                leaderboard.getElementsByClassName("table-data")[0].children[0].children[i].children[j + 1].getElementsByTagName("td")[0].innerHTML = rounds[i][j][0];
            }
        }
    }
    if (a == rounds.length - 1 && fab == "input_results") {
        change_fab("predictions");
        leaderboard.getElementsByClassName("table-data")[0].children[0].children[a].lastChild.getElementsByTagName("button")[1].style.display = "block";
        if (rounds.length < 19) {
            var body = "<tr><td emptyhash></td>";
            for (var j = 0; j < names.length; j++) {
                body += '<td><table class="data_entry"><tr><td></td><td></td><td></td></tr></table></td>';
            }
            body += "<td "+((i == 0) ? "firstroweditentry" : "")+" class='edit_btns'><div style='width:79px'><button style='display:none;' class='button button-raised button-round' onclick='edit_predictions(this.parentElement.parentElement.parentElement);'>P</button><button style='display:none;' class='button button-raised button-round' onclick='edit_results(this.parentElement.parentElement.parentElement);'>R</button></div></td></tr>";
            leaderboard.getElementsByClassName("table-data")[0].children[0].innerHTML += body;
            leaderboard.getElementsByClassName("table-numbers")[0].children[0].innerHTML += "<tr><td>"+gnids[rounds.length]+"</td></tr>";
            rounds[rounds.length] = [];
            for (var i = 0; i < names.length; i++) {
                rounds[rounds.length - 1][i] = [null, null, null, null];
            }
        } else {
            leaderboard.getElementsByClassName("half-table")[0].classList.replace("half-table", "full-table");
            document.getElementById("fab").style.display = "none";
            document.getElementsByClassName("player_info")[0].style.display = "none";
        }
    } else if (a == rounds.length - 1 && fab == "input_predictions") {
        change_fab("results");
        leaderboard.getElementsByClassName("table-data")[0].children[0].children[a].lastChild.getElementsByTagName("button")[0].style.display = "block";
    }
    save();
    document.getElementsByClassName("player_info")[0].getElementsByTagName("div")[1].innerHTML = names[(rounds.length - 1) % names.length];
}

/*
document.getElementById("player_cont").style.display = "none";
document.getElementById("table_cont").style.display = "block";
names = ["abc", "def", "ghi", "jkl"];
//var rounds = [[[0, null, null, null],[0, null, null, null],[0, null, null, null],[0, null, null, null]]];
var rounds = [[[0, 1, 2, 3],[0, 1, 2, 5],[0, 1, 2, 4],[0, 1, 2, 2]]];
//var rounds = [[[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]], [[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3],[0, 1, 2, 3]]];
//var rounds = [[[null, null, null, null],[null, null, null, null],[null, null, null, null],[null, null, null, null]]];
//createTable(document.getElementById("table_cont"), rounds, true, names);
initGame();
*/
