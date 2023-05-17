

//first you need a spreadsheet that can be access by "anyone with the link"
//make them as a viewer is ok

//spreadsheet ID
const sheetId = "1-vLXgB6x7gI10xGxHTRRTQhguCSbd9ramFS3IBGYGcE";

//spreadsheet URL Template
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;

//spreadsheet name
// var sheetName;

//query for spreadsheet, ex: "select *" means you select all the data from table
//if u want only select column A you can use "Select * A"
//and other possibilites like "Select * A,B,C WHERE C > 10"
const query = encodeURIComponent("Select *");

//spreadsheet url template + query
// const url = `${base}&sheet=${sheetName}&tq=${query}`;

//chart data for total conversion
var totalConversion;

//chart data for progress percentage
var progressPercentage;

//table data
var tableDataOffshores;
var tableDataLocal;


//total conversion data for local and offshores
var totalConversionOffshores;
var totalConversionLocal;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await getOffshores();
  await getLocal();

  //assign and merge the 2 array by totalling them based on index
  totalConversion = totalConversionOffshores.map(
    (e, i) => e + totalConversionOffshores[i]
  );

  //assign and divide every element in array by 20 and times 100 to make it percentage
  progressPercentage = Array(totalConversion.length);
  for (var i = 0, length = totalConversion.length; i < length; i++) {
    progressPercentage[i] = parseFloat(
      ((totalConversion[i] / 20) * 100).toFixed(2)
    );
  }


  
var ctx = document.getElementById("myChart").getContext("2d");
var ctx2 = document.getElementById("myChart2").getContext("2d");

var data = {
  labels: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
  
  datasets: [
      {
          backgroundColor: "rgb(0, 80, 230)",
          borderColor: "#000",
          data: totalConversion,
          datalabels: {
            align: 'center',
            anchor: 'top'
          },
      }    
  ]
};

var data2 = {
  labels: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
  
  datasets: [
      {
          backgroundColor: "rgb(0, 80, 230)",
          borderColor: "#000",
          data: progressPercentage,
          datalabels: {
            align: 'center',
            anchor: 'top'
          },
      }    
  ]
};

var myChart = new Chart(ctx, {
  type: 'bar',
  data: data,
  options: {
      plugins: {
          legend: {
              display: false
          },
          datalabels: {
              color: 'white',
              display: function(context) {
              return context.dataset;
          },
      formatter: Math.round
    }
      },
          responsive: true,
          scales: {
          x: {
              stacked: true,
              title: {
              display: true,
              // text: 'Bulan/Month'
            }
          },
      }
  }
});

var myChart = new Chart(ctx2, {
  type: 'bar',
  data: data2,
  options: {
      plugins: {
          legend: {
              display: false
          },
          datalabels: {
              color: 'white',
              display: function(context) {
              return context.dataset;
          },
      formatter: Math.round
    }
      },
  }
});

 
}

//get offshoress data
function getOffshores() {
  const result = fetch(`${base}&sheet=Offshores&tq=${query}`)
    .then((res) => res.text())
    .then(async (rep) => {
      //just a state to display it as a json in console, either way you can see the data we fetch in network
      const sheetJson = JSON.parse(rep.substring(47).slice(0, -2));
      //rows means how many rows in the excel, so if the project is less or many it will dynamicly process
      const rows = sheetJson.table.rows;
      const cols = sheetJson.table.cols;
      //assign the returned data from function to variable
      tableDataOffshores = await getTableData(rows, cols);
      totalConversionOffshores = TotalConversionManDay(rows);

      const tableBody = document.querySelector("#offshoreTable tbody");

      for (let i = 0; i < tableDataOffshores.length; i++) {
        const user = tableDataOffshores[i];

        const row = document.createElement("tr");

        for (const key in user) {
          if (user.hasOwnProperty(key)) {
            const cell = document.createElement("td");
            cell.textContent = user[key];
            row.appendChild(cell);
          }
        }

        tableBody.appendChild(row);
      }
    });
  return result;
}

//get local data
function getLocal() {
  const result = fetch(`${base}&sheet=Local&tq=${query}`)
    .then((res) => res.text())
    .then(async (rep) => {
      //just a state to display it as a json in console, either way you can see the data we fetch in network
      const sheetJson = JSON.parse(rep.substring(47).slice(0, -2));
      //rows means how many rows in the excel, so if the project is less or many it will dynamicly process
      const rows = sheetJson.table.rows;
      const cols = sheetJson.table.cols;
      //assign the returned data from function to variable
      getTableData(rows, cols);
      tableDataLocal = await getTableData(rows, cols);
      totalConversionLocatableDataLocal = TotalConversionManDay(rows);

      const tableBody = document.querySelector("#localTable tbody");

      for (let i = 0; i < tableDataLocal.length; i++) {
        const user = tableDataLocal[i];

        const row = document.createElement("tr");

        for (const key in user) {
          if (user.hasOwnProperty(key)) {
            const cell = document.createElement("td");
            cell.textContent = user[key];
            row.appendChild(cell);
          }
        }

        tableBody.appendChild(row);
      }
    });
  return result;
}

function getTableData(rows, cols) {
  let arrayRow = [];
  var labels = [
    "project",
    "level",
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  let tableDataArr = [];
  rows.forEach((row) => {
    row.c.forEach((value) => {
      if (value == null || value.v == null) {
        arrayRow.push(0);
      } else {
        arrayRow.push(value.v);
      }
    });
  });

  for (let i = 0; i < cols.length; i++) {
    while (arrayRow.length) {
      let splicedArr = arrayRow.splice(0, 14);
      const obj = {};

      splicedArr.forEach((elem, i) => {
        obj[labels[i]] = elem;
      });

      tableDataArr.push(obj);
    }
  }
  return tableDataArr;
}

//function for processing the data by looping the fetched datas
function TotalConversionManDay(rows) {
  let totalConversionRow = [];
  let totalConversionCol = [];
  let totalConversionArr = [];

  //this looping is not dynamic and its will change a bit in the conditional
  //if there's a column that you want to add or delete in the excel
  rows.forEach((row) => {
    row.c.forEach((value, i) => {
      if (i == 1 || i == 0) {
        return;
      }
      if (value == null || value.v == null) {
        totalConversionRow.push(0);
      } else {
        totalConversionRow.push(value.v);
      }
    });
  });
  //------------------------------------------------------------------------

  for (let j = 0; j < 12; j++) {
    totalConversionRow.forEach((number, i) => {
      if (
        i == 0 + j ||
        i == 12 + j ||
        i == 24 + j ||
        i == 36 + j ||
        i == 48 + j ||
        i == 60 + j ||
        i == 72 + j ||
        i == 84 + j
      ) {
        totalConversionCol.push(number);
      }
    });
  }

  for (var i = 0; i < totalConversionCol.length; i += rows.length) {
    let resultRange;
    sumArray = (arr) => arr.reduce((a, b) => a + Number(b), 0);
    resultRange = totalConversionCol.slice(i, i + rows.length);
    totalConversionArr.push(parseFloat(sumArray(resultRange).toFixed(2)));
  }
  return totalConversionArr;
}

Chart.register(ChartDataLabels);