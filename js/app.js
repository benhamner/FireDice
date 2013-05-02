var fireDiceApp = angular.module('fireDiceApp', ['firebase']).
    config(function($routeProvider) {
        $routeProvider.
            when('/', { controller: FireDiceCtrl, templateUrl: 'main.html'}).
            when('/login', { controller: FireDiceCtrl, templateUrl: 'login.html'}).
            when('/game', { controller: FireDiceCtrl, templateUrl: 'game.html'}).
            otherwise({ redirectTo: '/login' });
    }).
    factory('dataService', function($window) {
        var url = "https://firedice.firebaseIO.com/";
        return {
            baseURL: url,
            dataRef: new Firebase(url)
        };
    }).
    factory('authService', function($window, $location, dataService, angularFire) {
        // This is a factory function, and is responsible for 
        // creating the 'greet' service.
        var isLoggedIn = false;
        var userState = {};
        var authClient = new FirebaseAuthClient(dataService.dataRef, function(error, myUser) {
            if (error) {
                // an error occurred while attempting login
                $location.path("/login");
                console.log(error);
            } else if (myUser) {
                // user authenticated with Firebase
                console.log('User ID: ' + myUser.id + ', Provider: ' + myUser.provider);
                userRef = dataService.dataRef.child("users").child(myUser.id)
                userRef.child("id").set(myUser.id);
                userRef.child("displayName").set(myUser.displayName);
                userRef.child("firstName").set(myUser.first_name);
                userRef.child("lastName").set(myUser.last_name);
                userState.id = myUser.id
                /*
                var promise = angularFire(dataService.baseURL + "users/" + myUser.id, scope, 'user', {});
                promise.then(function () {
                    scope.user.id = myUser.id;
                    scope.user.displayName = myUser.displayName;
                    scope.user.firstName = myUser.first_name;
                    scope.user.lastName = myUser.last_name;
                    if ("currentGame" in scope.user) {
                        $location.path("/game");
                    } else {
                        $location.path("/");
                    }
                });*/
            } else {
                // user is logged out
                $location.path("/login");
                console.log("Not logged in");
            }
        });

        var bindUser = function($scope) {
            angularFire(dataService.baseURL + "users/" + userState.id, $scope, 'user', {});
        }

        return {
            authClient: authClient,
            userState: userState,
            bindUser: bindUser
        };
    });