"use strict";

// should I add the SVG here or put it straight in the HTML?
function getSkyCanvas() {
  const canvasID = "sky-canvas";
  d3.select("body")
    // .style("border", "3px solid red")
    .append("svg")
      .attr("id", canvasID)
      .style("position", "fixed")
      .style("top", 0)
      .style("left", 0)
      .style("z-index", -1)
      .attr("width", "100%")
      .attr("height", "100%");

  return d3.select(`#${canvasID}`);
}

// good practice to cache this DOM lookup
const $skyCanvas = getSkyCanvas();
const $body = d3.select("body");
const canvasHeight = $("#sky-canvas").height();
const canvasWidth = $("#sky-canvas").width();


function randomUniform(min, max) {
  return min + (max - min) * Math.random();
}

function randomChoice(collection) {
  return collection[Math.floor(collection.length * Math.random())]
}


function addTwinklingStars() {
  // Return an array of x, y coordinates representing star positions.
  function makeStars(numStars, maxHeight) {
    let stars = [];

    for (let i = 0; i < numStars; i++) {
      let s = {
        x: `${100 * Math.random()}%`,
        y: maxHeight * Math.random(),
        r: 0.5 + 1.2 * Math.random(),
        id: `svg-star-${i}`,
      };
      stars.push(s);
    }
    return stars;
  }

  const windowHeight = $("body").height();
  const generalStars = makeStars(100, windowHeight * 0.9);
  const topStars = makeStars(40, windowHeight * 0.3);
  const stars = generalStars.concat(topStars);

  $skyCanvas
    .selectAll("circle")
    .data(stars)
    .enter()
    .append("circle")
      .attr("fill", "white")
      .attr("class", "svg-star")
      .attr("id", (d) => d.id)
      .attr("r", (d) => d.r)
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

  for (let star of stars) {
    anime({
      loop: true,
      targets: `#${star.id}`,
      easing: "linear",
      r: [star.r, Math.random()],
      opacity: [1, 0],
      duration: 500 + Math.random() * 1000,
      delay: Math.random() * 1000,
      direction: "alternate",
    })
  }
}


// TODO: Add trails to the shooting stars: https://codepen.io/juliangarnier/pen/gmOwJX?editors=0010
function addShootingStars() {
  const numShootingStars = 15;
  const shootingStarColors = ["white", "gold", "red", "skyblue"];

  for (let i = 0; i < numShootingStars; i++) {
    const startX = randomUniform(canvasWidth * 0.2, canvasWidth * 0.8);
    const changeX = randomUniform(-(canvasWidth * 0.3), canvasWidth * 0.3);
    const startY = randomUniform(-(canvasHeight * 0.1), canvasHeight * 0.2);
    const changeY = randomUniform(canvasHeight * 0.2, canvasHeight * 0.8);

    $skyCanvas
      .append("path")
        .attr("id", `shooting-star-path-${i}`)
        .attr("d", `M ${startX} ${startY} l ${changeX} ${changeY}`)
        // .attr("stroke", "pink")

    $skyCanvas
      .append("circle")
        .attr("id", `shooting-star-circle-${i}`)
        .attr("fill", randomChoice(shootingStarColors))
        .attr("opacity", 0)

    var path = anime.path(`#shooting-star-path-${i}`);
    anime({
      targets: `#shooting-star-circle-${i}`,
      translateX: path("x"),
      translateY: path("y"),
      opacity: [0, 1, 0],
      r: [0, randomUniform(0.5, 2), 0],
      easing: "easeOutCubic",
      duration: randomUniform(2000, 4000),
      delay: randomUniform(2000, 10 * 1000),
      loop: true,
    })
  }
}

function addRisingMoon() {
  // Can't place an icon on an svg (i think) so using the body selector here.
  $body
    .append("i")
    .attr("id", "moon")
    .attr("class", "fitted small moon icon")
    .style("color", "var(--moon-color)")
    .style("position", "fixed")
    .style("top", "10%")
    .style("right", "17%")
    .style("text-shadow", "var(--moon-color) 0 0 20px, var(--moon-color) 0 0 20px")

  anime.timeline()
    .add({
      targets: "#moon",
      translateY: ["+20px", "-20px"],
      opacity: [0, 1],
      rotate: "-140deg",
      duration: 1500,
      easing: "easeOutQuad",
      delay: 1000,
    })
}

/**
 * Add the city skyline.
 *
 * The skyline consists of SVG rect elements with some opacity < 1.
 *
 * A building is defined by a random:
 * - height
 * - width
 * - x position
 *
 * And are positioned along the bottom edge of the screen. Width and x
 * positions are drawn from uniform distributions, and height is controlled
 * by the CDF of some statistical distribution with x positions along the
 * bottom edge of the screen (with some noise added). All dimensions are percentages.
 *
 */
