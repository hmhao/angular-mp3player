var app = angular.module('admin.directives', []);

app.directive("toggleMinNav", ["$rootScope", function ($rootScope) {
    return {
        link: function (scope, ele) {
            var app = $("#app"),
                $window = $(window),
                $nav = $("#nav-container"),
                $content = $("#content"),
                initResize = function () {
                    var width = $window.width();
                    return 980 > width ? app.addClass("nav-min") : app.removeClass("nav-min");
                },
                updateClass = function () {
                    var width = $window.width();
                    return 980 > width ? (app.addClass("nav-min"), $rootScope.$broadcast("minNav:enabled")) : void 0;
                },
                t = void 0;

            ele.on("click", function (e) {
                if (app.hasClass("nav-min")) {
                    app.removeClass("nav-min");
                }else {
                    app.addClass("nav-min");
                    $rootScope.$broadcast("minNav:enabled");
                    e.preventDefault();
                }
            });
            $window.resize(function () {
                clearTimeout(t);
                t = setTimeout(updateClass, 300);
            });
            initResize();
        }
    };
}]);
app.directive("collapseNav", [function () {
    return {
        link: function (scope, ele) {
            var $lists = ele.find("ul").parent("li"),
                $listsRest = ele.children("li").not($lists),
                $a = $lists.children("a"),
                $aRest = $listsRest.children("a"),
                app = $("#app");
            $lists.append('<i class="fa fa-arrow-circle-o-right icon-has-ul"></i>');
            $a.on("click", function (event) {
                if(app.hasClass("nav-min")){
                    return false;
                }
                var $this = $(this),
                    $parent = $this.parent("li");
                $lists.not($parent).removeClass("open").find("ul").slideUp();
                $parent.toggleClass("open").find("ul").stop().slideToggle();
                event.preventDefault();
            });
            $aRest.on("click", function () {
                return $lists.removeClass("open").find("ul").slideUp();
            });
            scope.$on("minNav:enabled", function () {
                return $lists.removeClass("open").find("ul").slideUp();
            });
        }
    };
}]);
app.directive("highlightActive", [function () {
    return {
        controller: ["$scope", "$element", "$attrs", "$location", function ($scope, $element, $attrs, $location) {
            var links = $element.find("a"),
                path = function () {
                    return $location.path();
                },
                highlightActive = function (links, path) {
                    path = "#" + path;
                    angular.forEach(links, function (link) {
                        var $link = angular.element(link),
                            $li = $link.parent("li"),
                            href = $link.attr("href");
                        $li.hasClass("active") && $li.removeClass("active");
                        0 === path.indexOf(href) ? $li.addClass("active") : void 0;
                    });
                };

            highlightActive(links, $location.path());
            $scope.$watch(path, function (newVal, oldVal) {
                return newVal !== oldVal ? highlightActive(links, $location.path()) : void 0;
            });
        }]
    };
}]);
app.directive("toggleOffCanvas", [function () {
    return {
        link: function (scope, ele) {
            return ele.on("click", function () {
                return $("#app").toggleClass("on-canvas").toggleClass("nav-min");
            });
        }
    };
}]);
app.directive("slimScroll", [function () {
    return {
        link: function (scope, ele, attrs) {
            return ele.slimScroll({
                height: attrs.scrollHeight || "100%"
            });
        }
    };
}]);