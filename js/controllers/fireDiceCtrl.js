var FireDiceCtrl = function($scope, $location, angularFire, dataService) {
    $scope.dataService = dataService;
    $scope.isLoggedIn = false;
    $scope.user = null;
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
            var promise = angularFire($scope.dataService.baseURL + "users/" + myUser.id, scope, 'user', {});
            promise.then(function () {
                $scope.user.id = myUser.id;
                $scope.user.displayName = myUser.displayName;
                $scope.user.firstName = myUser.first_name;
                $scope.user.lastName = myUser.last_name;
                $scope.isLoggedIn = true;
            });
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
    };

    console.log("setting scope");
    window.scope = $scope;
};