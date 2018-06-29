function randomUniform(min, max) {
	return min + (max - min) * Math.random();
}

function randomChoice(collection) {
	return collection[Math.floor(collection.length * Math.random())]
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * (i + 1));
			let temp = array[i];
			array[i] = array[j];
			array[j] = temp;
  }
}
