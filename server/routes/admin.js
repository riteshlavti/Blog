const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const jwtSecret = process.env.JWT_SECRET;
const adminLayout = '../views/layouts/admin';


//check login

const authMiddleware = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message: 'unauthorized'});

    }
    try{
        const decoded = jwt.verify(token,jwtSecret);
        req.userId=decoded.userId;
        next();
    }catch(error){
        res.status(401).json({message: 'unauthorized'});
    }
}

// admin -get

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
});

// Post /admin - check login

router.post('/admin', async(req,res)=>{
    try{
        const{username,password} = req.body;
        const user = await User.findOne({username});
        if(!user){
            
            return res.status(401).json({message: 'Invalid credentials'});

        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json( { message: 'Invalid credentials' } );
        }
        const token =jwt.sign({userId: user._id},jwtSecret);
        res.cookie('token', token, {httpOnly: true});
        res.redirect('/dashboard');

        
    }
    catch(error){
        console.log(error);
    }
});




router.get ('/dashboard',authMiddleware, async (req,res)=>{
    try{
        const data=await Post.find();
        const locals={
            title: 'Dashboard',
            description: 'Simple blog.'
        }
        res.render('admin/dashboard', {locals,data, layout: adminLayout});

    }catch(error){
        console.log(error);
    }
});
// router.post('/admin', async(req,res)=>{
//     try{
//         const{username,password} = req.body;
//         console.log(req.body);
//         if(req.body.username === 'admin' && req.body.password==='password'){
//             res.send('You are logged in.')
//         }
//         else {
//             res.send('Wrong username and password');
//         }

//         //res.redirect('/admin');
//     }
//     catch(error){
//         console.log(error);
//     }
// });

// Post /admin - register
// sign-up page

router.get('/signup',async(req,res)=>{
    try{
        const locals = {
            title:"SignUp",
            description: "Simple personal blog app."
        }
        res.render('admin/signup',{locals,layout:adminLayout});

    }
    catch(error){
        console.log(error);
    }
});
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
             else res.status(500).json({message : 'Internal server error'});
        }
    }
    catch(error){
        console.log(error);
    }
});

//get - addpost page

router.get('/add-post', authMiddleware, async(req,res)=>{
    try{
        const locals = {
            title:"Add Post",
            description: "Simple personal blog app."
        }
        const data=await Post.find();
        res.render('admin/add-post',{
            locals,
            layout:adminLayout
        });

    }
    catch(error){
        console.log(error);
    }
});

//add new post to database.

router.post('/add-post', authMiddleware, async(req,res)=>{
    try{
        try{
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        }
        catch(error){
            console.log(error);
        }
    }
    catch(error){
        console.log(error);
    }
});

// Put 
//edit post
router.get('/edit-post/:id', authMiddleware, async(req,res)=>{
    try{
        const locals ={
            title: "Edit-Post",
            description: "NodeJs user management system"
        };
        const data = await Post.findOne({_id:req.params.id});
        res.render('admin/edit-post',{
            locals,
            data,
            layout: adminLayout
        });
    }
    catch(error){
        console.log(error);
    }
});

router.put('/edit-post/:id', authMiddleware, async(req,res)=>{
    try{
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updateAt: Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
    }
    catch(error){
        console.log(error);
    }
});

//Delete post/admin

router.delete('/delete-post/:id', authMiddleware, async(req,res)=>{
    try{
        await Post.deleteOne({_id:req.params.id});
        res.redirect('/dashboard');
    }
    catch(error){
        console.log(error);
    }
});

//logout-get

router.get('/logout',(req,res)=>{
    res.clearCookie('token');
    // res.json({message: 'Logged out Successfully.'});
    res.redirect('/admin');
});





module.exports= router;