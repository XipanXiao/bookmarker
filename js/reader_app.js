define('reader_app', [
    'bookmarks/bookmarks',
    'reader/reader',
    'utils', 'services'], function() {

  angular.module('AppModule', ['BookmarksModule',
      'ReaderModule',
      'UtilsModule', 'ServicesModule'])
      .directive('body', function(utils, rpc) {
        return {
          link: function(scope) {
            function login() {
              return rpc.login(scope.idToken).then(function(response) {
                return scope.userId = response.data.user_id;
              });
            }

            scope.$watch("idToken", function(idToken) {
              if (idToken) {
                login();
              }
            });
          }
        };
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});

require(['reader_app']);
