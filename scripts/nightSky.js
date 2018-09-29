"use strict";

/**
 * My guess is that CSS > D3 > AnimeJS for animation performance.
 * Setting a less-efficient flag is for performance testing, otherwise it defaults
 * to the most efficient method.
 */
const animateWithAnimeJS = false;
const animateWithD3 = false;
const animateWithCSS = true;


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

class NightSky {
  constructor(opts) {
    this.opts = opts;
    this.canvas = this.setupCanvas();
  }

  render() {
    if (this.opts.stars) { this.addTwinklingStars(); }
    if (this.opts.shootingStars) { this.addShootingStars(); }
    if (this.opts.moon) { this.addRisingMoon(); }
  }

  setupCanvas() {
    const canvasID = "sky-canvas";  // TODO: pass this into the constructor
    d3.select(".hero-head")
      .append("svg")
        .attr("id", canvasID)
        .attr("class", "sky");

    return d3.select(`#${canvasID}`);
  }

  addShootingStars() {
    const canvasHeight = document.querySelector("#sky-canvas").clientHeight;
    const canvasWidth = document.querySelector("#sky-canvas").clientWidth;
    for (let i = 0; i < this.opts.numShootingStars; i++) {
      const startX = randomUniform(canvasWidth * 0.2, canvasWidth * 0.8);
      const changeX = randomUniform(-(canvasWidth * 0.3), canvasWidth * 0.3);
      const startY = randomUniform(-(canvasHeight * 0.1), canvasHeight * 0.2);
      const changeY = randomUniform(canvasHeight * 0.2, canvasHeight * 0.8);

      this.canvas
        .append("circle")
          .attr("id", `shooting-star-circle-${i}`)
          .attr("fill", randomChoice(this.opts.shootingStarColors))
          .attr("opacity", 0)
          .style("will-change", "transform, opacity")

      anime({
        targets: `#shooting-star-circle-${i}`,
        translateX: [startX, startX + changeX],
        translateY: [startY, startY + changeY],
        translateZ: 0,
        opacity: [0, 1, 0],
        r: [0, randomUniform(0.5, 2), 0],
        easing: "easeOutCubic",
        duration: randomUtaniform(2000, 4000),
        delay: randomUniform(2000, 10 * 1000),
        loop: true,
      })
    }
  }

  addRisingMoon() {
    // Can't place an icon on an svg (i think) so using the body selector here.
    d3.select("body")
      .append("i")
      .attr("id", "moon")
      .attr("class", "fas fa-moon moon")
      .style("opacity", 0)

      // Set delay here, otherwise animation is
      setTimeout(() => {
        anime({
            targets: "#moon",
            duration: 2000,
            opacity: [0, 1],
            translateY: ["+20px", "-20px"],
            rotate: "-140deg",
            easing: "easeOutQuad",
            duration: 1500,
          });
      }, 1000);
  }

  addTwinklingStars() {
    const windowHeight = document.querySelector("#sky-canvas").clientHeight;
    const windowWidth = document.querySelector("#sky-canvas").clientWidth;
    const generalStars = this.makeStars(0.6 * this.opts.numStars, windowHeight, windowWidth);
    const topStars = this.makeStars(0.4 * this.opts.numStars, windowHeight * 0.3);
    const stars = generalStars.concat(topStars);

    this.canvas
      .selectAll("circle")
      .data(stars)
      .enter()
      .append("circle")
        .attr("fill", "white")
        .attr("class", "svg-star")
        .attr("id", (d) => d.id)
        .attr("r", (d) => d.r)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)

    if (animateWithD3) {
      function blink() {
        $skyCanvas
          .selectAll("circle")
          .transition()
            .delay(Math.random() * 1000)
            .ease(d3.easeLinear)
            .duration(() => 500 + Math.random() * 1000)
              .attr("opacity", 1)
          .transition()
            .ease(d3.easeLinear)
            .duration(() => 500 + Math.random() * 1000)
              .attr("opacity", 0)
          .on("end", blink)
      }
      blink();
    } else if (animateWithAnimeJS) {
      for (let star of stars) {
        anime({
          loop: true,
          targets: `#${star.id}`,
          translateZ: 0,
          easing: "linear",
          // r: [star.r, Math.random()],
          opacity: [1, 0],
          duration: 500 + Math.random() * 1000,
          delay: Math.random() * 1000,
          direction: "alternate",
        })
      }
    } else if (animateWithCSS) {
      this.canvas
        .selectAll(".svg-star")
        .attr("opacity", 0)
        .attr("style", function() {
          const duration = randomUniform(1, 3);
          const delay = randomUniform(1, 5);
          // TODO: Use the actual style method. Not sure why it's not working here.
          return `animation: blink ${duration}s linear ${delay}s infinite alternate; will-change: opacity;`
        })
    }
  }

  makeStars(numStars, maxHeight, maxWidth) {
    // TODO: Get rid of or use maxHeight
    let stars = [];

    for (let i = 0; i < numStars; i++) {
      let s = {
        x: `${100 * Math.random()}%`,
        y: `${100 * Math.random()}%`,
        r: 0.75 + 1.25 * Math.random(),
        id: `svg-star-${i}`,
      };
      stars.push(s);
    }
    return stars;
  }
}
