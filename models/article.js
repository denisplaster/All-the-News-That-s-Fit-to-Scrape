// Require mongoose
const mongoose = require("mongoose");
// Create Schema class
const Schema = mongoose.Schema;

// Create article schema
const ArticleSchema = new Schema({
  // `title` is required and of type String
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  saved: {
    type: Boolean,
    default: false
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]

});

// Create the Article model with the ArticleSchema
const Article = mongoose.model("article", ArticleSchema);

// Export the model
module.exports = Article;

