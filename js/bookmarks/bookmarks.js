define('bookmarks/bookmarks', 
    ['services', 'utils'], function() {
  return angular.module('BookmarksModule', [
      'ServicesModule',
      'UtilsModule']).directive('bookmarks', function(rpc, utils) {
    return {
      scope: {
        userId: '='
      },
      link: function(scope) {
        scope.$watch('userId', function(userId) {
          if (userId) {
            reload(userId);
          }
        });
        
        function reload(userId) {
          rpc.get_bookmarks(userId).then(function(response) {
            scope.bookmarks = response.data || [];
            var bookmark = utils.last(scope.bookmarks);
            if (bookmark) {
              scope.open(bookmark);
            }
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
          var url = window.location.href;
          var parts = url.split('url=');
          return parts[1];
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
            
            while (window.find(text)) {
                document.execCommand("HiliteColor", false, "yellow");
                sel.collapseToEnd();
            }
            document.designMode = "off";
          } else if (document.body.createTextRange) {
            var textRange = document.body.createTextRange();
            while (textRange.findText(text)) {
                textRange.execCommand("BackColor", false, "yellow");
                textRange.collapse(false);
            }
          }
        };

        scope.create = function() {
          var bookmark = {
            user_id: scope.userId,
            url: getUrl(),
            title: getTitle(),
            anchor: getSelectionText()
          };
          rpc.create_bookmark(bookmark).then(function(response) {
            if (response.data.updated) {
              scope.bookmarks.push(bookmark);
            }
          });
        };
      },
      templateUrl : 'js/bookmarks/bookmarks.html?tag=201707031806'
    };
  });
});
