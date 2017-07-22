define('index_app', [
    'book/book', 'utils', 'services'], function() {

  angular.module('AppModule', ['BookModule', 'UtilsModule', 'ServicesModule'])
      .directive('body', function(utils, rpc) {
        return {
          link: function(scope) {
            scope.finished = 0;
            scope.source = {id: 1};
            scope.state = 2;
            scope.recents = [];
            scope.progresses = [];

            scope.open = function(book) {
              var url = 
                  (scope.source.face_base || scope.source.base) + book.url;
              window.open('sutra.html?source={0}'.format(url), '_blank');
              if (scope.userId) {
                updateRecents(book);
              }
            };
            
            /// Inserts [book] to the front of the recents queue.
            function updateRecents(book) {
              rpc.update_recents(scope.userId, book.id, scope.source.id)
              .then(function(response) {
                if (!response.data.updated) return;

                for (var i in scope.recents) {
                  if (scope.recents[i].id == book.id) {
                    scope.recents.splice(i, 1);
                    break;
                  }
                }
                scope.recents.splice(0, 0, book);
              });
            }
            
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
            
            function getRecents() {
              return rpc.get_recents(scope.userId).then(function(response) {
                var recents = response.data;
                if (utils.isEmpty(recents)) return scope.recents = [];

                recents.reverse();
                var recentSource = parseInt(recents[0].source);
                if (recentSource != scope.source.id) {
                  scope.source.id = recentSource;
                  scope.sourceChanged();
                  return scope.recents = recents;
                } else {
                  return fillRecents(recents);
                }
              });
            }
            
            function fillRecents(recents) {
              recents.forEach(function(recent) {
                if (recent.name) return;

                var book = scope.books[parseInt(recent.book_id)];
                if (book) {
                  utils.mix_in(recent, book);
                }
              });
              return scope.recents = recents;
            }

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
                scope.books = [];
                scope.total = 0;
                response.data.forEach(function(book) {
                  scope.total++;
                  book.open = function() {scope.open(book);};
                  book.toggle = function() {scope.toggle(book);};
                  scope.books[book.id] = book;
                });
                fillRecents(scope.recents);
                fillProgresses(scope.progresses);
                return scope.books;
              });
            }
            
            function getProgresses() {
              return rpc.get_progress(scope.userId).then(function(response) {
                var progresses = 
                    utils.isEmpty(response.data) ? [] : response.data;
                return fillProgresses(progresses);
              });
            }
            
            function fillProgresses(progresses) {
              scope.finished = 0;
              progresses.forEach(function(progress) {
                var book = scope.books[progress.book_id];
                if (!book) return;
                book.finished = parseInt(progress.finished);
                scope.finished++;
              });
              return scope.progresses = progresses;
            }
            
            scope.sourceChanged = function() {
              var id = scope.source.id;
              if (scope.sources) {
                utils.mix_in(scope.source, scope.sources[id]);
              }
              scope.sourceRequests = 
                  utils.requestOneByOne([getSources, getSutraList]);
            };

            scope.$watch("userId", function(userId) {
              if (userId) {
                scope.userId = userId;
                scope.sourceRequests.then(function(response) {
                  utils.requestOneByOne([getProgresses, getRecents]);
                });
              }
            });
            
            scope.sourceChanged();
          }
        };
      });

  angular.element(document).ready(function() {
    angular.bootstrap(document, ['AppModule']);
  });
});

require(['index_app']);
