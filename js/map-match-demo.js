'use strict';

function processOsrmReply(data) {

  console.log('Received OSRM map matching reply:');
  console.log(data);

  if (data.code !== 'Ok') {
    clearMap('Error code: ' + data.code);
    return;
  }

  data.matchings.forEach(function(matching) {
    matchesGroup.addData(matching.geometry);
  });

  myMap.flyToBounds(matchesGroup.getBounds());
}

function sendOsrmRequest(lngLats) {
  // create an array of radiuses, same length as lngLats array
  var radiuses = lngLats.map(lngLat => 49);

  var url = 'https://router.project-osrm.org/match/v1/driving/' +
    lngLats.join(';') +
    '?overview=simplified' +
    '&radiuses=' +
    radiuses.join(';') +
    '&generate_hints=false' +
    '&skip_waypoints=true' +
    '&gaps=ignore' +
    '&annotations=nodes' +
    '&geometries=geojson';

  console.log('Sending OSRM map matching query to the URL ' + url);

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      var data = JSON.parse(this.response);
      processOsrmReply(data);
    } else {
      clearMap('Error status: ' + this.status);
    }
  };
  request.send();
}

function processMapClick(ev) {
  // get the count of currently displayed markers
  var markersCount = markersGroup.getLayers().length;
  if (markersCount < MARKERS_MAX) {
    L.marker(ev.latlng).addTo(markersGroup);
    matchesGroup.clearLayers();
    return;
  }

  // get the count of currently displayed matches
  var linesCount = matchesGroup.getLayers().length;
  if (linesCount >= 1) {
    clearMap();
    return;
  }

  // create an array of string: "lng,lat" with 6 digits after comma
  var lngLats = markersGroup.getLayers().map(marker =>
    parseFloat(marker.getLatLng().lng).toFixed(6) + ',' +
    parseFloat(marker.getLatLng().lat).toFixed(6)
  );

  sendOsrmRequest(lngLats);
}

function clearMap(str = '') {
  var myStatus = document.getElementById('myStatus');
  myStatus.textContent = str;

  matchesGroup.clearLayers();
  markersGroup.clearLayers();
}

var MARKERS_MAX = 5;
var startPosition = [51.4661, 7.2491];
var myMap = L.map('myMap').setView(startPosition, 14).on('click', processMapClick);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

var markersGroup = L.layerGroup();
myMap.addLayer(markersGroup);
var matchesGroup = L.geoJSON();
myMap.addLayer(matchesGroup);



