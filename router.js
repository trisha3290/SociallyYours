const express = require('express');
// const User = require('./models/sign');
const User = require('./models/User');
const {body} = require('express-validator');
const mongoose = require('mongoose');
const db=mongoose.connection;

const router = express.Router();
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');



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


router.post('/logout',userController.logout);
router.post('/create-post',  postController.create)



router.get('/', (req, res) => {
    res.redirect('/home-guest');
});

router.get('/home-guest', (req, res) =>{
    res.render('home-guest', { title: 'Home Page' });
});

router.get('/home-dashboard', (req, res) =>{
    res.render('home-dashboard', { title: 'Home Page' });
});

router.get('/post-create', (req, res) =>{
    res.render('create-post', { title: 'Create New Post' });
});


// 404 page
router.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});


module.exports = router;