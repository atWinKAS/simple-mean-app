var User = require('../models/user');
var Story = require('../models/story');
var config = require('../../config');
var secretKey = config.secretKey;
var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {
	var token = jsonwebtoken.sign({
		id: user._id,
		name: user.name,
		username: user.username
	}, secretKey, {
		expiresInMinutes: 1440		
	});
	
	return token;
}

module.exports = function(app, express, io) {
	var api = express.Router();
	
    api.get('/all_stories', function(req, res) {
        Story.find({}, function(err, stories) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(stories);
        })
    });
    
    api.get('/details/:id', function(req, res) {
        var id = req.params.id;
        Story.findOne({ _id: id }, function(err, story) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(story);
        })
    });
    
	api.post('/signup', function(req, res) {
		var user = new User({
			name: req.body.name,
			username: req.body.username,
			password: req.body.password
		});
		
		var token = createToken(user);
		
		user.save(function(err) {
			if (err) {
				res.send(err);
				return;
			}
			
			res.json({ 
				message: 'User has been created',
				success: true,
				token: token 
				});
		}); 
	});
	
	api.get('/users', function(req, res) {
		User.find({}, function(err, users) {
			if (err) {
				res.send(err);
				return;
			}
			
			res.json(users);
		});
	});
	
	api.post('/login', function(req, res) {
		User.findOne({ username: req.body.username }).select('name username password').exec(function(err, user) {
			if (err){
				throw err;
			}
			if (!user) {
				res.send({ message: "User does not exist" });
			} else if (user) {
				var validPassword = user.comparePassword(req.body.password);
				
				if (!validPassword) {
					res.send({ message: 'Invalid password' });
				} else {
					var token = createToken(user);
					res.send({
						success: true,
						message: 'Successfully logged in',
						token: token
					});
				}
			}
		});
	});
	
	api.use(function(req, res, next){
		console.log("Somebody just came to our app");
		
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];
		
		// check if token exists
		if (token) {
			jsonwebtoken.verify(token, secretKey, function(err, decoded) {
				if (err) {
					res.status(403).send({ success: false, message: 'Failed to authenticate user' });
				} else {
					req.decoded = decoded;
					next();
				}
			});
		} else  {
			res.status(403).send({ success: false, message: 'No token provided' });
		}
	});
	
	// all actions with token
	
	// api.get('/', function(req, res) {
	// 	res.send({ message: 'Hello authenticated user' });
	// });
	
	api.route('/')
		.post(function(req, res) {
			var story = new Story({
				creator: req.decoded.id,
				content: req.body.content
			});
			story.save(function(err, newStory) {
				if (err) {
					res.send(err);
					return;
				}
				io.emit('story', newStory);
				res.json({ message: "New story has been created"});
			});
		})
		.get(function(req, res) {
			Story.find({ creator: req.decoded.id }, function(err, stories) {
				if (err) {
					res.send(err);
					return;
				}
				
				res.json(stories);
			});
		});
          
    api.delete('/delete/:id', function(req, res) {
        Story.remove({ _id: req.params.id }, function (err) {
                 if (err) 
                     return res.send(err);
                     
                 io.emit('deleted', req.params.id);    
                 res.json({ message: 'Deleted' });
             });
    });      
           
	api.get('/me', function(req, res) {
		res.json(req.decoded);
	});
	
	return api;
}