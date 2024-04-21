var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
const path= require("path");
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
mongoose.connect('mongodb://localhost:27017/Database');
var db = mongoose.connection;
db.on('error', () => console.log("Error in connecting Database"));
db.once("open", () => console.log("Connected to the database"));
var userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});
var User = mongoose.model('User', userSchema);
app.post("/sign_up", (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({ email: email })
        .then(existingUser => {
            if (existingUser) {
                return res.status(400).send("Email already registered");
            }
            var newUser = new User({
                username: name,
                email: email,
                password: password
            });
            newUser.save()
                .then(() => {
                    console.log("User registered successfully");
                    return res.redirect('/signin');
                })
                .catch(err => {
                    console.error("Error registering user:", err);
                    return res.status(500).send("Error registering user");
                });
        })
        .catch(err => {
            console.error("Error checking existing email:", err);
            return res.status(500).send("Internal Server Error");
        });
});
app.get("/loggedinsuccess", (req,res)=>{
    res.render("loggedinsuccess")
})
app.get("/signin", (req,res)=>{
    res.render("signin")
})
app.get("/signup", (req,res)=>{
    res.render("signup")
})
app.post("/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            if (user.password !== password) {
                return res.status(400).send("Incorrect password");
            }
            return res.redirect('/loggedinsuccess');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
});
app.get("/default", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('/signup');
});
app.listen(2000, () => {
    console.log("Server listening on port 2000");
});