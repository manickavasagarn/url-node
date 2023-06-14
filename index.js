const express = require("express");
const app = express();
const cors = require("cors");
const mongo = require("mongodb");
const mongoclient = mongo.MongoClient;
const url =
  "mongodb+srv://manickavasagar:vasagar123@urlshort.9aa5yep.mongodb.net/";
const jwt = require("jsonwebtoken");
const key = "12345678";
const BitlyClient = require("bitly").BitlyClient;
const bitly = new BitlyClient("09dec3e1f4c69a8153c51d8b0ff2e09e60516da1");
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

let authenticate = function (req, res, next) {
  if (req.headers.authorization) {
    try {
      let result = jwt.verify(req.headers.authorization, key);
      next();
    } catch (error) {
      res.status(401).json({ message: "token expired" });
    }
  } else {
    res.status(401).json({ message: "not authorized" });
  }
};

app.get("/geturl/:email",async function(req,res){
    req.params.email;
    try {
        var connection = await mongoclient.connect(url);
        var db = connection.db("urlshort");
        var result = await db.collection("url").find({ email: req.params.email }).toArray();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "something went wrong" });
    }
})

app.post("/urlshort", authenticate, async function (req, res) {
  try {
    var connection = await mongoclient.connect(url);
    var db = connection.db("urlshort");
    const response = await bitly.shorten(req.body.url);
    //local time and date
    let dateObject = new Date();
    let date = ("0" + dateObject.getDate()).slice(-2);
    let month = ("0" + (dateObject.getMonth() + 1)).slice(-2);
    let year = dateObject.getFullYear();
    let hours = dateObject.getHours();
    let minutes = dateObject.getMinutes();
    let seconds = dateObject.getSeconds();
    var time = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    req.body.time = time;
    req.body.shortener = response.link;
    var result = await db.collection("url").insertOne(req.body);
    if (result) {
      res.status(200).json({ message: "url created !" });
    } else {
      res.status(500).json({ message: "something went wrong" });
    }
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

app.post("/login", async function (req, res) {
  try {
    var connection = await mongoclient.connect(url);
    var db = connection.db("urlshort");
    var result = await db.collection("user").findOne({ email: req.body.email });
    if (result) {
      if (req.body.password == result.password) {
        var token = jwt.sign({ email: result.email }, key, { expiresIn: "1h" });
        res.status(200).json({ token, email: req.body.email });
      } else {
        res.status(401).json({ message: "usermail or password are invalid" });
      }
    } else {
      res.status(401).json({ message: "usermail or password are invalid" });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/register", async function (req, res) {
  try {
    var connection = await mongoclient.connect(url);
    var db = connection.db("urlshort");
    var result = await db.collection("user").insertOne(req.body);
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
app.get("/tokencheck", authenticate, async function (req, res) {
  res.status(200).json({ message: "access provied" });
});
app.get("/register", async function (req, res) {
  try {
    var connection = await mongoclient.connect(url);
    var db = connection.db("urlshort");
    var result = await db.collection("user").find({}).toArray();
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});
app.listen(3001);
