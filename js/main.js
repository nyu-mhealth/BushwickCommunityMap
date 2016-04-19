/*** Global object that contains the app ***/
var app = app || {};


//BEGIN CODE
// keep map stuff in a part of the app object as to not pollute the global name space
app.map = (function(w,d, $, _){

  
//SET GLOBAL VARIABLES*******************************************************************************
  //  define all  variables for map parts and layers 
  //  store in an object called 'el' that can be accessed elsewhere
  var el = {
    baseLayers : null,
    cdbURL : null,
    fdaWarnings : null,
    fdaWarningsActions : null,
    fdaContracts : null,   
    featureGroup : null,
    geocoder : null,
    geocoderMarker : null, 
    legend : null,
    map : null,
    mapboxTiles : null,
    satellite : null,                
    sql : null,   
    styles: null,
    synarPoly : null,
    template : null
  };

  // reference cartocss styles from mapStyles.js
  el.styles = app.mapStyles;
  // url to cartodb FDA Violations map viz json
  el.cdbURL = "https://legacy.cartodb.com/api/v2/viz/3fe5ca92-0315-11e6-801b-0e31c9be1b51/viz.json";

  // queries for warning violatiions - sent to cartodb when layer buttons clicked
  el.sql = {
    warningLetters : "SELECT * FROM allwarnings_dc WHERE decisiontype = 'Warning Letter'",
    civilPenalties : "SELECT * FROM allwarnings_dc WHERE decisiontype = 'Civil Money Penalty'",
  };

  //HOLLY - research legend templates
  // compile the underscore legend template for rendering map legends for choropleth layers
  // _.templateSettings.variable = "legend";
  // el.template = _.template($("script.template").html());

  // el.legend = $('#ui-legend');

  // use google maps api geocoder
  el.geocoder = new google.maps.Geocoder();

//END SET GLOBAL VARIABLES*******************************************************************************

//BEGIN INIT ********************************************************************************************                                                                       
  
  // set up the map and map layers
  var initMap = function() {
    // map paramaters to pass to Leaflet
    var params = {
      center : [38.8963722,-77.0215417], //DC
      //minZoom : 14,
      //maxZoom : 19,
      zoom : 11,
      //maxBounds : L.latLngBounds([40.675496,-73.957987],[40.714216,-73.877306]), 
      zoomControl : false,
      infoControl: false,
      attributionControl: true
    }

    // coerce Leaflet into allowing multiple popups to be open simultaneously
    L.Map = L.Map.extend({
        openPopup: function(popup) {
            //this.closePopup();
            this._popup = popup;

            return this.addLayer(popup).fire('popupopen', {
                popup: this._popup
            });
        }
    });
  
    // instantiate the Leaflet map object
    el.map = new L.map('map', params);
    
    // api key for mapbox tiles - HOLLY GET OWN TOKEN
    L.mapbox.accessToken = 'pk.eyJ1IjoiY2hlbnJpY2siLCJhIjoiLVhZMUZZZyJ9.HcNi26J3P-MiOmBKYHIbxw';

    // tileLayer for mapbox basemap - HOLLY RESEARCH TILE CREATION
    el.mapboxTiles = L.mapbox.tileLayer('chenrick.map-3gzk4pem');
    el.map.addLayer(el.mapboxTiles); 

    // add mapbox and osm attribution
    var attr = "<a href='https://www.mapbox.com/about/maps/' target='_blank'>&copy; Mapbox &copy; OpenStreetMap</a>"
    el.map.attributionControl.addAttribution(attr);

    //HOLLY MAYBE USE THIS LOGIC LATER
    // feature group to store geoJSON
    el.featureGroup = L.featureGroup().addTo(el.map);    
    
    // add Bing satelitte imagery layer
    el.satellite = new L.BingLayer('AkuX5_O7AVBpUN7ujcWGCf4uovayfogcNVYhWKjbz2Foggzu8cYBxk6e7wfQyBQW');

    // object to pass Leaflet Control
     el.baseLayers = {
        streets: el.mapboxTiles,
        satellite: el.satellite
    };

    // inits UI element for toggling base tile layers
    L.control.layers(el.baseLayers, {}, {
          position: 'bottomleft'
      }).addTo(el.map);

    // makes sure base layers stay below the cartodb data
    el.map.on('baselayerchange', function(e){
      e.layer.bringToBack();
    })  

    //CALL THE FUNCTIONS TO CREATE MAP LAYERS
    // add geojson for synar
    loadSynar();

    // add the warnings layer from cartodb
    getCDBData();

  }   

//END INIT ******************************************************************************************** 


//BEGIN CREATE GEOJSON LAYERS *************************************************************************

  // SYNAR GEOJSON load the geoJSON boundary Synar State Rates
  function loadSynar() {
    $.getJSON('./data/synar_states.geojson', function(json, textStatus) {
        el.synarPoly = L.geoJson(json, {
          style: style,
          onEachFeature: onEachFeature
        });
    });
  } 

  //set style and color for geojson choropleth
  function style(feature) {
      return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.percent)
      };
    }

    // get color depending on percent field
    function getColor(d) {
      return d > 11 ? '#800026' :
             d > 7.55  ? '#BD0026' :
                        '#FFEDA0';
    }
   
    //set mouse over and click events on polygons 
    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }      

    function highlightFeature(e) {
      var layer = e.target;
      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });
      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }
      info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
       el.synarPoly.resetStyle(e.target);
      info.update();
    }

    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }

