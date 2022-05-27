const express = require('express');
const User = require('./models/User');
const {body} = require('express-validator');
const mongoose = require('mongoose');
const db=mongoose.connection;
const Post = require('./models/Post');
const Follow = require('./models/Follow');
const ObjectID = require('mongodb').ObjectID

const router = express.Router();
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');
const followController = require('./controllers/followController');




// router.post('/register', function(req,res){
//     var username = req.body.username;
//     var email =req.body.email;
//     var pass = req.body.password;
  
//     var data = {
//         "username": username,
//         "email":email,
//         "password":pass,
//     }
// db.collection('users').insertOne(data,function(err, collection){
//         if (err) throw err;
//         console.log("Record inserted Successfully");
              
//     });
          
//     return res.redirect('home-dashboard');
// })

router.post('/register',[
    // body("username")
    // .custom(value => {
    //     return User.findOne({username: value
    //     }).then(username => {
    //         if (username.length > 0) {
    //             throw ("Username is taken!"); 
    //         }
    //     });
    //     return true;
    // }),

    // body("email")
    //     .isEmail()
    //     .normalizeEmail()
    //     .custom( value => {
    //             return User.findOne({email: value
    //             }).then(user => {
    //                 if (user.length > 0) {
    //                     return Promise.reject('Email address already taken')
    //                 }
    //             })
    //             return true;
    //         }
    //     ),

    // body("password").isStrongPassword({
    //     minLength: 8,
    //     minLowercase: 1,
    //     minUppercase: 1,
    //     minNumbers: 1
    // })
    // .withMessage("Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number"),
    
], userController.register);

router.post('/signin',[
    // body('username').custom(value =>{
    //     return User.findOne({username: value}).then(foundUser =>{
    //         if(!foundUser){
    //             return Promise.reject('User not found. Please enter a valid username')
    //         }
    //     })
    // }),

    // body('password')
    // .notEmpty()
    // .withMessage("Password field cannot be empty")
    // .custom(async (value, {req}) =>{
    //     const user = await User.findOne({username: req.body.username})
    //     const PW = await bcrypt.compare(value, user.password)
    //     if(!PW){
    //         return Promise.reject('Incorrect Password')
    //     }
    // })
],userController.login);

router.post('/search', postController.search);
router.post('/logout',userController.logout);
router.post('/create-post', userController.mustBeLoggedIn,  postController.create);
router.get('/post/:id', postController.singlePost);
router.post('/post/:id/delete',userController.mustBeLoggedIn, postController.delete);
router.post('/post/:id/edit',userController.mustBeLoggedIn, postController.edit);
router.post('/addFollow/:username', userController.mustBeLoggedIn, followController.addFollow)
router.post('/removeFollow/:username', userController.mustBeLoggedIn, followController.removeFollow)


router.get('/profile/:username', userController.ifUserExists, userController.sharedProfileData, userController.profilePostsScreen)
router.get('/profile/:username/followers', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowersScreen)
router.get('/profile/:username/following', userController.ifUserExists, userController.sharedProfileData, userController.profileFollowingScreen)
// router.get('/home-dashboard', postController.homepage)



router.get('/', (req, res) => {
  if(req.session.user){
    res.redirect('/home-dashboard');
  }
  else{
    res.redirect('/home-guest');
  }
    
});

router.get('/home-guest', (req, res) =>{
    res.render('home-guest', { title: 'Home Page' });
});




router.get('/home-dashboard', (req, res) =>{
    
    // const following = [];
    // let state = false;
    // const followpair = new Map();
    
    // Follow.find()
    // .then(following =>{
    //   followpair.clear()
    //   state = true;
    //   following.forEach(follow =>{
    //     followpair.set(follow.following_user, follow.author_username)
    //   })
    // })
    // .catch(err => { 
    //   console.log(err);
    // });

    const user = req.session.user
    Post.find().sort({ createdAt: -1 })
      .then(posts => {

        let followedUsers =[];
        Follow.find({author_username: user.username}, function(err,docs){
          if (err){
            console.log(err);
          }
          else{

              followedUsers = docs
              
              followedUsers = followedUsers.map(function(followDoc){
                return followDoc.following_user.toString()
              })
              console.log(followedUsers)
              res.render('home-dashboard', { posts: posts, title: 'Home Page', followedUsers: followedUsers, user: user });
          }
        })
        
      })
      .catch(err => { 
        console.log(err);
      });
    
    
    
});

// router.get('/profile/:username',userController.mustBeLoggedIn, (req, res) =>{
//     // const user = req.params.username;
//     // if(user !== req.session.user.username){
//     //     req.flash('errors', "Invalid request")
//     //     return req.session.save(()=> res.redirect("/home-dashboard"))
//     // }
//     const user = req.params.username
//     Post.find().sort({ createdAt: -1 })
//     .then(posts => {
//       res.render('profile', { user: user, posts: posts, title: "Profile Page" });
//     })
//     .catch(err => { 
//       console.log(err);
//     });
// });

router.get('/post-create', (req, res) =>{
    res.render('create-post', { title: 'Create New Post' });
});

router.get('/post/:id/editpage',userController.mustBeLoggedIn, postController.editpage);



// 404 page
router.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});


module.exports = router;