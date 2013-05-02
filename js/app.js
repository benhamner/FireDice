var fireDiceApp = angular.module('fireDiceApp', ['firebase']).
    config(function($routeProvider) {
        $routeProvider.
            when('/', { controller: FireDiceCtrl, templateUrl: 'main.html'}).
            when('/login', { controller: FireDiceCtrl, templateUrl: 'login.html'}).
            when('/game', { controller: FireDiceCtrl, templateUrl: 'game.html'}).
            otherwise({ redirectTo: '/' });
    }).
    factory('dataService', function($window) {
        var url = "https://firedice.firebaseIO.com/";
        return {
            baseURL: url,
            dataRef: new Firebase(url)
        };
    });