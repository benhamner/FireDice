var fireDiceApp = angular.module('fireDiceApp', ['firebase'])
    .config(function($routeProvider) {
        $routeProvider.
            when('/', { controller: MainCtrl, templateUrl: 'main.html'}).
            when('/login', { templateUrl: 'login.html'}).
            when('/game', { controller: GameCtrl, templateUrl: 'game.html'}).
            otherwise({ redirectTo: '/' });
    })
    .factory('dataService', function($window) {
        var url = "https://firedice.firebaseIO.com/";
        return {
            baseURL: url,
            dataRef: new Firebase(url)
        };
    })
    .run(function($rootScope, $location, dataService, angularFire) {
        $rootScope.isLoggedIn = false;
        $rootScope.dataService = dataService;

        $rootScope.authClient = new FirebaseAuthClient(dataService.dataRef, function(error, myUser) {
            if (error) {
                // an error occurred while attempting login
                $location.path("/login");
                console.log(error);
            } else if (myUser) {
                // user authenticated with Firebase
                console.log('User ID: ' + myUser.id + ', Provider: ' + myUser.provider);
                var promise = angularFire($rootScope.dataService.baseURL + "users/" + myUser.id, $rootScope, 'user', {});
                promise.then(function () {
                    $rootScope.user.id = myUser.id;
                    $rootScope.user.displayName = myUser.displayName;
                    $rootScope.user.firstName = myUser.first_name;
                    $rootScope.user.lastName = myUser.last_name;
                    $rootScope.isLoggedIn = true;
                    //$rootScope.tryReconnectToExistingGame();
                    $location.path("/");
                });
                var promiseGames = angularFire($rootScope.dataService.baseURL + "games/", $rootScope, 'games', {});
            } else {
                // user is logged out
                $rootScope.user = null;
                $rootScope.isLoggedIn = false;
                $location.path("/login")
                console.log("Not logged in");
            }
        });

        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            if (!$rootScope.isLoggedIn && next.templateUrl != "login.html") {
                $location.path("/login")
            }
        });
    });