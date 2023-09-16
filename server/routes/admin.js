const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const adminLayout = '../views/layouts/admin';

router.get('/admin',async(req,res)=>{
    try{
        const locals = {
            title:"Admin",
            description: "Simple personal blog app."
        }
        res.render('admin/index',{locals,layout:adminLayout});

    }
    catch(error){
        console.log(error);
    }
})



// Post /admin - check login

router.post('/admin', async(req,res)=>{
    try{
        const{username,password} = req.body;
        console.log(req.body);
        if(req.body.username === 'admin' && req.body.password==='password'){
            res.send('You are logged in.')
        }
        else {
            res.send('Wrong username and password');
        }

        //res.redirect('/admin');
    }
    catch(error){
        console.log(error);
    }
});

// Post /admin - register

router.post('/register', async(req,res)=>{
    try{
        const{username,password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        try{
            
            const user = await User.create({username, password: hashedPassword});
            res.status(201).json({message: 'User Created', user});
        }
        catch(error){
            if(error.code === 11000){
                res.status(409).json({message: 'User already in use'});
            }
            res.status(500).json({message : 'Internal server error'});
        }
    }
    catch(error){
        console.log(error);
    }
});

module.exports= router;