// 初始化地图
var map = L.map('map').setView([51.4661, 7.2491], 14);

// 添加图层
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18,
}).addTo(map);

// 创建标记组
var matchesGroup = L.geoJSON().addTo(map);
var resGroup = L.geoJSON().addTo(map);


// 查找最近点
function findNearestByQuery() {
  // 获取输入的经纬度坐标
  var lon = parseFloat(document.getElementById('lon').value);
  var lat = parseFloat(document.getElementById('lat').value);
  var num = parseInt(document.getElementById('num').value);

  var url = 'https://router.project-osrm.org/nearest/v1/driving/' +
    lon.toFixed(6) + ',' +
    lat.toFixed(6) +
    '?number=' + num;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);

  // 监听请求完成事件
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 400) {
      var data = JSON.parse(xhr.responseText);
      console.log(data);
      processOsrmReply(data);
    } else {
      console.error("请求失败：" + xhr.status);
    }
  };

  // 发送请求
  xhr.send();
}

function processOsrmReply(data) {
  if (data.code !== 'Ok') {
    clearMap('Error code: ' + data.code);
    return;
  }

  // 清空标记组
  resGroup.clearLayers();

  // 将查询结果添加到地图上
  for (var i = 0; i < data.waypoints.length; i++) {
    var point = data.waypoints[i];
    var marker = L.marker([point.location[1], point.location[0]]).addTo(resGroup);
    marker.bindPopup(point.name);
  }

  // 将地图相机飞行到标记组的范围
  map.flyToBounds(resGroup.getBounds());
}

// 点击地图事件
var marker = null;

// 点击地图事件
map.on('click', function (e) {
  if (marker) {
    matchesGroup.removeLayer(marker);
    resGroup.clearLayers();
  }

  var latlng = e.latlng;
  marker = L.marker(latlng).addTo(matchesGroup);
  marker.bindPopup("经度: " + latlng.lng.toFixed(6) + ", 纬度: " + latlng.lat.toFixed(6)).openPopup();
  document.getElementById('lon').value = latlng.lng.toFixed(6);
  document.getElementById('lat').value = latlng.lat.toFixed(6);
});
