define('book/book', [], function() {
  return angular.module('BookModule', []).directive('book', function() {
    return {
      scope: {
        book: '='
      },
      restrict: 'E',
      templateUrl : 'js/book/book.html?tag=201707031806'
    };
  }).filter('volume', function() {
    return function(input) {
      input = input || '';
      var out = '';
      for (var i = 0; i < 4 - input.length; i++) {
        out += '0';
      }
      return out + input;
    };
  });
});
