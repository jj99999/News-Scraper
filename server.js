var express = require('express');
var expressHBS = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');
var logger = require("morgan");

// require the two models
var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");

// Mongoose mpromise deprecated - use bluebird promises
var Promise = require("bluebird");
mongoose.Promise = Promise;

var app = express();

// Use morgan and body parser
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static directory
app.use(express.static("public"));

// Database config for mongooseDB
mongoose.connect("mongodb://heroku_k5sxnst3:qjjq5580po950lktrih2gr3fj1@ds127878.mlab.com:27878/heroku_k5sxnst3");
var db = mongoose.connection;

// Show mongoose errors
db.on("error", function(error) {
  console.log("You have a Mongoose error: ", error);
});

db.once("open", function() {
  console.log("Mongoose connection successful.");
});



// ROUTES

// index route
app.get("/", function(req, res) {
  res.send(index.html);
});


// GET request to scrape the Quartz news website
app.get("/scrape", function(req, res) {
  // First, grab the body of the html with request
  request("http://www.qz.com/", function(error, response, html) {
    // Next, load that into cheerio and save to $
    var $ = cheerio.load(html);
    // Next, grab each h2 within an article tag
    $("article h2").each(function(i, element) {

      // Save empty result object
      var result = {};

      // Add text and href of e link, and save them as properties
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // create a new entry with article model
      var entry = new Article(result);

      // save to the db
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });
  res.send("The news scrape is complete");
});


// GET route to grab all articles
app.get("/articles", function(req, res) {
  // find every doc in Articles array
  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    // send doc to the browser as JSON
    else {
      res.json(doc);
    }
  });
});


// GET route to find article by ObjectId
app.get("/articles/:id", function(req, res) {
  // id is passed in the URL parameter,to query the db
  Article.findOne({ "_id": req.params.id })
  // populate any comments tied to that id
  .populate("Comment")
  // execute the query function
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    // send to browser as JSON
    else {
      res.json(doc);
    }
  });
});



//  POST request to  createa  new comment
app.post("/articles/:id", function(req, res) {
  // create newComment using the req
  var newComment = new Comment(req.body);

  // save to the database
  newComment.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      // Use Article id to create the comment and tie to the Article
      Article.findOneAndUpdate({ "_id": req.params.id }, { "Comment": doc._id })
      // execute the function
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          // send doc to browser
          res.send(doc);
        }
      });
    }
  });
});




app.listen(3000, function() {
  console.log('app listening on port 3000');
});