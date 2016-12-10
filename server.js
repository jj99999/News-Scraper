var express = require('express');
var expressHBS = require('express-handlebars');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');

var app = express();



app.listen(3000, function() {
  console.log('app listening on port 3000');
});