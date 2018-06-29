function randomUniform(min, max) {
    return min + (max - min) * Math.random();
}

function randomChoice(collection) {
    return collection[Math.floor(collection.length * Math.random())]
}
