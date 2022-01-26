const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const validator = require('validator');
const ObjectId = require('mongodb').ObjectId
const db=mongoose.connection;

exports.create = async(req, res) =>{
    

    async function PostValid(data){
        let errors = {}

        data.title = data.title || ' '
        data.body = data.body || ' '

        if (validator.isEmpty(data.title)) {
            errors.title = 'Title cannot be empty'
            req.flash('errors', errors.title)
        }

        if (validator.isEmpty(data.body)) {
            errors.body = 'Body cannot be empty'
            req.flash('errors', errors.body)
        }

        return errors;
    }

    let erry = await PostValid(req.body);
    console.log(erry);


    

    if (!(Object.keys(erry).length === 0)) {
        
        // res.status(400).json(errors);
        return res.redirect('home-dashboard') ;
    }


    try{
        let usern =  await db.collection('users').findOne({_id: ObjectId(req.session.user._id)})
        const post = new Post({
            title : req.body.title,
            body : req.body.body,
            author: usern.username,
            avatar: usern.avatar,
            createdDate: new Date(),
        })

        

        db.collection('posts').insertOne(post,function(err, collection){
            if (err) throw err;
            console.log("Post Created Successfully");
            req.flash('success', "Post Created Successfully")
            req.session.save(()=> res.redirect("/home-dashboard"))
            // req.session.user = {username: body.username, _id: body._id};
            // req.session.save(function(){
            //     res.redirect('home-dashboard')
            // })
                             
        });
        
        

        // return res.redirect('home-dashboard') ;
        
        
    }
    catch(error){
        const status =  error.statusCode || 500;
        res.status(status).json({error : error.data})
        return res.redirect('home-guest')
    }
}

exports.singlePost = async(req, res) =>{
    const id = req.params.id;
    console.log(id);
    // if(typeof(id) != "string" || !ObjectId.isValid(id)){
    //     req.flash('errors', "Post does not exist")
    //     req.session.save(()=> res.redirect("/home-dashboard"))
        
    // }
    Post.findById(id)
    .then(result => {
        if(!result){
            req.flash('errors', "Post does not exist")
            return req.session.save(()=> res.redirect("/home-dashboardsds"))
        }
      res.render('single-post-screen', { post: result, title: 'Post Details' });
    })
    .catch(err => {
        req.flash('errors', "Post does not exist")
        req.session.save(()=> res.redirect("/home-dashboard"))
      console.log(err);
    });
}

exports.delete = async(req,res) => {
    const id = req.params.id;
    console.log('saarisha');
    Post.findByIdAndDelete(id)
    .then(result => {
        console.log(result);
        req.flash("success", "Post successfully deleted.")
        req.session.save(()=> res.redirect("/home-dashboard"))
        
    })
    .catch(err => {
        console.log(err);
        req.flash("errors", "You do not have permission.")
        req.session.save(() => res.redirect("/"))
      
    });
}

exports.editpage = async(req,res) =>{
    const ide = req.params.id;
    console.log(req.session.user.username);

    Post.findById(ide)
    .then(result => {
        console.log(result.author);
        if(result.author !== req.session.user.username){
            req.flash('errors', "You don't have access to edit the post!")
            return req.session.save(()=> res.redirect("/home-dashboard"))
        }
        if(!result){

            req.flash('errors', "Post does not exist")
            return req.session.save(()=> res.redirect("/home-dashboardsds"))
        }
      res.render('edit-post', { post: result, title: 'Edit Post' });
    })
    .catch(err => {
        req.flash('errors', "Post does not exist")
        req.session.save(()=> res.redirect("/home-dashboard"))
      console.log(err);
    });
}


exports.edit = async(req,res) => {
    const idm = req.params.id;
    Post.findByIdAndUpdate(idm, req.body)
    .then(updated => {
        console.log(updated);
        if(!updated){
            req.flash('errors', "Post does not exist")
            return req.session.save(()=> res.redirect("/home-dashboard"))
        }
        req.flash('success', "Post successfully edited.");
        return req.session.save(()=>res.render('single-post-screen', { post: updated, title: 'Post Details' }));
    })
    .catch(err => {
        req.flash('errors', "Post does not exist")
        req.session.save(()=> res.redirect("/home-dashboard"))
      console.log(err);
    });
}


exports.search = async (req,res) =>{
    const posts = await  Post.find({
        "$text" :{
            "$search" : req.body.search
        }
    },{
        score : {
            $meta : "textScore"
        },
        title : 1,
        body : 1,
        author : 1,
        avatar : 1,
        createdDate: 1,
    })
    .sort({
        score :{
            $meta : "textScore"
        }
    })
    const users = await User.find({
        "$text" :{
            "$search" : req.body.search
        }
    },{
        score : {
            $meta : "textScore"
        },
        email : 1,
        username : 1,
        avatar : 1,
    })
    .sort({
        score :{
            $meta : "textScore"
        }
    })
    // .then(posts => {
    //     res.render('search-results', { posts: posts, title: "Search Page" });
    // })
    // .catch(err => { 
    //     console.log(err);
    // });

    res.render('search-results', { posts: posts, users:users,  title: "Search Page" });
    
}