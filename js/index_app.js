define('index_app', [
    'utils', 'services'], function() {

  angular.module('AppModule', ['UtilsModule', 'ServicesModule'])
      .directive('body', function(utils, rpc) {
        return {
          link: function(scope) {
            scope.finished = 0;
            
            scope.open = function(book) {
              window.open('reader.html?title={0}'.format(book.name), '_blank');
            };
            
            scope.toggle = function(book) {
              var finished = book.finished ? 0 : 1;
              rpc.update_progress(scope.userId, book.id, finished)
                  .then(function(response) {
                    if (response.data.updated) {
                      book.finished = finished;
                      scope.finished += finished ? 1 : -1; 
                    }
                  });
            };

            rpc.get_sutra_list().then(function(response) {
              scope.books = response.data;
            });
            
            scope.$watch("userId", function(userId) {
              if (userId) {
                scope.userId = userId;
                rpc.get_progress(userId).then(function(response) {
                  scope.progresses = response.data;
                  scope.finished = utils.keys(scope.progresses).length;
                  utils.forEach(scope.progresses, function(progress) {
                    scope.books[progress.book_id].finished = progress.finished;
                  });
                });
              }
            })
          }
        };
      }).filter('serial', function() {
        return function(input) {
          input = input || '';
          var out = '';
          for (var i = 0; i < 4 - input.length; i++) {
            out += '0';
          }
          return out + input;
        };
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});

require(['index_app']);
