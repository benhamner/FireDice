var GameCtrl = function($scope, $location, angularFire) {
    $scope.isInGame = function () {
        if ("user" in $scope && $scope.user) {
            return "currentGame" in $scope.user;
        }
        return false;
    }

    if ($scope.isInGame) {
        $location.path("/game")
    }

    $scope.tryReconnectToExistingGame = function() {
        if ("currentGame" in $scope.user) {
            angularFire($scope.dataService.baseURL + "games/" + $scope.user.currentGame, $scope, 'currentGame', {});
            angularFire($scope.dataService.baseURL + "games/" + $scope.user.currentGame + "/players", $scope, 'players', []);
        }
    }

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