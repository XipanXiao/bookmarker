define('login_button/login_button', ['services'], function() {
  return angular.module('LoginButtonModule', ['ServicesModule'])
  .directive('loginButton', function($rootScope, rpc) {
    return {
      restrict: 'E',
      link: function(scope) {
        function onSignIn(googleUser) {
          scope.name = googleUser.getBasicProfile().getName();
          var id_token = googleUser.getAuthResponse().id_token;

          rpc.login(id_token).then(function(response) {
            var userId = response.data.user_id;
            if (userId) {
              $rootScope.$broadcast('user-id', userId);
            }
          });
        }
        
        gapi.load('auth2', function () {
          var auth2 = gapi.auth2.init({
            client_id: '513369351296-c0k8jf39t1kvrhfrj9i49ht11ndfu213.apps.googleusercontent.com',
            cookiepolicy: 'single_host_origin',
            scope: 'profile email'
          });

          gapi.signin2.render('g-signin2', {
            theme: 'dark',
            onsuccess: onSignIn,
            onfailure: function() {
              alert('登录失败');
            }
          });
        });        
      },
      templateUrl : 'js/login_button/login_button.html?tag=201707031806'
    };
  });
});
