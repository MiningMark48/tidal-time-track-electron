const chart = require('electron-chartjs');

const timeSpent = "Time Spent";

//Value is name in preferences
module.exports.EnumCharts = { 
  PIE: "pie",
  DOUGHNUT: "doughnut",
  BAR: "bar",
  LINE: "line"
}

module.exports.pie_doughnut = function(ctx, chartType, data, labels, colors, chartAnimationDuration) {
	return new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: timeSpent,
        backgroundColor: colors,
        data: data
      }]
    },
    options: {
      legend: {
        display: false
      },
      title: {
        display: false,
        text: timeSpent
      },
      animation: {
        duration: chartAnimationDuration
      }
    }
  });
}

module.exports.bar = function(ctx, data, labels, colors, chartAnimationDuration) {
	return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: timeSpent,
        backgroundColor: colors,
        data: data
      }]
    },
    options: {
      legend: {
        display: false
      },
      title: {
        display: false,
        text: timeSpent
      },
      animation: {
        duration: chartAnimationDuration
      },
      scales: {
        xAxes: [{
            ticks: {
                display: false
            }
        }]
      }
    }
  });
}

module.exports.line = function(ctx, data, labels, colors, lineColor, chartAnimationDuration) {
	return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: timeSpent,
        backgroundColor: colors,
        borderColor: lineColor,
        fill: false,
        data: data
      }]
    },
    options: {
      legend: {
        display: false
      },
      title: {
        display: false,
        text: timeSpent
      },
      animation: {
        duration: chartAnimationDuration
      },
      scales: {
        xAxes: [{
            ticks: {
                display: false
            }
        }]
      }
    }
  });
}