angular.module('storyCtrl', ['storyService'])
    .controller('StoryController', function(Story, socketio){
        
        var vm = this;
        
        Story.allStory()
            .success(function(data) {
                vm.stories = data;
            });
            
            
        vm.createStory = function() {
            
            vm.message = '';
            
            Story.create(vm.storyData)
                .success(function(data) {
                    // clear form
                    vm.storyData = '';
                    
                    vm.message = data.message;
                    
                     
                })
        }
        
        socketio.on('story', function(data) {
            vm.stories.push(data);
        });
        
        socketio.on('deleted', function(data) {
            if (vm.stories != null && vm.stories != undefined) {
                for(var i=0; i < vm.stories.length; i++) {
                    if (vm.stories[i]._id === data) {
                        vm.stories.splice(i, 1);
                        break;
                    }
                }
            }
        });
        
    })
    
    .controller('AllStoriesController', function(stories, socketio) {
        var vm = this;
        
        vm.stories = stories.data;
        
        socketio.on('story', function(data) {
            vm.stories.push(data);
        });
        
        socketio.on('deleted', function(data) {
            if (vm.stories != null && vm.stories != undefined) {
                for(var i=0; i < vm.stories.length; i++) {
                    if (vm.stories[i]._id === data) {
                        vm.stories.splice(i, 1);
                        break;
                    }
                }
            }
        });
    })
    
    .controller('StoryDetailsController', function(Story, currentStory, $location) {
        var vm = this;
        vm.story = currentStory.data;
        
        vm.deleteStory = function(){
            Story.delete(vm.story._id)
                .then(function(data){
                    $location.path('/');
                })
        }
    })