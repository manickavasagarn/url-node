const express = require("express");
const app = express();
const cors = require("cors");
const mongo = require("mongodb");
const mongoclient = mongo.MongoClient;
const url =
  "mongodb+srv://manickavasagar:vasagar123@urlshort.9aa5yep.mongodb.net/";
const jwt = require("jsonwebtoken");
const key ='12345678';
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

let authenticate = function(req,res,next){
    if(req.headers.authorization){
     
        try {
            let result = jwt.verify(req.headers.authorization,key);
            next();
        } catch (error) {
            res.status(401).json({message:"token expired"});
        }
    }else{
        res.status(401).json({message:"not authorized"})
    }
}

app.get("/urlshort",authenticate,function(req,res){
    res.json({message:"url shortener for u"})
})

app.post("/login",async function(req,res){
    try {
        var connection = await mongoclient.connect(url);
        var db = connection.db("urlshort");
        var result =await db.collection("user").findOne({email:req.body.email});
        if(result){
            if(req.body.password==result.password){
                var token = jwt.sign({email:result.email},key,{expiresIn:'1m'});
                res.status(200).json({token});
            }else{
                res.status(401).json({message:"usermail or password are invalid"})
            }
        }else{
            res.status(401).json({message:"usermail or password are invalid"})
        }
    } catch (error) {
        console.log(error)
    }
})

app.post("/register", async function (req, res) {
  try {
    var connection = await mongoclient.connect(url);
    var db = connection.db("urlshort");
    var result =await db.collection("user").insertOne(req.body);
    if (result) {
      res.json({ message: "user created !" });
    } else {
      res.json({ message: "user not be create" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});
app.post("/tokencheck",authenticate,async function(req,res){
    res.status(200).json({message:"access provied"})
})
app.get("/register",async function(req,res){
    try {
        var connection = await mongoclient.connect(url);
        var db = connection.db("urlshort");
        var result =await db.collection("user").find({}).toArray();
        res.json(result)
    } catch (error) {
        console.log(error)
    }
})
app.listen(3001);
