var app = angular.module('angular-navbar', []);

app.factory('$session', function () {
    return {
        get: function (key) {
            return angular.fromJson(sessionStorage.getItem(key));
        },
        set: function (key, value) {
            return sessionStorage.setItem(key, angular.toJson(value));
        },
        unset: function (key) {
            return sessionStorage.removeItem(key);
        },
        clear: function () {
            return sessionStorage.clear();
        }
    };
});

app.service('AuthenticationService', ['$http', '$timeout', '$q', '$session', function ($http, $timeout, $q, $session) {
    this.login = function (credentials) {
        var login = $http.post('/login', credentials);
        login.success(function (user) {
            $session.set('user', user);
        });
        return login;
    };

    this.logout = function () {
        var logout = $http.get('/logout');
        logout.success(function () {
            $session.clear();
        });
        return logout;
    };

    this.user = function () {
        /*var user = $session.get('user');
        if (user) {
            var deferred = $q.defer();
            $timeout(function () {
                deferred.resolve(user);
            }, 0);
            return deferred.promise;
        } else {
            return $http.get('/user');
        }*/
        return $http.get('/user');
    };

    this.register = function (newUser) {
        var register = $http.post('/register', newUser);
        register.success(function (user) {
            $session.set('user', user);
        });
        return register;
    };
}]);

app.controller('NavbarCtrl', ['$scope', '$timeout', 'AuthenticationService', function ($scope, $timeout, AuthenticationService) {
    $scope.user = {
        isLogged: false,
        username: '',
        email: ''
    };
    $scope.login = {
        username: 'a',
        password: 'a'
    };
    $scope.loginFn = function () {
        console.log('start login');
        AuthenticationService.login($scope.login)
            .success(function (user) {
                onUserLogined(user);
            })
            .error(function (err) {
                console.log('login:' + err.message);
            });
    };
    $scope.logoutFn = function () {
        console.log('logout');
        AuthenticationService.logout()
            .success(function(data){
                $scope.user.isLogged = false;
                $scope.user.username = '';
                $scope.user.email = '';
            });

    };
    $scope.$on('register_success', function(event, user){
        onUserLogined(user);
    });

    AuthenticationService.user()
        .then(function(user){
            onUserLogined(user);
        });

    function onUserLogined(user){
        $scope.user.isLogged = true;
        $scope.user.username = user.username;
        $scope.user.email = user.email;
    }
}]);

app.controller('RegisterCtrl', ['$scope', '$timeout', 'AuthenticationService', function ($scope, $timeout, AuthenticationService) {
    $scope.register = {
        username: 'a',
        email: 'a@163.com',
        password: 'a'
    };
    $scope.state = {
        isSubmit: false,
        isSuccess: false,
        success: '',
        isError: false,
        error: ''
    };
    $scope.registerFn = function () {
        $scope.state.isSubmit = true;
        AuthenticationService.register($scope.register)
            .success(function (user) {
                $scope.state.isSuccess = true;
                $scope.state.success = 'register success';
                $scope.$emit('register_success', user);
                $timeout(function () {
                    $scope.close();
                }, 1500);
            })
            .error(function (err) {
                $scope.state.isError = true;
                $scope.state.error = err.message;
                $scope.state.isSubmit = false;
            });
    };
    $scope.resetState = function() {
        $scope.state.isSubmit = false;
        $scope.state.isSuccess = false;
        $scope.state.success = '';
        $scope.state.isError = false;
        $scope.state.error = '';
    };
}]);

app.directive('navbar', function () {
    return {
        restrict: 'E',
        templateUrl: '/directives/navbar/navbar.html',
        controller: 'NavbarCtrl',
        replace: true,
        link: function (scope, element, attrs) {

        }
    }
});

app.directive('register', function () {
    return {
        restrict: 'E',
        templateUrl: '/directives/navbar/register.html',
        controller: 'RegisterCtrl',
        link: function (scope, element, attrs) {
            angular.element('body').append(element);
            scope.close = function(){
                element.modal('hide');
            };
            element.on('show.bs.modal', function (e) {
                scope.resetState();
                scope.$apply();
            })
        }
    }
});