//END CREATE GEOJSON LAYERS *************************************************************************

//BEGIN CREATELAYER LAYERS **************************************************************************

  // function to load map all warnings layer from CartoDB
  var getCDBData = function() {  
    
    //create warnings layers (warning letters and civil penalties) with viz.json api call and createlayer function
    cartodb.createLayer(el.map, el.cdbURL, {
        cartodb_logo: false, 
        legends: false,
        https: true 
      }, 
      function(layer) {
        // store the warnings sublayer - all warnings and civil penalties
        layer.getSubLayer(0).setCartoCSS(el.styles.warningLetters);
        layer.getSubLayer(0).setSQL(el.sql.warningLetters);
        el.fdaWarnings = layer.getSubLayer(0); 

        //create fda contracts layer calling just a layer stored on cartodb but not in the map viz.json
        //uses layer object to grab permissions from viz.json (user name = Legacy)
          el.fdaContracts = layer.createSubLayer({
          sql : "SELECT * FROM fda_state_contracts",
          cartocss : "#allContracts{polygon-fill: #FFFFB2;" +
                                        "polygon-opacity: 0.7;" +
                                        "line-color: #FFF;" +
                                        "line-width: 0.5;" +
                                        "line-opacity: 1;" +
                                        "}" +
                                        '#fda_state_contracts [ most_recent_award_amount <= 4334123] {polygon-fill: #BD0026;}' +
                                        '#fda_state_contracts [ most_recent_award_amount <= 3491329.2] {polygon-fill: #F03B20;}' +
                                        '#fda_state_contracts [ most_recent_award_amount <= 2648535.4000000004] {polygon-fill: #FD8D3C;}' +
                                        '#fda_state_contracts [ most_recent_award_amount <= 1805741.6] {polygon-fill: #FECC5C;}' +
                                        '#fda_state_contracts [ most_recent_award_amount <= 962947.8] {polygon-fill: #FFFFB2;}',
        });


        // positions the tool tip in relationship to user's mouse
        // offset it by 5px vertically and horizontally so the mouse arrow won't cover it
        var event = function(e){
              $('#tool-tip').css({
                 left:  e.pageX + 5,
                 top:   e.pageY + 5
              });
          };                                


      // HOLLY hide the FDA Layer when map loads
      el.fdaContracts.hide();

      // add the cdb layer to the map
      el.map.addLayer(layer, false);

      // make sure the base layer stays below the cdb layer      
      el.mapboxTiles.bringToBack();

      }).on('done', function() {
        
      }); // end cartodb.createLayer!      
  };

  // change the cartoCSS of a layer
  var changeCartoCSS = function(layer, css) {
    layer.setCartoCSS(css);
  };

  // change SQL query of a layer
  var changeSQL = function(layer, sql) {
    layer.setSQL(sql);
  }

  // corresponding cartoCSS & SQL changes to FDA WARNINGS layer buttons
  // legends are displayed or hidden as needed
  el.fdaWarningsActions = {                          
     warningLetters : function() {
      changeCartoCSS(el.fdaWarnings, el.styles.warningLetters);
      changeSQL(el.fdaWarnings, el.sql.warningLetters);
      renderLegend(el.legendData.warningLetters);
      return true;
    },
     civilPenalties : function() {
      changeCartoCSS(el.fdaWarnings, el.styles.civilPenalties);
      changeSQL(el.fdaWarnings, el.sql.civilPenalties);
      renderLegend(el.legendData.civilPenalties);
      return true;
    },
  };

  // add FDA WARNINGS layer button event listeners
  var initButtons = function() {
    $('.button').click(function(e) {
      // e.preventDefault(); 
      $('.button').removeClass('selected');
      $(this).addClass('selected');
      el.fdaWarningsActions[$(this).attr('id')]();
      el.fdaWarnings.show();

    }); 
  }

  // HOLLY - FOR EXTRA LAYERS toggle additional layers based on check box boolean value
  var initCheckboxes = function() {
    // checkboxes for dob permit layer & stories
    var checkboxDOB = $('input.dob:checkbox'),
          $nb = $('#nb'),
          $sg = $('#synar_checkbox');

    // HOLLY THIS IS FOR FDA TEST toggle NB new buildings layer
    $nb.change(function(){
      if ($nb.is(':checked')){
        el.fdaContracts.show();    
      } else {
        el.fdaContracts.hide();
      };
    });

    //HOLLY - SYNAR GEOJSON
    // toggle sites of gentrification
    $sg.change(function(){
      if ($sg.is(':checked')) {
        el.featureGroup.addLayer(el.synarPoly);        
      } else {    
        el.featureGroup.removeLayer(el.synarPoly);
      };
    }); 

  }
  
