/* Animated city skyline. */
'use strict';

/**
 * A building is defined by a random:
 * - height
 * - width
 * - x position
 */

class CitySkyline {
  constructor(opts) {
    this.opts = {
      numBuildings: 15,
      minHeightScale: 0.5,
      maxHeightScale: 0.9,
      minWidthScale: 0.1,
      minWidthScale: 0.15,
      ...opts
    };

    this.canvas = this.setupCanvas();
  }

  render() {
    this.addBuildings();
  }

  setupCanvas() {
    // construct a canvas and overlay on the bottom of the screen
    this.canvasHeight = 0.35 * $("body").height();
    this.canvasWidth =  $("body").width();
    const canvasID = "skyline-canvas";

    d3.select("body")
      // wrap in a div to allow for centering
      .append("div")
      .style("width", "100%")
      .style("height", this.canvasHeight)
      .style("position", "fixed")
      .style("text-align", "center")
      .style("bottom", "-5px")  // TODO: Get rid of the bottom gap in a less hacky way.
      .style("z-index", -1)
        .append("svg")
          .attr("id", canvasID)
          .attr("width", this.canvasWidth)
          .attr("height", this.canvasHeight)

    return d3.select(`#${canvasID}`);
  }

  addBuildings() {
    const buildings = this.makeBuildings(this.opts.numBuildings).map((b) => this.buildingToSVGCoord(b));

    // animate the raising of buildings
    this.canvas
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
        // .attr("stroke", "gray")
        .attr("x", (d) => d.x)
        .attr("y", this.canvasHeight)  // prep for rising transition
        .attr("height", (d) => d.height)
        .attr("width", (d) => d.width);

    // add windows
    // addCircularWindowsToSVGBuilding(buildings[0]);

    // SVG coord system - modifying y-coord instead of height to get the buildings to "rise"
    this.canvas
      .selectAll(".building")
      .data(buildings)
      .transition()
        .delay(1000)
        .duration(2000)
          .attr("y", (d) => d.y)
  }

  // A building is defined by a random x-position, height, and width.
  makeBuildings(n) {
    const xJitter = 5;  // in %
    const xPositions = d3.range(0, 100, 100 / n).map((x) => {
      return x + xJitter * Math.random();
    });

    // in px
    const minHeight = this.opts.minHeightScale * this.canvasHeight;
    const maxHeight = this.opts.maxHeightScale * this.canvasHeight;
    const minWidth = this.opts.minWidthScale * this.canvasWidth;
    const maxWidth = this.opts.maxWidthScale * this.canvasWidth;

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

  buildingToSVGCoord({ x, height, width }) {
    return {
      x: x,
      y: this.canvasHeight - height,
      height: height,
      width: width,
    }
  }

  addCircularWindowsToSVGBuilding({ x, y, height, width }) {
    // evenly spaced circular "lights", defined by the number of rows and columns
    const nCols = 8;
    const nRows = 14;
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

    // for (let i = 0; i < windowPositions.length; i++) {
    //   anime({
    //     targets: `#building-window-${i}`,
    //     opacity: [1, 0],
    //     directin: "alternate",
    //     duration: 100,
    //     delay: randomUniform(1000 * 5, 1000 * 10),
    //     easing: "linear",
    //     loop: true,
    //   });
    // }
  }

  addStreetLights() {
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
    }
  }
}