function addCitySkyline() {
  // A building is defined by a random x-position, height, and width.
  function makeBuildings(n) {
    // in %
    const xJitter = 5;
    const xPositions = d3.range(0, 100, 100 / n).map((x) => {
      return x + xJitter * Math.random();
    });

    // in px
    const minHeight = 0.1 * canvasHeight;
    const maxHeight = 0.3 * canvasHeight;
    const minWidth = 0.05 * canvasWidth;
    const maxWidth = 0.1 * canvasWidth;

    let buildings = []
    for (let x of xPositions) {
      buildings.push({
        x: `${x}%`,
        height: minHeight + (maxHeight - minHeight) * Math.random(),
        width: minWidth + (maxWidth - minWidth) * Math.random(),
      })
    }
    return buildings;
  }

  function buildingToSVGCoord({ x, height, width }) {
    return {
      x: x,
      y: canvasHeight - height,
      height: height,
      width: width,
    }
  }

  function addCircularWindowsToSVGBuilding({ x, y, height, width }) {
    // evenly spaced circular "lights", defined by the number of rows and columns
    const nCols = 5;
    const nRows = 10;
    const borderPadding = 10;  // in pixels

    const xPercent = parseFloat(x) / 100;

    // calculating positions is a bit tricky. need to deal with floating point imprecision.
    function evenRange(start, stop, numValues) {
      return d3.range(0, numValues)
        .map((x) => x / numValues)  // maps to values in range [0, 1]
        .map((p) => start + (stop - start) * p)
    }

    const xPositions = evenRange(
      xPercent,
      xPercent + width / canvasWidth,
      nCols,
    ).map((p) => `${p * 100}%`);

    const yPositions = evenRange(
      y + borderPadding,
      y - borderPadding + height,
      nRows,
    );

    console.log(xPositions);

    let windowPositions = [];
    for (let xp of xPositions) {
      for (let yp of yPositions) {
        if (Math.random() < 0.5) {
          continue;
        } else {
          windowPositions.push({
            x: xp,
            y: yp
          });
        }
      }
    }

    $body
      .selectAll("i")
      .data(windowPositions)
      .enter()
      .append("i")
        .attr("id", function(d, i) { return `building-window-${i}`; })
        .attr("class", "fitted tiny circle icon building")
        .style("font-size", "3px")
        .style("color", "var(--moon-color)")
        .style("position", "fixed")
        .style("left", ({x, y}) => `${x}`)
        .style("top", ({x, y}) => `${y}px`)
        .style("text-shadow", "var(--moon-color) 0 0 20px; var(--moon-color) 0 0 20px;")
        .style("opacity", 0);

    $body
      .selectAll(".building")
      .data(windowPositions)
      .transition()
        .delay(3000)
        .duration(1000)
          .style("opacity", 1);

    for (let i = 0; i < windowPositions.length; i++) {
      anime({
        targets: `#building-window-${i}`,
        opacity: [1, 0],
        directin: "alternate",
        duration: 100,
        delay: randomUniform(1000 * 5, 1000 * 10),
        easing: "linear",
        loop: true,
      });
    }
  }

  const buildings = makeBuildings(15).map((b) => buildingToSVGCoord(b));

  // animate the raising of buildings
  $skyCanvas
    .selectAll("rect")
    .data(buildings)
    .enter()
    .append("rect")
      .attr("class", "building")
      .attr("fill", function(d, i) {
        /// if (i != 0) {
        ///   return "transparent";
        /// }
        if (Math.random() > 0.5) {
          return "var(--background-building-color)";
        }
        return "var(--foreground-building-color)";
      })
      /// .attr("stroke", "gray")
      .attr("x", (d) => d.x)
      .attr("y", canvasHeight)  // prep for rising transition
      .attr("height", (d) => d.height)
      .attr("width", (d) => d.width);

  // add windows
  /// addCircularWindowsToSVGBuilding(buildings[0]);

  $body
    .append("i")
    .attr("id", "moon2")
    .attr("class", "fitted small moon icon")
    .style("color", "var(--moon-color)")
    .style("position", "fixed")
    .style("text-shadow", "var(--moon-color) 0 0 20px, var(--moon-color) 0 0 20px")

  // SVG coord system - modifying y-coord instead of height to get the buildings to "rise"
  $skyCanvas
    .selectAll(".building")
    .data(buildings)
    .transition()
      .delay(1000)
      .duration(2000)
        .attr("y", (d) => d.y)

  // .transition()
  // .append("rect")
  //   .attr("stroke", "gray")
  //   // .attr("fill", "transparent")
  //   .attr("x", function(d) { return d.x; })
  //   .attr("y", function(d) { return d.y; })
  //   .attr("height", function(d) { return d.height; })
  //   .attr("width", function(d) { return d.width; })


}

function addPowerStation() {
  // A power station with blinking red and white lights.
}

function addStreetLights() {
  const numStreetLights = 10;
  for (let i = 0; i < numStreetLights; i++) {
    // Can't place an icon on an svg (i think) so using the body selector here.
      $body
        .append("i")
        .attr("id", `streetlight-${i}`)
        .attr("class", "fitted tiny circle icon")
        .style("font-size", "3px")
        .style("color", "var(--moon-color)")
        .style("position", "fixed")
        .style("bottom", "1%")
        .style("left", `${randomUniform(0, 100)}%`)
        .style("text-shadow", "var(--moon-color) 0 0 20px, var(--moon-color) 0 0 20px");

      // anime({
      //     targets: "#moon",
      //     translateY: ["+20px", "-20px"],
      //     opacity: [0, 1],
      //     rotate: "-140deg",
      //     duration: 1500,
      //     easing: "easeOutQuad",
      //     delay: 1000,
      //   })
  }
}

$(document).ready(function() {
  addTwinklingStars();
  addRisingMoon();
  addShootingStars();
  addCitySkyline();
})
