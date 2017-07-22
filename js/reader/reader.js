define('reader/reader', 
    ['services', 'utils'], function() {
  return angular.module('ReaderModule', [
      'ServicesModule',
      'UtilsModule']).directive('reader', function($rootScope, rpc, utils) {
    return {
      scope: {
        showAddressInput: '@'
      },
      link: function(scope) {
        scope.url = 'http://www.qldzj.com.cn/html/qldzj-ml.htm';

        function getIFrameDoc(x) {
          return x.document || x.contentDocument || x.contentWindow.document;
        }
        
        function clearIframeObjects(doc) {
          var objects = doc.getElementsByTagName('object');
          for (var i = 0; i < objects.length; i++) {
            var obj = objects.item(i);
            obj.parentElement.removeChild(obj);
          }
        }

        function redirectAnchors(doc) {
          var anchors = doc.querySelectorAll('[href]');
          for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors.item(i);
            anchor.href = utils.getProxyUrl(anchor.href);
          }
        }

        window.alterIframeDoc = function() {
          var iframe = frames['main_iframe'];
          var doc = getIFrameDoc(iframe);
          clearIframeObjects(doc);
          redirectAnchors(doc);
          $rootScope.$broadcast('reader-loaded');
        }
      },
      templateUrl : 'js/reader/reader.html?tag=201707031806'
    };
  });
});
