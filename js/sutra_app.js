define('sutra_app', [
    'bookmarks/bookmarks',
    'login_button/login_button',
    'reader/reader',
    'utils', 'services'], function() {

  angular.module('AppModule', ['BookmarksModule',
      'LoginButtonModule',
      'ReaderModule',
      'UtilsModule', 'ServicesModule'])
      .directive('body', function(utils, rpc) {
        return {
          link: function(scope) {
            function getUrlParameter(name) {
              var result = null;
              var params = location.search.substr(1).split("&");
              for (var i in params) {
                  var pair = params[i].split('=');
                  if (pair[0] === name) return pair[1];
              }
            }
            
            var url = getUrlParameter('source');
            if (!url) return;
            
            function getVolume(url) {
              var pattern = scope.source.url_pattern;
              if (!pattern) return 0;

              var m = pattern.exec(url);
              if (m) return parseInt(m[1], 10);
              
              pattern = scope.source.face_pattern;
              if (!pattern) return 0;

              var m = pattern.exec(url);
              return m && parseInt(m[1]) || 0;
            }

            rpc.get_sutra_sources().then(function(response) {
              for (var id in response.data) {
                var source = response.data[id];
                if (url.startsWith(source.base) || 
                    url.startsWith(source.face_base)) {
                  scope.source = source;
                  source.url = url;
                  source.url_pattern = new RegExp(source.url_pattern);
                  source.face_pattern = 
                      source.face_pattern && new RegExp(source.face_pattern);
                  source.volume = getVolume(url);
                  source.getVolume = getVolume;
                  break;
                }
              }
            });

            scope.$on("user-id", function(userId) {
              scope.userId = userId;
            });
          }
        };
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});

require(['sutra_app']);
