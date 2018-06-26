"use strict";


const NUM_STARS = 100;


function getSkyCanvas() {
    const idSelector = "sky-canvas";
    if ($("#sky-canvas").length == 0) {
        d3.select("body")
            // .style("border", "3px solid red")
            .append("svg")
            .attr("id", "sky-canvas")
            .style("position", "fixed")
            .style("top", 0)
            .style("left", 0)
            .style("z-index", -1)
            .attr("width", "100%")
            .attr("height", "100%");
    }
    return d3.select("#sky-canvas");
}


function addTwinklingStars() {
    const windowHeight = $("#name-block").height();
    const maxHeight = windowHeight * 0.6;

    // Return an array of x, y coordinates representing star positions.
    function makeStars(numStars) {
        let stars = [];
        for (let i = 0; i < numStars; i++) {
            let s = {
                x: (100 * Math.random()).toString() + "%",
                y: maxHeight * Math.random(),
                r: 0.5 + 1.2 * Math.random(),
                id: "svg-star-" + i.toString(),
            };
            stars.push(s);
        }
        return stars;
    }

    const canvas = getSkyCanvas();
    const stars = makeStars(NUM_STARS);

    canvas
        .selectAll("circle")
        .data(stars)
        .enter()
        .append("circle")
        .attr("fill", "white")
        .attr("class", "svg-star")
        .attr("id", function(d) { return d.id; })
        .attr("r", function(d) { return d.r; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    for (let star of stars) {
        anime({
            loop: true,
            targets: "#" + star.id,
            easing: "linear",
            r: [star.r, Math.random()],
            opacity: [1, 0],
            duration: 500 + Math.random() * 1000,
            delay: Math.random() * 1000,
            direction: "alternate",
        })
    }
}


function addShootingStars() {
    getSkyCanvas()
        .append("path")
        .attr("id", "shooting-star-path-0")
        .attr("d", "M 100 100 l 600 50")

    getSkyCanvas()
        .append("circle")
        .attr("id", "shooting-star-circle-0")
        .attr("r", 1)
        .attr("fill", "white")
        .attr("cx", 10)
        .attr("cy", 10)
        .attr("opacity", 0)

    var path = anime.path("#shooting-star-path-0");
    anime({
        targets: "#shooting-star-circle-0",
        translateX: path("x"),
        translateY: path("y"),
        opacity: [0, 1, 0],
        easing: "easeOutCubic",
        duration: 1500,
        delay: 2000,
        loop: true,
    })


}

function addRisingMoon() {
    getSkyCanvas()
        .append("circle")
        .attr("fill", "#fff6d3")
        .attr("class", "svg-moon")
        .attr("r", 10)
        .attr("cx", "80%")
        .attr("cy", "10%")

    anime({
        targets: ".svg-moon",
        translateY: ["+20px", "-20px"],
        opacity: [0, 1],
        duration: 1500,
        easing: "easeOutQuad",
        delay: 1000,
    })
}


function addCitySkyline() {
    // A building is defined by a random x-position, height, and width.
    function makeBuildings(n) {
        let buildings = []
        for (let i = 0; i < n; i++) {
            building.push({
                x: (100 * Math.random()).toString() + "%",
                height: 30 + 40 * Math.random(),
                width: 10 + 50 * Math.random(),
            })
        }
        return buildings;
    }


}

$(document).ready(function() {
    addTwinklingStars();
    addRisingMoon();
    addShootingStars();
})
