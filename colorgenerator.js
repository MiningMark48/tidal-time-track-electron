var letters = '0123456789ABCDEF';

module.exports.getRandomColor = function() {
	var color = '#';
    for (colorIterator = 0; colorIterator < 6; colorIterator++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    // console.log(color);
    return color;
}