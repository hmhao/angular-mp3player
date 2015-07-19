var app = angular.module('admin.comment', []);

app.controller('CommentCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.comments = [];

    $scope.comment = {
        cid: null,
        tid: null,
        content: ''
    };

    $scope.replyComment = function(comment, toID){
        $scope.comment.cid = comment && comment._id;
        $scope.comment.tid = toID;
        $scope.comment.content = '';
    };

    $scope.submitComment = function(){
        $http.post('/admin/comment', {comment:$scope.comment})
            .success(function(comment){
                $scope.replyComment(null, null);
                for(var i = 0, len = $scope.comments.length; i < len; i++){
                    if($scope.comments[i]._id === comment._id){
                        $scope.comments.splice(i,1,comment);
                        return;
                    }
                }
                $scope.comments.push(comment);
            })
            .error(function(err){
            })
    };

    $http.get('/admin/comment')
        .success(function (comments) {
            $scope.comments = comments;
        });
}]);