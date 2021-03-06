module.exports.getAverageTime = function (data) {
	let totalTime = 0;
	let average = 0;
	for (i = 0; i < data.length; i++) {
		let entry = data[i];
		let time = entry["appTime"];
		totalTime += time;
	}
	average = Math.floor(totalTime/data.length);
	return average;
}

module.exports.getMostUsedApp = function (data) {
	let times = [];
	let maxTime;
	let maxEntry;
	let maxes;
	for (i = 0; i < data.length; i++) {
		let entry = data[i];
		let time = entry["appTime"];
		times.push(time);
	}
	maxTime = Math.max(...times);
	maxEntry = data[times.indexOf(maxTime)]["appTitle"];

	maxes = { time: maxTime, title: maxEntry };

	return maxes;
} 

module.exports.getLeastUsedApp = function (data) {
	let times = [];
	let minTime;
	let minEntry;
	let mins;
	for (i = 0; i < data.length; i++) {
		let entry = data[i];
		let time = entry["appTime"];
		times.push(time);
	}
	minTime = Math.min(...times);
	minEntry = data[times.indexOf(minTime)]["appTitle"];

	mins = { time: minTime, title: minEntry };

	return mins;
} 
