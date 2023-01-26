const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Follow = require('../models/Follow');
const validateRegisterInput = require('../models/validate_register');
const validator = require('validator');
const db=mongoose.connection;
const md5 = require('md5');
const ObjectId = require('mongodb').ObjectId



exports.register = async(req, res) => {
    let body = req.body

    async function RegiterValid(data){
    
            let errors = {}
        
            data.username = data.username || ' '
            data.email = data.email || ' '
            data.password= data.password|| ' '
        
            //username
        
            if (!validator.isLength(data.username, {
                    min: 2,
                    max: 30
                })) {
                errors.username = 'Username should be between 2 and 30 characters'
                req.flash('errors', errors.username)
            }
        
            if (validator.isEmpty(data.username)) {
                errors.username = 'Username is required'
                req.flash('errors', errors.username)
            }
        
            if (data.username != "" && !validator.isAlphanumeric(data.username)) {
                errors.username = 'Username can only contain letters and numbers.'
                req.flash('errors', errors.username)
            }
        
            
            let usernameExists = await  db.collection('users').findOne({username: data.username})
            console.log(usernameExists)
            if(usernameExists){
                errors.username = 'Username already exists.'
                req.flash('errors', errors.username)
            }
        
            //email
        
            if (!validator.isEmail(data.email)){
                errors.email = 'You must provide a valid email address.'
                req.flash('errors', errors.email)
            }
        
            let emailExists = await db.collection('users').findOne({email: data.email})
            if(emailExists){
                errors.email = 'email already exists.'
                req.flash('errors', errors.email)
            }
        
        
            //password
        
            if (validator.isEmpty(data.password)) {
                errors.password = 'Password is required'
                req.flash('errors', errors.password)
            }
            if (!validator.isLength(data.password, {
                    min: 8,
                    max: 30
                })) {
                errors.password = 'Password should be at least 8 characters'
                req.flash('errors', errors.password)
            }
            
            return  errors
        
        
    }
    
    let erry = await RegiterValid(req.body);
    console.log(erry);


    

    if (!(Object.keys(erry).length === 0)) {
        
        // res.status(400).json(errors);
        return res.redirect('home-guest') ;
    }

    
    
    
    try{
        

        let salt = bcrypt.genSaltSync(10)
        const hashedemail = md5(body.email)
        let hashedPW = body.password
        hashedPW = hashedPW.toString();
        hashedPW = bcrypt.hashSync(body.password, salt)
        
        // body.password = body.password .toString();
        let user = new User({
            username: body.username,
            email: body.email,
            password: hashedPW,
            avatar: `https://www.gravatar.com/avatar/${hashedemail}`,

            // password:body.password,
        })
        db.collection('users').insertOne(user,function(err, collection){
            if (err) throw err;
            req.session.user = {avatar: user.avatar, username: user.username, _id: user._id};
            console.log("Record inserted Successfully");
            req.flash('success', "Record inserted Successfully")
            
            req.session.save(function(){
                res.redirect('home-dashboard')
            })
                  
        });
        
        

        // return res.redirect('home-dashboard') ;
        
        
    }
    catch(error){
        const status =  error.statusCode || 500;
        res.status(status).json({error : error.data})
        req.flash('errors', error)
        return res.redirect('home-guest')
    }
}





exports.login = async (req, res) =>{

    let body = req.body;
    // async function LogValid(data){
    
    //     let errors = {}
    
    //     data.username = data.username || ' '
    //     data.password= data.password|| ' '
    
    //     //username
    
    //     if (!validator.isLength(data.username, {
    //             min: 2,
    //             max: 30
    //         })) {
    //         errors.username = 'Username should be between 2 and 30 characters'
    //     }
    
    //     if (validator.isEmpty(data.username)) {
    //         errors.username = 'Username is required'
    //     }
    
    //     if (data.username != "" && !validator.isAlphanumeric(data.username)) {
    //         errors.username = 'Username can only contain letters and numbers.'
    //     }
    
    
    
    //     //password
    
    //     if (validator.isEmpty(data.password)) {
    //         errors.password = 'Password is required'
    //     }
    //     if (!validator.isLength(data.password, {
    //             min: 8,
    //             max: 30
    //         })) {
    //         errors.password = 'Password should be at least 8 characters'
    //     }
    //     return  errors
    
    
    // }
    
    
    //     let errylog = await LogValid(req.body);
    //     console.log(errylog);
    
        
    
    //     if (!(Object.keys(errylog).length === 0)) {
    //         // res.status(400).json(errors);
    //         return res.redirect('home-guest') ;
    //     }
    
    
    let user =  await db.collection('users').findOne({username: req.body.username})
    console.log(user);
    try{
        if (user) {
            // check user password with hashed password stored in the database
            let validPassword = await bcrypt.compare(body.password, user.password);
            if (validPassword) {
                
            //   res.status(200).json({ message: "User logged in!" });
                req.session.user = {avatar: user.avatar, username: user.username, _id: user._id};   
                req.flash('success', "User logged in!")
                
                // console.log(user);
                req.session.save(function(){
                    console.log("User logged in");
                    return res.redirect('home-dashboard')
                })
            } else {
            //   res.status(400).json({ error: "Invalid Password" });
            req.flash('errors', "Invalid Password")
              return res.redirect('home-guest');
            }
        } else {
            // res.status(401).json({ error: "User does not exist" });
            req.flash('errors', "Invalid Password")
            return res.redirect('home-guest');
        }
        // const err = validationResult(req);
        // if(!err.isEmpty()){
        //     const er = new Error('Validation Failed')
        //     er.statusCode = 422
        //     er.data = err.array();
        //     throw er
        // }

    }
    catch(error){
        console.log(error);
        const status =  error.statusCode || 500;
        req.flash('errors', error)
        return res.redirect('/')
    }
}

