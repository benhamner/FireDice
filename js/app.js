var fireDiceApp = angular.module('fireDiceApp', ['firebase']).
    config(function($routeProvider) {
        $routeProvider.
            when('/', { controller: FireDiceCtrl, templateUrl: 'main.html'}).
            otherwise({ redirectTo: '/' });
    }).
    factory('dataService', function($window) {
        var url = "https://firedice.firebaseIO.com/";
        return {
            baseURL: url,
            dataRef: new Firebase(url)
        };
    });