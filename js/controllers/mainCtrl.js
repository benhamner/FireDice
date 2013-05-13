var MainCtrl = function($scope, $location, angularFire) {
    $scope.isInGame = function () {
        if ("user" in $scope && $scope.user) {
            return "currentGame" in $scope.user;
        }
        return false;
    }

    if ($scope.isInGame()) {
        $location.path("/game")
    }

    $scope.createGame = function() {
        var pushRef = $scope.dataService.dataRef.child("games").push();
        pushRef.set({"started": false,
                     "ended": false,
                     "bidDiceCount": 0,
                     "bidDiceValue": 0,
                     "round": 1,
                     "playerLocThatBid": -1});
        $scope.user.currentGame = pushRef.name();
        $scope.addPlayerToCurrentGame();
    };

    $scope.joinGame = function(gameName) {
        $scope.user.currentGame = gameName;
        $scope.addPlayerToCurrentGame();
    };

    $scope.tryReconnectToExistingGame = function() {
        if ("currentGame" in $scope.user) {
            angularFire($scope.dataService.baseURL + "games/" + $scope.user.currentGame, $scope, 'currentGame', {});
            angularFire($scope.dataService.baseURL + "games/" + $scope.user.currentGame + "/players", $scope, 'players', []);
        }
    }

    $scope.addPlayerToCurrentGame = function() {
        angularFire($scope.dataService.baseURL + "games/" + $scope.user.currentGame, $scope, 'currentGame', {});
        var promise = angularFire($scope.dataService.baseURL + "games/" + $scope.user.currentGame + "/players", $scope, 'players', []);
        promise.then(function() {
            $scope.playerLoc = $scope.players.push({
                "userId": $scope.user.id,
                "numDice": 5,
                "firstName": $scope.user.firstName,
                "diceRolledRound" : 0
            }) - 1;
            $scope.$apply();
        });
    };

    console.log("setting scope");
    window.scope = $scope;
};