//HOLLLY - GEOCODING KEEP
  // geocode search box text and create a marker on the map
  var geocode = function(address) {
    // reference bounding box for DC to improve geocoder results: 40.678685,-73.942451,40.710247,-73.890266
    var bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(38.788026,-77.218511), // sw - HOLLY CHANGE THIS TO US AFTER TESTINGS
          new google.maps.LatLng(39.014598,76.794164) // ne
          );    
      el.geocoder.geocode({ 'address': address, 'bounds' : bounds }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var latlng = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
          console.log('gecoder results: ', results, ' latlng: ', latlng);
          
          // remove geocoded marker if one already exists
          if (el.geocoderMarker) { 
            el.map.removeLayer(el.geocoderMarker);
          }
          // add a marker and pan and zoom the map to it
          el.geocoderMarker = new L.marker(latlng).addTo(el.map);
          el.geocoderMarker.bindPopup("<h4>" + results[0].formatted_address + "</h4>" ).openPopup();
          el.map.setView(latlng, 18);          
          } else {
            console.log('geocode unsuccesful: ', status);
          }
      });
  }

  // search box ui interaction TO DO: check to see if point is outside of Bushwick bounds
  var searchAddress = function() {
    $('#search-box').focus(function(){
      if ($(this).val()==="Search for a Bushwick address") {
        $(this).val("");
      }
    });
    $('#search-box').on('blur',function(){      
      if ($(this).val()!=="") {
        $address = $(this).val()
        geocode($address);  
        $(this).val("");
      } 
    });
  }


//HOLLY RESEARCH LEGENDS
  // function to render choropleth legends
  // var renderLegend = function(data) {
  //   if (data === null) { 
  //     el.legend.addClass('hidden');
  //     return;
  //   }
  //   var legendData = {
  //     title : data.title,
  //     items : data.items,// array of objects containing color and values
  //   };    
  //   el.legend.html(el.template(legendData));
  //   if (el.legend.hasClass('hidden')) el.legend.removeClass('hidden');
  // };

  // set up custom zoom buttons
  var initZoomButtons = function(){
    $('#zoom-in').on('click', function(){
      el.map.zoomIn();
    });
    $('#zoom-out').on('click', function(){
      el.map.zoomOut();
    });
  }

//HOLLY - THIS IS FOR LEGEND CSS - ADJUST FOR CHOROPLETH
  // data passed to renderLegend();
  // to do: generate this dynamically from cartocss
  el.legendData = {
    availFAR : {
      title : "Available FAR",
      items : [
        {
          color : "#BD0026",
          label : "3.3 - 4"        
        },
        {
          color : "#F03B20",
          label : "2.5 - 3.2"
        },
        {
          color : "#FD8D3C",
          label : "1.7 - 2.4"
        },
        {
          color: "#FECC5C",
          label : "0.9 - 1.6"
        },
        {
          color : "#FFFFB2",
          label : "0 - 0.8"
        }
      ]
    },
    yearBuilt : {
      title : "Year Built",
      items : [
      {
        color : "#7a0177",
        label : "2005-2014"
      },
      {
        color : "#ae017e",
        label : "2001-2004"
      },
      {
        color : "#dd3497",
        label : "1991-2000"
      },
      {
        color : "#f768a1;",
        label : "1974-1990"
      },
      {
        color : "#fa9fb5",
        label : "1934-1973"
      },
      {
        color : "#fcc5c0",
        label : "1901-1933"
      },
      {
        color : "#feebe2",
        label : "1800-1900"
      },                                    
      ]
    },
    landuse: {
      title: "Land Use",
      items: [
      {
        color: "#A6CEE3",
        label: "Multi-Family Walkup"
      },
      {
        color: "#1F78B4",
        label: "1 & 2 Family Bldgs"
      },
      {
        color: "#B2DF8A",
        label: "Mixed Resid & Comm"
      },
      {
        color: "#33A02C",
        label: "Parking Facilities"
      },
      {
        color: "#FB9A99",
        label: "Vacant Land"
      },
      {
        color: "#E31A1C",
        label: "Commerical & Office"
      },
      {
        color: "#FDBF6F",
        label: "Industrial & Mfg"
      },
      {
        color: "#FF7F00",
        label: "Public Facil & Instns"
      },
      {
        color: "#6A3D9A;",
        label: "Open Space & Rec"
      },
      {
        color: "#CAB2D6",
        label: "N/A"
      },                                                        
      ]
    }    
  };

  // get it all going!
  var init = function() {
    initMap();
    initButtons();
    initCheckboxes();
    searchAddress();
    initZoomButtons();  
  }

  // only return init() and the stuff in the el object
  return {
    init : init,
    el : el
  }

})(window, document, jQuery, _);

// call app.map.init() once the DOM is loaded
window.addEventListener('DOMContentLoaded', function(){
  app.map.init();  
});