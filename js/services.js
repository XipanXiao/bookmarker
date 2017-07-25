define('services', [], function() {
  if (!String.prototype.format) {
    String.prototype.format = function() {
      var args = arguments;
      return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number]
            : match;
      });
    };
  }

  var bookmarkUrl = 'cgi-bin/bookmark.php';
  var sutraUrl = 'cgi-bin/sutra.php';
  
  function http_form_post($http, data, url) {
    return $http({
        method: 'POST',
        url: url || bookmarkUrl,
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  }

  return angular.module('ServicesModule', []).factory('rpc', function($http, 
      $httpParamSerializerJQLike) {
    return {
      get_bookmarks: function() {
        return $http.get(bookmarkUrl);
      },
    
      create_bookmark: function(bookmark) {
        return http_form_post($http, $httpParamSerializerJQLike(bookmark));
      },
      
      remove_bookmark: function(id) {
        var url = '{0}?id={1}'.format(bookmarkUrl, id);
        return $http.delete(url);
      },

      get_sutra_sources: function() {
        return $http.get('{0}?rid=sources'.format(sutraUrl));
      },
      
      get_categories: function() {
        return $http.get('{0}?rid=categories'.format(sutraUrl));
      },

      get_sutra_list: function(source) {
        return $http.get('{0}?rid=sutra&source={1}'
            .format(sutraUrl, source || 1));
      },

      get_progress: function() {
        return $http.get('{0}?rid=progress'.format(sutraUrl));
      },

      get_recents: function() {
        return $http.get('{0}?rid=recents'.format(sutraUrl));
      },
      
      update_recents: function(bookId, source) {
        var data = {
          rid: 'recents', 
          book_id: bookId, 
          source: source
        };
        return http_form_post($http, $httpParamSerializerJQLike(data), 
            sutraUrl);
      },

      update_progress: function(bookId, finished) {
        var data = {rid: 'progress', book_id: bookId, finished: finished};
        return http_form_post($http, $httpParamSerializerJQLike(data), 
            sutraUrl);
      },
      
      login: function(id_token) {
        var data = {id_token: id_token};
        return http_form_post($http, $httpParamSerializerJQLike(data), 
            'cgi-bin/users.php');
      }
    };
  });
});
