angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider) {
	
	$routeProvider
		.when('/', {
			templateUrl: 'app/views/pages/home.html',
            controller: 'MainController',
            controllerAs: 'main'
		})
		.when('/login', {
			templateUrl: 'app/views/pages/login.html'
		})
		.when('/signup', {
			templateUrl: 'app/views/pages/signup.html'
		})
        .when('/allstories', {
            templateUrl: 'app/views/pages/allStories.html',
            controller: 'AllStoriesController',
            controllerAs: 'story',
            resolve: {
                stories: function(Story) {
                    return Story.allStories();
                } 
            }
        })
        .when('/details/:id', {
            templateUrl: 'app/views/pages/details.html',
            controller: 'StoryDetailsController',
            controllerAs: 'details',
            resolve: {
                currentStory: function(Story, $route) {
                    var id = $route.current.params.id;
                    return Story.getDetails(id);
                } 
            }
        })
	
	$locationProvider.html5Mode(true);
})