exports.logout = function(req,res){
    req.flash('errors', "Logged out!!")
    req.session.destroy(function(){
        return res.redirect('home-guest');
        
    })
    // return res.redirect('home-guest');
}

exports.mustBeLoggedIn = function(req, res, next){
    if(req.session.user){
        next()
    }else{
        req.flash("errors","Login required")
        req.session.save(function(){
            res.redirect('/')
        })
    }
}

exports.ifUserExists = async function(req,res, next){
    let username =  await db.collection('users').findOne({username: req.params.username})
    if(username){
        req.profileUser = username
        next();
    }
    else{
        res.render('400');
    }
}

exports.sharedProfileData = async function(req,res,next){
    let isVisitorsProfile = false;
    let isFollowing = false;
    if(req.session.user){
        isVisitorsProfile = req.profileUser._id.equals(req.session.user._id)
        let followtrue = await db.collection('follows').findOne({followedId : new ObjectId(req.profileUser._id), authorId : new ObjectId(req.session.user._id), following_user : req.profileUser.username})
        // let followtp = await db.collection('follows').findOne({following_user : req.profileUser.username})
        // console.log(new ObjectId(req.session.user._id));
        // console.log(followtrue.authorId.toString());
        if(followtrue){
            isFollowing = true;
            
        }
        
    }

    req.isVisitorsProfile = isVisitorsProfile
    req.isFollowing = isFollowing
    console.log(req.isFollowing);
    let postCount = await db.collection('posts').countDocuments({author : req.profileUser.username})
    let followerCount = await db.collection('follows').countDocuments({ followedId: (req.profileUser._id)})
    let followingCount = await db.collection('follows').countDocuments({authorId : (req.profileUser._id)})
    // console.log(`followers count : ${followerCount}`);
    // console.log(`following count : ${followingCount}`);
    req.postCount = postCount
    req.followerCount = followerCount
    req.followingCount = followingCount


    next();
}



exports.profilePostsScreen = function(req, res){
    const user = req.session.user
    Post.find().sort({ createdAt: -1 })
    .then(posts => {
        res.render('profile', {
            user : user,
            title : "Profile Page",
            currentPage: "posts",
            posts: posts,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount} 
        });
    })
    .catch(err => { 
      console.log(err),
      res.render('404');
    });

}

exports.profileFollowersScreen = async function(req, res){
    
    const author = (req.profileUser._id);
    const followedId1 = [];
    const author1 = author.toString();
    const avatar1 = [];
    const username1 = [];

    Follow.find().sort({createdAt: -1})
    .then(followers =>{
        followers.forEach(follower =>{ console.log(follower.authorId), followedId1.push(follower.followedId.toString()),avatar1.push(follower.author_avatar.toString()), username1.push(follower.author_username.toString())})
        console.log(author1);
        res.render('profile-followers', {
            author : author,
            title : "Followers",
            currentPage: "followers",
            followers: followers,
            followedId1: followedId1,
            author1 : author1,
            avatar1: avatar1,
            username1 : username1,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
        });
    })
    .catch(err => { 
        console.log(err),
        res.render('404');
    });
}

exports.profileFollowingScreen = async function(req, res){

    const followed = (req.profileUser._id).toString();
    const followedId2 = [];
    const author2 = followed.toString();
    const username2 = [];
    
    Follow.find().sort({createdAt: -1})
    // .then(following =>{
    //     following.forEach(follow =>{
    //         follow.followedId = follow.followedId.toString()
    //         follow.authorId = follow.authorId.toString()
    //     })
    // })
    .then(following =>{
        following.forEach(follow =>{
            followedId2.push(follow.authorId.toString())
            username2.push(follow.following_user.toString())

            
        })
        res.render('profile-following', {
            followed : followed,
            title : "Following",
            currentPage: "following",
            following: following,
            followedId2: followedId2,
            author2 : author2,
            username2 : username2,
            profileUsername: req.profileUser.username,
            profileAvatar: req.profileUser.avatar,
            isFollowing: req.isFollowing,
            isVisitorsProfile: req.isVisitorsProfile,
            counts: {postCount: req.postCount, followerCount: req.followerCount, followingCount: req.followingCount}
        });
    })
    .catch(err => { 
        console.log(err),
        res.render('404');
    });
}

