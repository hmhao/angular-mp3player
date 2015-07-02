angular.module("ng-holding-menu.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("ng-holding-menu.html",
        "<div ng-show='isShow' ng-style=\"{top: position.top+'px', left: position.left+'px'}\" style=\"display: block;position: absolute;\">\n" +
        "   <div style=\"width: 0;height: 0;font-size:0; line-height:0;border-width: 0 10px 10px;border-style:solid dashed dashed;border-color: transparent transparent rgba(0,0,0,1);;margin-bottom: -3px;position: relative;\"></div>\n" +
        "   <div style=\"width: 0;height: 0;font-size:0; line-height:0;border-width: 0 10px 10px;border-style:solid dashed dashed;border-color: transparent transparent #FFF;position: absolute;top: 0px;\"></div>\n" +
        "   <ul class=\"dropdown-menu\" style=\"display: block;\" role=\"listbox\">\n" +
        "       <li ng-repeat=\"item in items track by $index\" ng-class=\"{active: item.active }\" ng-click=\"selectMatch($index)\" role=\"option\">\n" +
        "           <a href=\"javascript:void(0)\">{{ item.label }}</a>\n" +
        "       </li>\n" +
        "   </ul>\n" +
        "</div>\n" +
        "");
}]);

var app = angular.module('ng-holding', ['ng-holding-menu.html']);

app.service('ngHoldingService', ['$document', '$rootScope', '$compile', function($document, $rootScope, $compile) {
    var openScope = null,
        self = this;

    this.delayTime = 500;

    this.init = function( menuScope) {
        var menuId = 'holdingMenu-' + menuScope.$id + '-' + Math.floor(Math.random() * 10000);
        var ngHoldingMenu = angular.element('<div ng-holding-menu></div>');
        ngHoldingMenu.attr({
            id: menuId,
            items: 'items',
            show: 'isShow',
            position: 'position',
            select: 'select(activeIdx)'
        });

        //custom item template
        if (menuScope.templateUrl) {
            ngHoldingMenu.attr('template-url', menuScope.menuTemplateUrl);
        }

        menuScope.position = {
            top: 0,
            left: 0
        };

        menuScope.select = function (activeIdx) {
            var item = menuScope.items[activeIdx],
                fn = item.select;

            if(angular.isDefined(fn)){
                fn(item, menuScope.items, activeIdx);
            }
        };

        menuScope.$ngHoldingMenu = $compile(ngHoldingMenu)(menuScope);
    };

    this.open = function(menuScope){
        if ( openScope && openScope !== menuScope ) {
            closeHoldingMenu(null);
        }

        if ( !openScope ) {
            $document.bind('click', closeHoldingMenu);
        }

        openScope = menuScope;
        if(openScope.items.length > 0){
            menuScope.isShow = true;
            if(openScope.$ngHoldingMenu.parent().length === 0)
                $document.find('body').append(openScope.$ngHoldingMenu);
        }else{
            menuScope.isShow = false;
        }
    };

    this.close = function( menuScope ) {
        if ( openScope === menuScope ) {
            $document.unbind('click', closeHoldingMenu);
            openScope = null;
        }
    };

    this.onHoldingHandler = function(scope, locals) {
        var event = locals.$event,
            target = angular.element(event.target),
            height = target.height(),
            pos = target.position();
        scope.position.top = pos.top + height;
        scope.position.left = pos.left + event.offsetX;
        self.open(scope);
    };

    var closeHoldingMenu = function( evt ) {
        if (!openScope) { return; }

        if ( evt && openScope.$ngHoldingMenu[0].contains(evt.target) ) {
            return;
        }

        openScope.isShow = false;

        if (!$rootScope.$$phase) {
            openScope.$apply();
        }

        self.close(openScope);
    };
}]);

app.directive('ngHolding', ['$timeout', '$parse', 'ngHoldingService', function($timeout, $parse, ngHoldingService) {
    return {
        restrict: 'A',
        scope: {
            delayTime: '@?holdingDelay',
            menuItems:'=',
            menuTemplateUrl: '@'
        },
        link: function(scope, element, attrs) {
            var delayTime = scope.delayTime || ngHoldingService.delayTime,
                fn = attrs.ngHolding ? $parse(attrs.ngHolding) : null,
                ignoreClick = false,
                isHolding, timeoutId;

            var menuScope = scope.$new();
            menuScope.items = scope.menuItems || [];
            menuScope.templateUrl = scope.menuTemplateUrl;
            ngHoldingService.init(menuScope);

            element.on('mousedown', function($event) {
                isHolding = true;
                ignoreClick = false;
                timeoutId = $timeout(function() {
                    if( isHolding ) {
                        if(fn){
                            fn(scope.$parent, {$event: $event});
                        }
                        if(menuScope.items){
                            ngHoldingService.onHoldingHandler(menuScope, {$event: $event});
                        }
                        ignoreClick = true;
                    }
                }, delayTime);
            });

            element.on('mouseup', function(event) {
                isHolding = false;
                if(timeoutId) {
                    $timeout.cancel(timeoutId);
                    timeoutId = null;
                }
            });

            element.on('click', function(event) {
                if(ignoreClick)
                    event.stopImmediatePropagation();
            });
        }
    }
}]);

app.directive('ngHoldingMenu', [function() {
    return {
        restrict: 'EA',
        scope:{
            items:'=',
            isShow:'=show',
            position:'=',
            select: '&'
        },
        replace:true,
        templateUrl: function(element, attrs) {
            return attrs.templateUrl || 'ng-holding-menu.html';
        },
        link:function (scope, element, attrs) {
            scope.isShow = scope.items.length > 0;

            scope.selectMatch = function (activeIdx) {
                scope.select({activeIdx:activeIdx});
            };
        }
    }
}]);