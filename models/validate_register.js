// const validator = require('validator');
// const mongoose = require('mongoose');
// const db=mongoose.connection;


// const isEmpty = require('./isEmpty');
    
 
// async function RegiterValid(){
//     const validateRegisterInput = data =>{

//         let errors = {}
    
//         data.username = !isEmpty(data.username) ? data.username : ''
//         data.email = !isEmpty(data.email) ? data.email : ' '
//         data.password = !isEmpty(data.password) ? data.password : ''
    
//         //username
    
//         if (!validator.isLength(data.username, {
//                 min: 2,
//                 max: 30
//             })) {
//             errors.username = 'Username should be between 2 and 30 characters'
//         }
    
//         if (validator.isEmpty(data.username)) {
//             errors.username = 'Username is required'
//         }
    
//         if (data.username != "" && !validator.isAlphanumeric(data.username)) {
//             errors.username = 'Username can only contain letters and numbers.'
//         }
    
        
//         let usernameExists =  db.collection('users').findOne({username: data.username})
//         console.log(usernameExists)
//         if(usernameExists){
//             errors.username = 'Username already exists.'
//         }
    
//         //email
    
//         if (!validator.isEmail(data.email)){
//             errors.email = 'You must provide a valid email address.'
//         }
    
//         let emailExists =  db.collection('users').findOne({email: data.email})
//         if(emailExists){
//             errors.email = 'email already exists.'
//         }
    
    
//         //password
    
//         if (validator.isEmpty(data.password)) {
//             errors.password = 'Password is required'
//         }
//         if (!validator.isLength(data.password, {
//                 min: 8,
//                 max: 30
//             })) {
//             errors.password = 'Password should be at least 8 characters'
//         }
//         return {
//             errors,
//             // isValid: isEmpty(errors)
//         }
    
//     }
// }



// module.exports = RegisterValid;