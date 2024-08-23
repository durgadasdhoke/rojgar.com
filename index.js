import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';//This is a middleware
import jwt from 'jsonwebtoken';
import path from 'path';

mongoose.connect('mongodb+srv://durgadasdhoke:jh-w3quhZmkRN.3@cluster0.odc8qqo.mongodb.net/',{
  dbName:"worker"
}).then(()=>{
    console.log('Connection Established');
}).catch((e)=>{
    console.log(e);
});

const userSchema = new mongoose.Schema({
    username:String,
    password:String
});

const user = mongoose.model("user",userSchema);

const app  = express();

// default Engine 
app.set("view engine","ejs");

// Middleware Added
app.use(express.urlencoded({ extended:true }));
app.set("views", path.join(path.resolve(), "views"));
app.set('views','./views');
app.use(cookieParser());
// authentication function
const isAuthenticated = async(req,res,next)=>{
    const { token } = req.cookies;
    if(token)
    {
        const decoded = jwt.verify(token, "sdfsdgagdfhvrr");
        req.user = await user.findById(decoded._id);  
        next();
    }else{
        res.render('Home');
    }
} ;

app.get('/',isAuthenticated,async (req,res)=>{
    console.log(req.user);
    res.render('Home',{username:req.user.username});
} );

app.get('/register',(req,res)=>{
    res.render('Register');
});

app.get('/profile',async(req,res)=>{
    const { token } = req.cookies;
    if(token)
    {
        const decoded = jwt.verify(token, "sdfsdgagdfhvrr");
        req.user = await user.findById(decoded._id);  
        res.render('profile');

    }else{
        res.render('Login');
    }
});

app.post('/register',async(req,res)=>{
    // This will create New user in the Database called Backend In this case
    const {username, password} = req.body;
    await user.create({username, password});
    res.render('Login');
});

app.get('/login',async(req,res)=>{
    const { token } = req.cookies;
    if(token)
    {
        const decoded = jwt.verify(token, "sdfsdgagdfhvrr");
        req.user = await user.findById(decoded._id);  
        res.render('Homelogout',{username:req.user.username});
    }else{
        res.render('Login');
    }
});

app.get('/logout',(req,res)=>{
    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });
    res.render('Login');
});

app.post('/login',async(req,res)=>{
    const {username, password} = req.body;
     const userData = await user.findOne({username});
     if(!userData)
     {
        res.render('Login',{message:"Please Check Username or Kindly Register yourself "});
     } 
     else{
        if(userData.password === password)
        {
            const token = jwt.sign({_id:userData._id},"sdfsdgagdfhvrr");
            res.cookie("token",token);
            res.render('Homelogout',{username: username});
        }else{
          res.render('Login',{message:"Wrong Password"});   
        }
    }
});

app.listen(2000);
