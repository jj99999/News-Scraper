// Grab articles as JSON
$.getJSON("/articles", function(data) {
  for (var i = 0; i < data.length; i++) {
    // Display each piece with the html to render
    $("#articles").append("<p data-id='" + data[i]._id + "'><b>" + data[i].title + "</b><br />" + data[i].link + "</p>");
  }
});


// event listener for p-tag
$(document).on("click", "p", function() {
  // Empty the comment section
  $("#comments").empty();
  // save id from the p-tag
  var thisID = $(this).attr("data-id");

  // ajax call for the Article tied to that ID
  $.ajax({
    method: "GET",
    url: "/articles/" + thisID
  })
    // add that article's comment info
    .done(function(data) {
      console.log(data);
      // article title
      $("#comments").append("<h2><b>" + data.title + "</b></h2>");
      // input field for new title
      $("#comments").append("<input id='titleinput' name='title' >");
      // text field for comment body
      $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
      // submit button for the article, including the article ID
      $("#comments").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");

      // if the article has a comment
      if (data.comment) {
        // push the title of that comment 
        $("#titleinput").val(data.comment.title);
        // push the body of that comment
        $("#bodyinput").val(data.comment.body);
      }
    });
});

// event listener for save comment button
$(document).on("click", "#savecomment", function() {
  // pick up the ID for this article from the button attribute
  var thisID = $(this).attr("data-id");

  // POST request for the comment
  $.ajax({
    method: "POST",
    url: "/articles/" + thisID,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .done(function(data) {
      // log response
      console.log(data);
      // empty the comments field
      // $("#comments").empty();
    });

  // empty the fields for the comment entry area
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
