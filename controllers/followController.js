const mongoose = require('mongoose');
const Follow = require('../models/Follow');
const User = require('../models/User');
const validator = require('validator');
const ObjectId = require('mongodb').ObjectId
const db=mongoose.connection;


exports.addFollow = async(req, res) =>{
    let usern =  await db.collection('users').findOne({username: req.params.username})
    let usern1 =  await db.collection('users').findOne({username: req.session.user.username})
    async function FollowValid(){
    
        let errors = {}
    
        if(req.params.username === req.session.username){
            errors.follow = 'You cannot follow youself!'
            req.flash('errors', errors.follow)
        }
    
        if(!usern){
            errors.follow = 'This user does not exist'
            req.flash('errors', errors.follow)
        }

        let chkfollow = await db.collection('follows').findOne({followedId: usern._id, authorId: usern1._id})
        if(chkfollow){
            errors.follow = `You are already following ${usern.username}`
            req.flash('errors', errors.follow)
        }
        
        
        return  errors
    
    
    }

    let erry = await FollowValid();
    console.log(erry);




    if (!(Object.keys(erry).length === 0)) {
        
        // res.status(400).json(errors);
        return res.redirect('home-dashboard') ;
    }

    
    
    let follow = new Follow({
        followedId : new ObjectId((usern._id)),
        authorId : new ObjectId((req.session.user._id)),
        following_user: req.params.username,
        author_username: req.session.user.username,
        author_avatar: req.session.user.avatar
    })

    try{
        db.collection('follows').insertOne(follow,function(err, collection){
            if (err) throw err;
            console.log("Record inserted Successfully");
            req.flash('success', `You started following ${usern.username}`)
            
            req.session.save(()=> res.redirect(`/profile/${req.params.username}`))
                  
        });
    }
    catch(error){
        const status =  error.statusCode || 500;
        res.status(status).json({error : error.data})
        req.flash('errors', error)
        req.session.save(() => res.redirect('home-dashboard'))
    }
}


exports.removeFollow = async(req,res) =>{
    let chkfollowing = await db.collection('follows').findOne({following_user: req.params.username})
    if(!chkfollowing){
        req.flash('errors', "You cannot unfollow someone you don't follow")
        return req.session.save(()=> res.redirect("/home-dashboard"))
    }
    Post.findByIdAndDelete(chkfollowing._id)
    .then(result => {
        console.log(result);
        req.flash("success", `Successfully stopped following ${req.params.username}`)
        req.session.save(()=> res.redirect(`/profile/${req.params.username}`))
        
    })
    .catch(err => {
        console.log(err);
        req.flash("errors", err)
        req.session.save(() => res.redirect("/home-dashboard"))
      
    });
}