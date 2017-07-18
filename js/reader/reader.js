define('reader/reader', 
    ['services', 'utils'], function() {
  return angular.module('ReaderModule', [
      'ServicesModule',
      'UtilsModule']).directive('reader', function($rootScope, rpc, utils) {
    return {
      link: function(scope) {
        scope.url = 
            'http://www.muni-buddha.com.tw/buddhism/directory-wiki.html';

        function getUrlParameter(name) {
          var result = null;
          var params = location.search.substr(1).split("&");
          for (var i in params) {
              var pair = params[i].split('=');
              if (pair[0] === name) return pair[1];
          }
        }

        var sutraTitle = getUrlParameter('title');
//        if (sutraTitle) {
//          scope.url = '{0} site:www.qldzj.com.cn'.format(sutraTitle);
//          setUrl('https://www.google.com/' +
//              encodeURIComponent('?q=' + scope.url));
//        }

        function setUrl(url) {
          var iframe = frames['main_iframe'];
          var window = iframe.window;
          window.location.href = utils.getProxyUrl(url);
        }
        
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
          var head = doc.getElementsByTagName('head')[0];
          var base = head.getElementsByTagName('base')[0];
          if (!base) {
            base = doc.createElement('base');
            base.href = document.getElementById('url').value;
            head.appendChild(base);
          }
          var a = doc.createElement('a');

          var anchors = doc.querySelectorAll('[href]');
          for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors.item(i);
            if (anchor.tagName.toLowerCase() == 'base') continue;

            a.href = anchor.href;
            anchor.href = a.href;
            anchor.target = '';
          }

          base.parentElement.removeChild(base);

          for (var i = 0; i < anchors.length; i++) {
            var anchor = anchors.item(i);
            if (anchor.tagName.toLowerCase() == 'base') continue;

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
