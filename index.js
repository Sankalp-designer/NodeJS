// import http from 'http';
// import type from './features.js';
// import fs from 'fs';


// const read = fs.readFileSync("./index.html");
// console.log(read);

// const server = http.createServer((req,res)=>{
//     if(req.url==="/about"){
//         res.end("<h1>About Page</h1>")
//     }
//     else if(req.url==="/"){
//         res.end(read)
//     }
//     else if(req.url==="/contact"){
//         res.end("<h1>Contact Page</h1>")
//     }
//     else{
//         res.end("<h1>Page not found</h1>")
//     }
// })

// server.listen(5000,()=>{
//     console.log("Server is working")
// })

import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import  jwt  from 'jsonwebtoken';
import bcrypt from "bcrypt";

mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
}).then(() => console.log("Database connected"))
    .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password:String,
});

const User = mongoose.model("User", userSchema);

const app = express();
// const users = [];

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// app.get("/",(req,res)=>{
//     // const pathlocation = path.resolve();
//     // res.sendFile(path.join(pathlocation, "./index.html"));
//     res.render("index", {name: "Dutt"});
// })

const isAuthenticated = async(req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        const decoded = jwt.verify(token, "sfsdjaoidjaso");
        req.user = await User.findById(decoded._id);
        next();
    } else {
        res.render("login");
    }
}

app.get("/", isAuthenticated, (req, res) => {
    res.render("logout", {name:req.user.name});

});

app.get("/register", (req, res) => {
    res.render("register");

});

app.get("/login", (req,res)=>{
    res.render("login");
})



// app.get("/add", async(req,res)=>{
//     await Message.create({name:"Sankalp2", email:"duttsankalp26@gmail.com"})
//         res.send("Nice");
// })

// app.post("/contact", async (req,res)=>{
//     await Message.create({name:req.body.name, email:req.body.email})
//     res.redirect("success");
// })

// app.get("/users", (req,res)=>{
//     res.json({
//         users,
//     });
// });

app.post("/login", async (req,res)=>{
    const {email , password} = req.body;
    let user = await User.findOne({email});
    if(!user){
        return res.redirect("/register");
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.render("login",{email,message:"Incorrect message"});
    }

    const token = jwt.sign({_id: user.id}, "sfsdjaoidjaso");
    
        res.cookie("token", token, {
            httpOnly: true, expires: new Date(Date.now() + 60 * 1000),
        });
        res.redirect("/");
})

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login")
    }

    const hashedPassword = await bcrypt.hash(password,10)

    user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    const token = jwt.sign({_id: user.id}, "sfsdjaoidjaso");
    
        res.cookie("token", token, {
            httpOnly: true, expires: new Date(Date.now() + 60 * 1000),
        });
        res.redirect("/");
    
})
    
app.get("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true, expires: new Date(Date.now()),
    });
    res.redirect("/");
})
app.listen(5000, () => {
    console.log("Server is working properly");
});