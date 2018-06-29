"use strict";


/**
 * My guess is that CSS > D3 > AnimeJS for animation performance.
 * Setting a less-efficient flag is for performance testing, otherwise it defaults
 * to the most efficient method.
 */
const animateWithAnimeJS = false;
const animateWithD3 = false;
const animateWithCSS = true;


class NightSky {
  constructor(opts) {
    this.opts = {
      numStars: 200,
      numShootingStars: 10,
      shootingStarColors: ["white", "gold"],
      ...opts
    };
    this.canvas = this.setupCanvas();
  }

  render() {
    this.addTwinklingStars();
    this.addShootingStars();
    this.addRisingMoon();
  }

  setupCanvas() {
    const canvasID = "sky-canvas";
    d3.select("body")
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

  addShootingStars() {
    const canvasHeight = $("#sky-canvas").height();
    const canvasWidth = $("#sky-canvas").width();
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
        duration: randomUniform(2000, 4000),
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

  addTwinklingStars() {
    const windowHeight = $("body").height();
    const generalStars = this.makeStars(0.6 * this.opts.numStars, windowHeight * 0.9);
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
          const duration = randomUniform(0.5, 2);
          const delay = randomUniform(0.5, 1.5);
          // TODO: Use the actual style method. Not sure why it's not working here.
          return `animation: twinkle ${duration}s linear ${delay}s infinite alternate; will-change: opacity;`
        })
    }
  }

  makeStars(numStars, maxHeight) {
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
}
