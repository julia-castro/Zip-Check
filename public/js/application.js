var countyBoundaries;
var map;
var incidence;
var incidenceByCounty = {};
var colorScale;

$(document).ready(function() {
  $("#get_zip").change(function(){
    var user_input = $("#get_zip").val()
    $.ajax({
      url: 'https://api.meetup.com/2/groups?key=4e2b46647072193c161c4a13d397662&sign=true&photo-host=public&zip=' + user_input + '&radius=1&category_id=9',
      type: 'GET',
      dataType: 'jsonp',
      success: function (data, textStatus, xhr) {
        $("#meetups").text("Local Health and Wellness Meetups");
        for (var i = 0; i < data["results"].length; i++){
          $("#meetups_list").append('<li>' + '<a href="' + data["results"][i]["link"] + '">' + data["results"][i]["name"] + '</a>' + '</li>');
        };
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log('Error in Operation');
      }
    });
    $.ajax({
      url: 'https://api.meetup.com/2/groups?key=4e2b46647072193c161c4a13d397662&sign=true&photo-host=public&zip=' + user_input + '&radius=1&category_id=14',
      type: 'GET',
      dataType: 'jsonp',
      success: function (data, textStatus, xhr) {
        for (var i = 0; i < data["results"].length; i++){
          $("#meetups_list").append('<li>' + '<a href="' + data["results"][i]["link"] + '">' + data["results"][i]["name"] + '</a>' + '</li>');
        };
      },
      error: function (xhr, textStatus, errorThrown) {
        console.log('Error in Operation');
      }
    });
  })
});

