import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';//This is a middleware
import jwt from 'jsonwebtoken';

// moongoose steps
// import mongoose
// use mongoose.connect method to connect to the Database params url(string), {dbName:}can use .then method to estblished the connection
// then create Schema
// then create model
// do the operation like create and find
mongoose.connect('mongodb+srv://durgadasdhoke:7L3r3pFZoWQQM6Ma@cluster0.odc8qqo.mongodb.net/',{
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
// We can call below syntax an api or route depending on what it is doing in the code 
// 1st if it is just rendering a page then its just a route
// 2nd if it is sender data (pure data) then its API
app.get('/',isAuthenticated,async (req,res)=>{
    console.log(req.user);
    res.render('Homelogout',{username:req.user.username});
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
        res.render('login');
    }
});

app.post('/register',async(req,res)=>{
    // This will create New user in the Database called Backend In this case
    const {username, password} = req.body;
    await user.create({username, password});
    res.render('login');
});

app.get('/login',async(req,res)=>{
    const { token } = req.cookies;
    if(token)
    {
        const decoded = jwt.verify(token, "sdfsdgagdfhvrr");
        req.user = await user.findById(decoded._id);  
        res.render('Homelogout',{username:req.user.username});
    }else{
        res.render('login');
    }
});

app.get('/logout',(req,res)=>{
    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });
    res.render('login');
});

app.post('/login',async(req,res)=>{
    const {username, password} = req.body;
     const userData = await user.findOne({username});
     if(!userData)
     {
        res.render('login',{message:"Please Check Username or Kindly Register yourself "});
     } 
     else{
        if(userData.password === password)
        {
            const token = jwt.sign({_id:userData._id},"sdfsdgagdfhvrr");
            res.cookie("token",token);
            res.render('Homelogout',{username: username});
        }else{
          res.render('login',{message:"Wrong Password"});   
        }
    }
});

app.listen(2000);