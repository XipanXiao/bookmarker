define('reader_app', [
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

require(['reader_app']);
