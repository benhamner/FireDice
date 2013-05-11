var FireDiceCtrl = function($scope, $location, angularFire, dataService) {
    $scope.dataService = dataService;
    $scope.isLoggedIn = false;
    $scope.user = null;
    $scope.games = null;
    $scope.currentGame = null;
    $scope.players = null;
    $scope.playerLoc = null;

    $scope.isInGame = function () {
        if ("user" in $scope && $scope.user) {
            return "currentGame" in $scope.user;
        }
        return false;
    }

    $scope.authClient = new FirebaseAuthClient(dataService.dataRef, function(error, myUser) {
        if (error) {
            // an error occurred while attempting login
            $location.path("/login");
            console.log(error);
        } else if (myUser) {
            // user authenticated with Firebase
            console.log('User ID: ' + myUser.id + ', Provider: ' + myUser.provider);
            var promise = angularFire($scope.dataService.baseURL + "users/" + myUser.id, $scope, 'user', {});
            promise.then(function () {
                $scope.user.id = myUser.id;
                $scope.user.displayName = myUser.displayName;
                $scope.user.firstName = myUser.first_name;
                $scope.user.lastName = myUser.last_name;
                $scope.isLoggedIn = true;
                $scope.tryReconnectToExistingGame();
            });
            var promiseGames = angularFire($scope.dataService.baseURL + "games/", $scope, 'games', {});
        } else {
            // user is logged out
            $scope.user = null;
            $scope.isLoggedIn = false;
            console.log("Not logged in");
        }
    });

    $scope.login = function() {
        console.log("Calling Login Function");
        $scope.authClient.login('facebook');
    };

    $scope.logout = function() {
        console.log("Calling Logout Function");
        $scope.authClient.logout();
    };

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

    $scope.tryReconnectToExistingGame = function() {
        if ("currentGame" in $scope.user) {
            angularFire($scope.dataService.baseURL + "games/" + $scope.user.currentGame, $scope, 'currentGame', {});
            angularFire($scope.dataService.baseURL + "games/" + $scope.user.currentGame + "/players", $scope, 'players', []);
        }
    }

    $scope.joinGame = function(gameName) {
        $scope.user.currentGame = gameName;
        $scope.addPlayerToCurrentGame();
    };

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
        });
    };

    $scope.startGame = function() {
        $scope.currentGame.started = true;
    }

    $scope.rollDice = function() {
        $scope.player.dice = _.map(_.range($scope.player.numDice), _.random(6)+1);
        $scope.player.diceRolledRound = $scope.currentGame.round;
    }

    $scope.haveAllPlayersRolledDice = function() {
        return _.all(_.map($scope.players, function(player) {
            return player.diceRolledRound==$scope.currentGame.round;}));
    }

    $scope.playerCanMove = function() {
        return ($scope.haveAllPlayersRolledDice() &&
                $scope.playerLoc == ($scope.currentGame.playerLocThatBid + 1 % $scope.players.length));
    }

    $scope.bid = function() {

    }

    $scope.challenge = function() {
        var numDiceAtValue = $scope.countDiceAtValue($scope.game.bidDiceValue);
        if (numDiceAtValue < $scope.game.bidDiceCount) {
            //challenge passes
            $scope.players[$scope.game.playerLocThatBid].numDice -= 1;
        } else {
            //challenge fails
            $scope.players[$scope.playerLoc].numDice -= 1;
        }

        if ($scope.numberOfPlayersLeftInGame() > 1) {
            $scope.currentGame.round +=1;
            $scope.currentGame.bidDiceCount = 0;
            $scope.currentGame.bidDiceValue = 0;
        } else {
            $scope.currentGame.ended = true;
        }
    }

    $scope.numberOfPlayersLeftInGame = function() {
        return _.filter($scope.players, function(player) { return player.numDice>0; }).length;
    }

    $scope.allDiceOnTable = function() {
        return _.flatten(_.map($scope.players, function (player) {return _.values(player.dice);}));
    }

    $scope.countDiceAtValue = function(diceValue) {
        var dice = $scope.allDiceOnTable();
        return _filter(dice, function(val) {return val==1 || val==diceValue;}).length;
    }

    console.log("setting scope");
    window.scope = $scope;
};