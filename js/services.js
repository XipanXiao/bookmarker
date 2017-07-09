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

  var serviceUrl = 'cgi-bin/bookmark.php';
  
  function http_form_post($http, data) {
    return $http({
        method: 'POST',
        url: serviceUrl,
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
  }

  return angular.module('ServicesModule', []).factory('rpc', function($http, 
      $httpParamSerializerJQLike) {
    return {
      get_bookmarks: function(userId) {
        var url = '{0}?user_id={1}'.format(serviceUrl, userId);
        return $http.get(url);
      },
    
      create_bookmark: function(bookmark) {
        return http_form_post($http, $httpParamSerializerJQLike(bookmark));
      },
    
      remove_bookmark: function(id) {
        var url = '{0}?id={1}'.format(serviceUrl, id);
        return $http.delete(url);
      }
    };
  });
});
