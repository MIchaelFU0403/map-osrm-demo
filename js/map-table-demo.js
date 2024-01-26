// 基于 OpenStreetMap 数据和 OSRM API 生成距离矩阵
async function generateDistanceMatrix(locations) {
  const url = 'http://router.project-osrm.org/table/v1/driving/';
  const coordinates = locations.map(loc => loc.join(',')).join(';');
  const query = `${url}${coordinates}?annotations=distance`;

  const response = await fetch(query);
  const data = await response.json();
  console.log(data)

  return data.distances;
}
const city=["Berlin","Zurich","Paris","London"]

// 在表格中显示距离矩阵
function displayDistanceMatrix(matrix) {
  const tableContainer = document.getElementById('tableContainer');
  const table = document.createElement('table');

  // 创建表头
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th></th>' + matrix.map((_, i) => `<th>`+city[i]+`</th>`).join('');
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // 创建表格内容
  const tbody = document.createElement('tbody');
  matrix.forEach((row, i) => {
    const tableRow = document.createElement('tr');
    tableRow.innerHTML = `<th>`+city[i]+`</th>` + row.map(distance => `<td>${distance}</td>`).join('');
    tbody.appendChild(tableRow);
  });
  table.appendChild(tbody);

  tableContainer.appendChild(table);
}


// 测试用例
const locations = [
  [13.388860, 52.517037], // Berlin
  [8.541693, 47.376887], // Zurich
  [2.352222, 48.856614], // Paris
  [-0.127647, 51.507222], // London
];

generateDistanceMatrix(locations)
  .then(distances => displayDistanceMatrix(distances));
