'use strict';

function processOsrmReply(data) {

    if (data.code === 'Ok') {
        data.routes.forEach(function(route) {
            routesGroup.addData(route.geometry);
        });

        myMap.flyToBounds(routesGroup.getBounds());
    }
}

function sendOsrmRequest() {
    routesGroup.clearLayers();

    var url = 'https://router.project-osrm.org/route/v1/car/' +
        parseFloat(startMarker.getLatLng().lng).toFixed(6) + ',' +
        parseFloat(startMarker.getLatLng().lat).toFixed(6) + ';' +
        parseFloat(finalMarker.getLatLng().lng).toFixed(6) + ',' +
        parseFloat(finalMarker.getLatLng().lat).toFixed(6) +
        '?overview=simplified' +
        '&alternatives=3' +
        '&steps=false' +
        '&annotations=false' +
        '&geometries=geojson';

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            var data = JSON.parse(this.response);
            processOsrmReply(data);
        }
    };
    request.send();
}

var startPosition = [51.4661, 7.2491];
var finalPosition = [51.4661, 7.2491];

var myMap = L.map('myMap').setView(startPosition, 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

var markersGroup = L.featureGroup().addTo(myMap);
var routesGroup = L.geoJSON().addTo(myMap);

var overlays = {
    'Show start and finish markers': markersGroup,
    'Show OSRM route geometry': routesGroup
};

L.control.layers(null, overlays, { collapsed: false }).addTo(myMap);

var startMarker = L.marker(startPosition, { draggable: true })
    .on('dragend', sendOsrmRequest)
    .bindPopup('Start')
    .addTo(markersGroup);

var finalMarker = L.marker(finalPosition, { draggable: true })
    .on('dragend', sendOsrmRequest)
    .bindPopup('Finish')
    .addTo(markersGroup);

sendOsrmRequest();
