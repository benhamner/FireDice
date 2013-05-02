var FireDiceCtrl = function($scope, $location, angularFire, dataService, authService) {
    $scope.dataService = dataService;
    $scope.authService = authService;
    $scope.authClient = authService.authClient;
    authService.bindUser($scope);

    $scope.login = function() {
        console.log("Calling Login Function");
        $scope.authClient.login('facebook');
    };

    $scope.logout = function() {
        console.log("Calling Logout Function");
        $scope.authClient.logout();
    };

    $scope.create_game = function() {
        var pushRef = $scope.dataService.dataRef.child("games").push();
        users = {};
        users[$scope.user.id] = {num_dice: 5};
        pushRef.set({"users": users,
                     "started": false,
                     "ended": false,
                     "bid_dice_count": 0,
                     "bid_dice_value": 0});
        $scope.user.currentGame = pushRef.name();
        $location.path("/game");
    };

    console.log("setting scope");
    window.scope = $scope;
};