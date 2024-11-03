var map = L.map('map').setView([28, -92], 10, {
    crs: L.CRS.EPSG4326
});

var basemaps = {
    'Topo Map': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crs: L.CRS.EPSG4326
    }),

    'Geo World Map': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        crs: L.CRS.EPSG4326
    }),
    
    'OSM':L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}, {
        crs: L.CRS.EPSG4326
    }),

};

L.control.layers(basemaps).addTo(map);
basemaps["OSM"].addTo(map);

// generating all time and dates for the available raster data
function generateDateTimes(startTime, endTime, interval) {
    var start = new Date(startTime);
    var end = new Date(endTime);
    var dateTimes = [];
    
    while (start <= end) {
        var name = 'temp_'+start.getFullYear()+`${start.getMonth()+1}`.padStart(2, '0')+`${start.getDate()}`.padStart(2, '0')+ `${start.getHours()}`.padStart(2, '0');
        dateTimes.push(name); // Add the current date to the array
        start.setHours(start.getHours() + interval); // Move the time forward by the interval
    }

    return dateTimes;
};

// Time step generation in a list format
var startTime = '2023-08-12T01:00:00';
var endTime = '2023-09-28T00:00:00';
var interval = 1; // Interval in hours

var dateTimes = generateDateTimes(startTime, endTime, interval);


//setting max value of the slider
document.getElementById("slider").max = ""+dateTimes.length+"";

//setting default label of the slider
document.getElementById("sliderLabel").innerHTML = dateTimes[0];

var bounds = new L.LatLngBounds(
    new L.LatLng(30.806529, -98.232739),
    new L.LatLng(22.896634, -87.769914));
map.fitBounds(bounds);

var urlPrefix = "/gulf_temp/images_tif/"

var url = urlPrefix+dateTimes[0]+".tif"

const colorScale = chroma.scale(['#042333', '#40349F', '#8B538D', '#FCA63C', '#E8FA5B']).domain([23, 38]);
// function(pixelValues) {
//     var pixelValue = pixelValues[0]; // there's just one band in this raster

//     // if there's zero wind, don't return a color
//     if (isNaN(pixelValue)) return null;

//     var color = colorScale(pixelValue).hex();
//     return color;
//   }:
let image_layer = L.layerGroup();
let key_track = []
var color_sc = plotty.addColorScale("mycolorscale", ['#042333', '#40349F', '#8B538D','#D66C6C','#FCA63C', '#E8FA5B',], 
    [0, 0.2, 0.4, 0.53333333, 0.66666667, 1]);
// '#E8FA5B', '#FCA63C', '#D66C6C','#8B538D','#40349F', '#042333'
// color_sc.colorScale.setNoDataValue(null);
const options = {
displayMin: 23,
displayMax: 38,
applyDisplayRange: false,
clampLow: true,
clampHigh: true,
//   // Optional. Plotty color scale used to render the image.
  colorScale: 'mycolorscale'

};
// const renderer = L.LeafletGeotiff.plotty(options);
// renderer.setDisplayRange([23, 38]);
// renderer.setNoDataValue(NaN);
// console.log(renderer);
const option_render = {

    noDataValue:-9999,
    renderer: L.LeafletGeotiff.plotty(options)
}
  

    function imageUpdate(url) {
        // If a polyline already exists, remove it
        // if (image_layer) {
        //     map.removeLayer(image_layer);
        // }
        image_layer = L.leafletGeotiff(url, option_render).addTo(map);
        // image_layer.addTo(map);
        const layerCount = Object.keys(map._layers).length;
        console.log('layer count', layerCount);
    };

    imageUpdate(url);


// var imageOverlay = imageUpdate(url);

// var imageOverlay = new L.ImageOverlay(url, bounds, {
//     opacity: 1.0,
//     interactive: true,

// }).addTo(map);


//function when sliding
slider.oninput = function() {
    //changing the label
    document.getElementById("sliderLabel").innerHTML = dateTimes[this.value-1]
    //setting the url of the overlay
    // imageOverlay.setUrl(urlPrefix+dateTimes[this.value-1]+".tif")
    imageUpdate(urlPrefix+dateTimes[this.value-1]+".tif")
  }
  
  var playTimeOut;
  
  function play() {
      playTimeOut = setTimeout(function () {
          //increasing the slider by 1 (if not already at the end)
          var val = document.getElementById("slider").value
          console.log(val)
          //if end of slider, stopping
          if(val == document.getElementById("slider").max){
              clearTimeout(playTimeOut);
                //hidding the stop button
                document.getElementById('stop').style.display = "none";
                //showing the play button
                document.getElementById('play').style.display = "block";
          }
          else{
          document.getElementById("slider").value = Number(val)+1
          play()
          }
          //changing the label
          document.getElementById("sliderLabel").innerHTML = dateTimes[Number(val)-1]
          //setting the url of the overlay
        //   imageOverlay.setUrl(urlPrefix+dateTimes[Number(val)-1]+".tif")
          imageUpdate(urlPrefix+dateTimes[Number(val)-1]+".tif")
  
      }, 500);
  }
  
  document.getElementById('play').onclick = function(e){
    play()
    //showing the stop button
    document.getElementById('stop').style.display = "block";
    //hidding the play button
    document.getElementById('play').style.display = "none";
  }
  
  document.getElementById('stop').onclick = function(e){
    clearTimeout(playTimeOut);
    //hidding the stop button
    document.getElementById('stop').style.display = "none";
    //showing the play button
    document.getElementById('play').style.display = "block";
  }
  
  //hidding the stop button by default
  document.getElementById('stop').style.display = "none";

  //Colorbar manupulation
  function getColor(d) {
    return d > 38 ? '#E8FA5B' :
           d > 35 ? '#FCA63C' :
           d > 32 ? '#D66C6C' :
           d > 29 ? '#8B538D' :
           d > 26 ? '#40349F' :
                    '#042333';
}

var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [23, 28, 30, 32, 35, 38],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);

let popup;
map.on("click", function(e) {
  if (!popup) {
    popup = L.popup()
      .setLatLng([e.latlng.lat, e.latlng.lng])
      .openOn(map);
  } else {
    popup.setLatLng([e.latlng.lat, e.latlng.lng]);
  }
  const value = image_layer.getValueAtLatLng(+e.latlng.lat, +e.latlng.lng);
  popup.setContent(`Temperature: ${value.toFixed(2)}`).openOn(map);
});
