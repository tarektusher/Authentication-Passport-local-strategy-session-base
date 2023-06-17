const express = require("express");
const cors = require("cors");
const ejs = require("ejs");
const app = express();
require("./config/database");
require("dotenv").config();
require("./config/passport");
const User = require("./models/user.mode")
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');


app.set("view engine","ejs");
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
     mongoUrl : process.env.MONGO_URL,
     collectionName : "sessions",
  })
//   cookie: { secure: true }
}))



app.use(passport.initialize())
app.use(passport.session())

app.get("/",(req,res) =>{
     res.render("index");
})

// register : get

app.get("/register",(req,res) =>{
     res.render("register");
})

// register : post
app.post("/register",async (req,res) =>{
     try {
          const user=await User.findOne({username:req.body.username})
          if(user){
               res.status(400).send("user is exists")
          }
          bcrypt.genSalt(10, (err, salt)=>{
               bcrypt.hash("req.body.password", salt,async (err, hash)=> {
                   // Store hash in your password DB.
                   const newUser = new User({
                         username : req.body.username,
                         password : hash
                   });
                    await newUser.save();
                    res.status(201).redirect("/login");
               });
           });
          
     } catch (error) {
          res.status(500).send(error.message);
     }
})

const checkLoggedIn= (req,res,next) =>{
     if(req.isAuthenticated()){
          return res.redirect("/profile");
     }
     next();
}
// login : get

app.get("/login",checkLoggedIn,(req,res) =>{
     res.render("login");
})

// login : post
app.post('/login', 
  passport.authenticate('local', {
      failureRedirect: "/login",
      successRedirect:"/profile",
  })
);

// profile : protected
app.get("/profile",(req,res) =>{
     if(req.isAuthenticated()){
          res.render("profile");
     }
     res.redirect("/login");
})


// logout route
app.get("/logout",(req,res) =>{
     try {
          req.logOut((err) =>{
               if(err){
                    return next(err);
               }
               res.redirect("/");
          })
     } catch (error) {
          res.status(500).send(error.message);
     }
})
module.exports = app;