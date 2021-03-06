define('bookmarks/bookmarks', 
    ['services', 'utils'], function() {
  return angular.module('BookmarksModule', [
      'ServicesModule',
      'UtilsModule']).directive('bookmarks', function(rpc, utils) {
    return {
      scope: {
        source: '=',
        userId: '='
      },
      link: function(scope) {
        var bookMarkPromise;

        scope.$watch('userId', function(userId) {
          if (userId) {
            getBookmarks().then(function() {
              openBookmarkedPage();
            });
          }
        });
        scope.$watch('source', function(source) {
          if (!source) return;

          if (bookMarkPromise) {
            bookMarkPromise.then(function() {
              if (!openBookmarkedPage()) {
                setUrl(source.url);
              }
            });
          } else {
            setUrl(source.url);
          }
        });

        function findBookmark() {
          if (!scope.source) return utils.last(scope.bookmarks);

          var volume = scope.source.volume;
          for (var index in scope.bookmarks) {
            var item = scope.bookmarks[index];
            if (volume == scope.source.getVolume(item.url)) {
              return item;
            }
          }
        }
        
        function openBookmarkedPage() {
          var bookmark = findBookmark();
          if (bookmark) {
            scope.open(bookmark);
            return bookmark;
          }
        }

        function getBookmarks() {
          return bookMarkPromise = 
              rpc.get_bookmarks().then(function(response) {
            return scope.bookmarks = response.data || [];
          });
        };
        
        scope.remove = function(bookmark) {
          rpc.remove_bookmark(bookmark.id).then(function(response) {
            if (parseInt(response.data.deleted)) {
              var index = scope.bookmarks.indexOf(bookmark);
              scope.bookmarks.splice(index, 1);
            }
          });
        };
        
        function getSelectionText() {
          var text = "";
          var iframe = frames['main_iframe'];
          var window = iframe.window;
          var document = iframe.contentDocument || window.document; 
          if (window.getSelection) {
              text = window.getSelection().toString();
          } else if (document.selection && document.selection.type != "Control") {
              text = document.selection.createRange().text;
          }
          return text;
        }
        
        function getUrl() {
          var iframe = frames['main_iframe'];
          var window = iframe.window;
          return utils.removeProxy(window.location.href);
        }
        
        function setUrl(url) {
          var iframe = frames['main_iframe'];
          var window = iframe.window;
          window.location.href = utils.getProxyUrl(url);
        }
        
        function getTitle() {
          var iframe = frames['main_iframe'];
          var window = iframe.window;
          var document = iframe.contentDocument || window.document;
          return document.title;
        }
        
        scope.open = function(bookmark) {
          if (getUrl() == bookmark.url) {
            scope.search(bookmark.anchor);
            return;
          }

          setUrl(bookmark.url);
          var deregisterListener = scope.$on('reader-loaded', function() {
            deregisterListener();
            setTimeout(function() {
                scope.search(bookmark.anchor);
              }, 1000);
          });
        };

        scope.search = function(text) {
          var iframe = frames['main_iframe'];
          var window = iframe.window;
          var document = iframe.contentDocument || window.document;
          
          if (window.find && window.getSelection) {
            document.designMode = "on";
            var sel = window.getSelection();
            sel.collapse(document.body, 0);
            
            if (window.find(text)) {
                document.execCommand("HiliteColor", false, "yellow");
                sel.collapseToEnd();
            }
            document.designMode = "off";
          } else if (document.body.createTextRange) {
            var textRange = document.body.createTextRange();
            if (textRange.findText(text)) {
                textRange.execCommand("BackColor", false, "yellow");
                textRange.collapse(false);
            }
          }
        };

        scope.create = function() {
          var bookmark = {
            url: getUrl(),
            title: getTitle(),
            anchor: getSelectionText()
          };
          rpc.create_bookmark(bookmark).then(function(response) {
            if (response.data.updated) {
              getBookmarks();
            }
          });
        };
      },
      templateUrl : 'js/bookmarks/bookmarks.html?tag=201707031806'
    };
  });
});
