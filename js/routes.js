
var routes = [
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/about/',
    url: './pages/about.html',
    on: {
      pageInit: function(e, page){
        location.hash = "#3";
      },
    }
  },
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
