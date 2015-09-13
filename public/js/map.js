var countyBoundaries;
var map;
var incidence;
var incidenceByCounty = {};
var colorScale;

$(document).ready(function() {
  map = L.map('map').setView([39.8282, -98.5795], 4);

  L.tileLayer('https://api.tiles.mapbox.com/v4/herbps10.a53755cf/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaGVyYnBzMTAiLCJhIjoiV1dHRDZmWSJ9.hEa8olJ_k35VTNfVNmDD4A', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'herbps10.a53755cf',
      accessToken: 'pk.eyJ1IjoiaGVyYnBzMTAiLCJhIjoiV1dHRDZmWSJ9.hEa8olJ_k35VTNfVNmDD4A'
  }).addTo(map);

  

  loadIncidenceData();
  loadCountyBoundaries();
  
});

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

      console.log(colorScale.quantiles());

      $.each(incidence, function(i, row) {
        incidenceByCounty[row.fips] = row.incidence;
      });

      loadCountyBoundaries();
    });
}

function style(feature) {
  key = "" + feature.properties.STATE + feature.properties.COUNTY;

  incidence = incidenceByCounty[key];
  //if(incidence == undefined) {
    //console.log(feature.properties.NAME + " " + feature.properties.STATE);
  //}
  //
  //

  if(isNaN(incidence) || incidence == undefined) {
    return {
      stroke: false,
      fillColor: 'gray'
    };
  }
  else {
    return {
      stroke: false,
      fillColor: colorScale(incidence)
    };
  }
}

function loadCountyBoundaries() {
  $.ajax({
    dataType: "json",
    url: "data/counties.geojson",
    success: function(data) {
      $(data.features).each(function(key, data) {
        countyBoundaries = new L.geoJson(data, {
          style: style 
        });

        countyBoundaries.addTo(map);
      });
    }
  }).error(function() {});
}
