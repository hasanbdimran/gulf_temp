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

var urlPrefix = "/images/"

var url = urlPrefix+dateTimes[0]+".png"

var imageOverlay = new L.ImageOverlay(url, bounds, {
    opacity: 1.0,
    interactive: true,

}).addTo(map);


//function when sliding
slider.oninput = function() {
    //changing the label
    document.getElementById("sliderLabel").innerHTML = dateTimes[this.value-1]
    //setting the url of the overlay
    imageOverlay.setUrl(urlPrefix+dateTimes[this.value-1]+".png")
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
          imageOverlay.setUrl(urlPrefix+dateTimes[Number(val)-1]+".png")
  
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