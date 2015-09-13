var countyBoundaries = {};
var map;
var incidence;
var incidenceByCounty = {};
var colorScale;

$(document).ready(function() {
  $("#submit").click(function(){
    var user_input = $("#get_zip").val()

    geocode(user_input, function(loc) {
      $("#prompt").fadeOut(function() {
        map.setView(L.latLng(loc.G, loc.K), 7, {
          animate: true
        });

        getCounty([loc.G, loc.K], function(county) {
          renderInfo(county);

          countyBoundaries[county.FIPS].setStyle({
            stroke: true,
            color: 'blue',
            weight: 3
          });
        });
      });
    });
  });

  map = L.map('map').setView([39.8282, -98.5795], 4);

  L.tileLayer('https://api.tiles.mapbox.com/v4/herbps10.a53755cf/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGVyYnBzMTAiLCJhIjoiV1dHRDZmWSJ9.hEa8olJ_k35VTNfVNmDD4A', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'herbps10.a53755cf',
      accessToken: 'pk.eyJ1IjoiaGVyYnBzMTAiLCJhIjoiV1dHRDZmWSJ9.hEa8olJ_k35VTNfVNmDD4A'
  }).addTo(map);


  loadIncidenceData();
});

function renderInfo(county) {
  val = incidenceByCounty[county.FIPS];

  html = "<h1>" + county.name + " County</h1>";
  html += "Breast cancer incidence: " + val + " / 100,000";
  html += "<div id='chart'></div>";

  $("#info").html(html);
  
  renderIncidenceDensity($("#chart")[0], incidence, county.name, val);
}

function getCounty(coordinates, callback) {
  $.getJSON("http://data.fcc.gov/api/block/find?callback=?", {
    format: 'jsonp',
    latitude: coordinates[0],
    longitude: coordinates[1],
    showall: 'true'
  }, function(results) {
    callback(results.County);
  });
}

function geocode(input, callback) {
  var geocoder = new google.maps.Geocoder();

  if(geocoder) {
    geocoder.geocode({ 'address': input }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        callback(results[0].geometry.location);
      }
      else {
        console.log("Geocoding failed: " + status);
      }

    });
  }
}

function loadIncidenceData() {
  d3.csv("data/map_data.csv")
    .row(function(d) {
      return { 
          county: d['County'].replace(/ \([0-9]\)/, ""),
          state: d['State'],
          fips: d['FIPS'],
          incidence: +d['Annual Incidence Rate']
        }
    }).get(function(error, rows) {
      incidence = rows;

      colorScale = d3.scale.quantile()
        .domain(rows.map(function(d) { return d.incidence; }))
        .range(['rgb(255,255,204)','rgb(255,237,160)','rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(252,78,42)','rgb(227,26,28)','rgb(189,0,38)','rgb(128,0,38)']);

      $.each(incidence, function(i, row) {
        incidenceByCounty[row.fips] = row.incidence;
      });


      loadCountyBoundaries();
    });
}

function style(feature) {
  key = "" + feature.properties.STATE + feature.properties.COUNTY;

  val = incidenceByCounty[key];
  //if(incidence == undefined) {
    //console.log(feature.properties.NAME + " " + feature.properties.STATE);
  //}
  //
  //

  if(isNaN(val) || val == undefined) {
    return {
      stroke: false,
      fillColor: 'gray'
    };
  }
  else {
    return {
      stroke: false,
      fillColor: colorScale(val),
      fillOpacity: 0.5
    };
  }
}

function loadCountyBoundaries() {
  $.ajax({
    dataType: "json",
    url: "/data/counties.geojson",
    success: function(data) {
      mapData = data;
      $(data.features).each(function(key, data) {
        fips = data.properties.STATE + data.properties.COUNTY;

        countyBoundaries[fips] = new L.geoJson(data, {
          style: style 
        });

        countyBoundaries[fips].on('mouseover', function() {
          renderInfo({ FIPS: data.properties.STATE + data.properties.COUNTY, name: data.properties.NAME });
        });

        countyBoundaries[fips].addTo(map);
      });
    }
  }).error(function(status, response) {
    console.log(status, response);
  });
}

function meetup(user_input) {
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
}


function renderIncidenceDensity(container, incidence, county, callout) {
  dat = incidence.map(function(row) {
    return row.incidence;
  });

  var xMax = d3.max(dat);
  var xMin = d3.min(dat);

  var margin = { top: 30, right: 20, bottom: 40, left: 60 };
  var width = 400 - margin.right - margin.left;
  var height = 200 - margin.top - margin.bottom;

  var x = d3.scale.linear()
    .domain([0, xMax + 10])
    .range([0, width]);

  var sd = d3.deviation(dat);
  var scale = 1.06 * sd * Math.pow(dat.length, -1.0/5.0);

  //var kde = kernelDensityEstimator(epanechnikovKernel(7), x.ticks(100));
  var kde = kernelDensityEstimator(gaussianKernel(scale), x.ticks(100));
  var density = kde(dat);

  var ylim = d3.extent(density, function(row) { return row[1]; });

  var svg = d3.select(container).append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  var y = d3.scale.linear()
    .domain([0, ylim[1]])
    .range([height, 0]); 

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format("%"));

  var line = d3.svg.line()
    .x(function(d) { return x(d[0]) })
    .y(function(d) { return y(d[1]) });

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxis);

  svg.append('text')
    .attr('class', 'label')
    .attr('x', width / 2)
    .attr('y', height + 30)
    .attr('text-anchor', 'middle')
    .text('County breast cancer incidence (cases per 100,000)');

  svg.append('g')
    .attr('transform', 'translate(' + x(callout) + ', -5)')
    .append('path')
    .attr('d', d3.svg.symbol().type('triangle-down').size(15))
    .attr('class', 'county-triangle');

  svg.append('line')
    .attr('class', 'county-line')
    .attr('x1', x(callout))
    .attr('y1', 0)
    .attr('x2', x(callout))
    .attr('y2', height);

  svg.append('text')
    .attr('x', x(callout))
    .attr('y', -12)
    .attr('text-anchor', 'middle')
    .text(county + ' County');


  svg.append("path")
    .datum(kde(dat))
    .attr("class", "line")
    .attr("d", line);
}

function kernelDensityEstimator(kernel, x) {
  return function(sample) {
    return x.map(function(x) {
      return [x, d3.mean(sample, function(v) { return kernel(x - v); })];
    });
  };
}

function epanechnikovKernel(scale) {
  return function(u) {
    return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
  };
}

function gaussianKernel(scale) {
  return function(u) {
    return (1.0 / (Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(u / scale, 2))
  }
}
