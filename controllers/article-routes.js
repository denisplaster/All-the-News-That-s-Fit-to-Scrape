var express = require("express");
var axios = require("axios");
var cheerio = require("cheerio");
var Comment = require("../models/Comment.js");
var Article = require("../models/Article.js");
var app = express();


// ============= ROUTES FOR HOME PAGE =============//

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("https://www.gameinformer.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // Grab every part of the html that contains a separate article
    $("h2.page-title").each(function (i, element) {
     
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
    // Reload the page so that newly scraped articles will be shown on the page
    res.redirect("/");
  });
});


// This will get the articles we scraped from the mongoDB
app.get("/articles", function (req, res) {
  // Grab every doc in the Articles array
  Article.find({})
    // thenute the above query
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Save an article
app.post("/save/:id", function (req, res) {
  // Use the article id to find and update it's saved property to true
  Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
    // thenute the above query
    .then(function (dbArticle) {
      // Log any errors
      if (err) {
        console.log(err);
      }
      // Log result
      else {
        console.log("doc: ", dbArticle);
      }
    });
});


// ============= ROUTES FOR SAVED ARTICLES PAGE =============//

// Grab an article by it's ObjectId
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
    // ..and populate all of the comments associated with it
    .populate("comments")
    // now, thenute our query
    .then(function (error, dbArticle) {
      // Log any errors
      if (error) {
        console.log(error);
      }
      // Otherwise, send the doc to the browser as a json object
      else {
        res.json(dbArticle);
      }
    });
});

// Create a new comment
app.post("/comment/:id", function (req, res) {
  // Create a new comment and pass the req.body to the entry
  var newComment = new Comment(req.body);
  // And save the new comment the db
  newComment.save(function (error, newComment) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to find and update it's comment
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "comments": newComment._id } }, { new: true })
        // thenute the above query
        .then(function (dbArticle) {
          // Log any errors
          if (err) {
            console.log(err);
          }
          else {
            console.log("doc: ", dbArticle);
            // Or send the document to the browser
            res.send(dbArticle);
          }
        });
    }
  });
});

// Remove a saved article
app.post("/unsave/:id", function (req, res) {
  // Use the article id to find and update it's saved property to false
  Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false })
    // thenute the above query
    .then(function (dbArticle) {
      // Log any errors
      if (err) {
        console.log(err);
      }
      // Log result
      else {
        console.log("Article Removed");
      }
    });
  res.redirect("/saved");
});


module.exports = app;
