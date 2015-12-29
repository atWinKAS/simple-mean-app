angular.module('reverseDirective', [])
    .filter('reverse', function() {
        return function(items) {
            if (items !== undefined) {
                return items.slice().reverse();    
            }             
        }
    });