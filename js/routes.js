
var routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/about/',
    url: './pages/about.html',
    on: {
      pageBeforeIn: function(e, page) {
        if (location.hash == "#1") {
          location.hash = "#2";
          setTimeout(function() {
            location.hash = "#3";
          }, 10);
        } else { location.hash = "#3"; }
      },
    }
  },
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
