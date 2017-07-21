define('index_app', [
    'utils', 'services'], function() {

  angular.module('AppModule', ['UtilsModule', 'ServicesModule'])
      .directive('body', function(utils, rpc) {
        return {
          link: function(scope) {
            scope.finished = 0;
            scope.source = {id: 1};

            scope.open = function(book) {
              var url = 
                  (scope.source.face_base || scope.source.base) + book.url;
              window.open('sutra.html?source={0}'.format(url), '_blank');
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

            function getSources() {
              if (scope.sources) return utils.truePromise();

              return rpc.get_sutra_sources().then(function(response) {
                scope.sourceIds = utils.keys(response.data);
                scope.source = utils.first(response.data);
                return scope.sources = response.data;
              });
            }

            function getSutraList() {
              return rpc.get_sutra_list(scope.source.id)
                  .then(function(response) {
                return scope.books = response.data;
              });
            }
            
            scope.sourceChanged = function() {
              var id = scope.source.id;
              if (scope.sources) {
                utils.mix_in(scope.source, scope.sources[id]);
              }
              utils.requestOneByOne([getSources, getSutraList]);
            };

            scope.$watch("userId", function(userId) {
              if (userId) {
                scope.userId = userId;
                rpc.get_progress(userId).then(function(response) {
                  var progresses = response.data;
                  scope.finished = utils.keys(progresses).length;
                  scope.books.forEach(function(book) {
                    var progress = progresses[book.id];
                    book.finished = progress && progress.finished;
                  });
                });
              }
            });
            
            scope.sourceChanged();
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
