const mongoose = require('mongoose');
const Post = require('../models/Post');
const validator = require('validator');
const ObjectID = require('mongodb').ObjectID
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
        const post = new Post({
            title : req.body.title,
            body : req.body.title,
            author: ObjectID(req.session.user._id)
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