const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

mongoose.connect("mongodb://127.0.0.1:27017")
.then(()=>console.log("Database connected"))
.catch((e)=>console.log(e))

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const User = mongoose.model("User_testing" , userSchema)



app.set("viewport","ejs")
app.use(cookieParser())
app.use(express.urlencoded({extended:true}))

app.get("/",async (req,res)=>{
    const {token}= req.cookies;
    if(token){

        const decoded= jwt.verify(token,"shdfkjsah")

        req.user = await User.findById(decoded._id)

        res.render("logout.ejs",{name: req.user.name})

        }
    else{
        res.render("login.ejs")
    }
})

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly: true, expires: new Date(Date.now()),
    })
    res.redirect("/")
})

app.get("/login",(req,res)=>{
    res.render("login.ejs")
})

app.get("/register",(req,res)=>{
    res.render("register.ejs")
})

app.post("/login",async(req,res)=>{
    const {email, password} = req.body;

    let user = await User.findOne({email});

    if(!user) return res.redirect("/register")

    let match = await bcrypt.compare(password, user.password)
    if(!match) return res.render("login.ejs", {email, message:"Incorrect Password"})

    const token= jwt.sign({_id: user._id},"shdfkjsah")

    res.cookie("token",token,{
        httpOnly:true,expires: new Date(Date.now()+60*1000)
    })
    res.redirect("/")
})

app.post("/register",async (req,res)=>{
    console.log(req.body)
    const {name, email, password} = req.body

    let user = await User.findOne({email})
    if(user){
        return res.redirect("/login")
    }

    const hashedPassword = await bcrypt.hash(password,10)

    user = await User.create({
        name,
        email,
        password: hashedPassword,
    })

    const token = jwt.sign({_id: user._id},"shdfkjsah");

    res.cookie("token",token,{
        httpOnly:true, expires: new Date(Date.now()+60*1000)
    })
    res.redirect("/")
})

   

app.listen(2000,()=>{
    console.log("Server connected at the port 2000")
})