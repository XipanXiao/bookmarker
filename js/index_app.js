define('index_app', [
    'bookmarks/bookmarks',
    'reader/reader',
    'utils', 'services'], function() {

  angular.module('AppModule', ['BookmarksModule',
      'ReaderModule',
      'UtilsModule', 'ServicesModule'])
      .directive('body', function(utils, rpc) {
        return {
          link: function(scope) {
          }
        };
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});

require(['index_app']);
