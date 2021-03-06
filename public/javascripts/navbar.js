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

app.service('User', [function(){
    this.isLogged = false;
    this.username = '';
    this.email = '';

    this.set = function(data){
        this.isLogged = data.isLogged || false;
        this.username = data.username || '';
        this.email = data.email || '';
    };

    this.reset = function(){
        this.isLogged = false;
        this.username = '';
        this.email = '';
    };
}]);

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

app.controller('NavbarCtrl', ['$scope', '$timeout', 'AuthenticationService', 'User', function ($scope, $timeout, AuthenticationService, User) {
    $scope.user = User;
    $scope.login = {
        username: '',
        password: ''
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
                User.reset();
                $scope.login.username = '';
                $scope.login.password = '';
                $scope.$emit('user_logouted');
            });

    };
    $scope.$on('register_success', function(event, user){
        onUserLogined(user);
    });

    AuthenticationService.user()
        .then(function(result){
            if(result.status === 200){
                onUserLogined(result.data);
            }
        });

    function onUserLogined(user){
        User.set({
            isLogged: true,
            username: user.username,
            email: user.email
        });
        $scope.$emit('user_logined', user);
    }
}]);

app.controller('RegisterCtrl', ['$scope', '$timeout', 'AuthenticationService', function ($scope, $timeout, AuthenticationService) {
    function randomString(length) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

        if (! length) {
            length = Math.floor(Math.random() * chars.length);
        }

        var str = '';
        for (var i = 0; i < length; i++) {
            str += chars[Math.floor(Math.random() * chars.length)];
        }
        return str;
    }
    var random = randomString(8);
    $scope.register = {
        username: random,
        email: random + '@163.com',
        password: random
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
            scope.$on('user_unauthorized', function(event){
                if(!scope.login.username){
                    element.find('form input[name="username"]').focus();
                }else if(!scope.login.password){
                    element.find('form input[name="password"]').focus();
                }
            });
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
            });
        }
    }
});