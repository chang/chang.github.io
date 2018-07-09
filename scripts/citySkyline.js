/* Animated city skyline. */
'use strict';


class CitySkyline {
  constructor(opts) {
    this.opts = opts;
    this.canvas = this.setupCanvas();
    this.makeBuilding = this.makeBuilding.bind(this);
    this.windowGenerator = new WindowGenerator(this.opts);
    this.addWindows = this.addWindows.bind(this);
  }

  render() {
    const buildings = this.makeBuildingCoordinates(this.opts.numBuildings).map((b) => this.buildingToSVGCoord(b));

    this.addBuildings(buildings);
    // this.addCommsTower();
    // this.addSpireToBuilding(buildings[0]);

    this.canvas
      .selectAll(".building")
      .attr("transform", `translate(0 ${this.canvasHeight})`)
      .transition()
        .delay((d, i) => 50 * i)
        .duration(2000)
          .attr("transform", `translate(0, 0)`)
        .on("end", (d, i) => {
          if (i === buildings.length - 1) {
            this.addWindows();
          }
        })
  }

  setupCanvas() {
    // construct a canvas and overlay on the bottom of the screen
    this.canvasHeight = 0.3 * $("body").height();
    this.canvasWidth =  0.6 * $("body").width();
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

  addBuildings(buildings) {
    this.canvas
      .selectAll("rect")
      .data(buildings)
      .enter()
      .append("svg")
        .attr("class", "building-canvas")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("height", (d) => d.height)
        .attr("width", (d) => d.width)
        .append("rect")
          .attr("class", "building")
          .attr("fill", (d, i) => this.opts.buildingColor(d, i))
          .attr("x", 0)
          .attr("height", (d) => d.height)
          .attr("width", (d) => d.width);
  }

  addWindows() {
    const buildings = d3.selectAll(".building-canvas")._groups[0];

    // perform computationally intensive actions at intervals
    for (let i = 0; i < buildings.length; i++) {
      setTimeout(() => {
        const r = Math.random();
        if (r < 0.5) {
          this.windowGenerator.addRectangularWindows(buildings[i]);
        } else {
          this.windowGenerator.addCircularWindows(buildings[i]);
        }
      }, this.opts.windowOnStaggeringDelay * i);
    }
  }

  addCommsTower() {
    const params = {
      x: randomUniform(0, this.canvasWidth * 0.6),
      width: 0.1 * this.canvasWidth,
      height: 0.9 * this.canvasHeight,
      barSpacing: 20,

      stroke: "black",
      "stroke-width": 1.5,
    };

    let lines = [];

    // outer bars
    const midpoint = params.width / 2;
    lines.push({
      x1: 0,
      y1: params.height,
      x2: midpoint,
      y2: 0,
    });

    lines.push({
      x1: params.width,
      y1: params.height,
      x2: midpoint,
      y2: 0,
    });


    // calculate bars
    const yPositions = d3.range(0, params.height, params.barSpacing);
    for (let y of yPositions) {
      const ratio = y / params.height;
      const barWidth = params.width * ratio;
      lines.push({
        x1: midpoint - barWidth / 2,
        y1: y,
        x2: midpoint + barWidth / 2,
        y2: y,
      });
    }

    const towerCanvas = this.canvas
      .append("svg")
      .attr("x", params.x)
      .attr("y", 0)
      .attr("height", params.height)
      .attr("width", params.width);

    towerCanvas
      .selectAll("line")
      .data(lines)
      .enter()
        .append("line")
        .attr("class", "building")
        .attr("x1", (d) => d.x1)
        .attr("y1", (d) => d.y1)
        .attr("x2", (d) => d.x2)
        .attr("y2", (d) => d.y2)
        .attr("stroke", params["stroke"])
        .attr("stroke-width", params["stroke-width"])


    const platformWidth = 10;
    towerCanvas
      .append("circle")
      .attr("x", midpoint)
      .attr("y", 0 + 4)
      .attr("r", 4)
      .attr("fill", "red")
      .attr("opacity", 0.3)

  }

  addSpireToBuilding(building) {
    const { x, y, width, height } = building;
    const spireX = parseFloat(x) + 0.2 * 100 * (width / this.canvasWidth); // place spire 1/5 of way across building
    const spireHeight = this.canvasHeight - height;
    const spireWidth = this.canvasWidth * 0.004;
    this.canvas
      .append("rect")
        .attr("class", "building")
        .attr("x", `${spireX}%`)
        .attr("y", 0)
        .attr("width", spireWidth)
        .attr("height", spireHeight)
        .attr("fill", "black")

    this.canvas
      .append("rect")
        .attr("class", "building")
        .attr("x", `${spireX}%`)
        .attr("y", 0)
        .attr("width", spireWidth)
        .attr("height", spireWidth)
        .attr("fill", "red")

    this.canvas
      .append("rect")
        .attr("class", "building")
        .attr("x", `${spireX}%`)
        .attr("y", spireWidth)
        .attr("width", spireWidth)
        .attr("height", spireWidth)
        .attr("fill", "white")
  }

  makeBuilding(data) {
    // returning an SVG object from a function is a bit hacky in d3:
    // https://stackoverflow.com/questions/18455282/how-to-create-svg-object-without-appending-it
    const svgData = this.buildingToSVGCoord(data);
    const building = d3.select("body")
      .append("svg")
      .data(svgData)
      .append("rect")
        .attr("class", "building")
        .attr("fill", function(d, i) {
          if (Math.random() > 0.5) {
            return "var(--background-building-color)";
          }
          return "var(--foreground-building-color)";
        })
        .attr("x", (d) => d.x)
        .attr("y", this.canvasHeight)  // prep for rising transition
        .attr("height", (d) => d.height)
        .attr("width", (d) => d.width);
  }

  // A building is defined by a random x-position, height, and width.
  makeBuildingCoordinates(n) {
    const xJitter = 5;  // in %
    const xPositions = d3.range(0, 100, 100 / n).map((x) => {
      return x + xJitter * Math.random();
    });
    xPositions.pop();  // get rid of the last building - gets cut off

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


class WindowGenerator {
  constructor(opts) {
    this.opts = opts;
    this.addCircularWindows = this.addCircularWindows.bind(this);
    this.addRectangularWindows = this.addRectangularWindows.bind(this);
  }

  addCircularWindows(building) {
    const width = building.width.baseVal.value;
    const height = building.height.baseVal.value;

    // generate window positions
    const pad = this.opts.windowPadding;
    const windowPositionsX = d3.range(0 + pad, width - pad, this.opts.windowDistance);
    const windowPositionsY = d3.range(0 + pad, height - pad, this.opts.windowDistance);
    let windows = [];
    for (let x of windowPositionsX) {
      for (let y of windowPositionsY) {
        if (Math.random() < 0.1) {
          // a blurred circular window
          windows.push({
            x,
            y,
            opacity: randomUniform(0.05, 0.3),
            r: 5,
          });
        } else {
          // a small, dotted window
          windows.push({
            x,
            y,
            opacity: this.opts.windowOpacity(),
            r: this.opts.windowRadius,
          });
        }
      }
    }

    const filteredWindows = this.opts.windowFilterFunction(windows);

    d3.select(building)
      .selectAll("circle")
      .data(filteredWindows)
      .enter()
      .append("circle")
        .attr("class", "window")
        .attr("fill", () => randomChoice(["white", "gold", "var(--moon-color)"]))
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (d) => d.r)
        .attr("opacity", 0)
        .attr("style", () => {
          if (this.opts.animateWindows == false) {
            return;
          }

          const r = Math.random();
          if (r < 0.06) {
            const duration = randomUniform(1, 3);
            const delay = randomUniform(5, 15);
            return `animation: flash ${duration}s linear ${delay}s infinite; will-change: opacity;`;
          } else if (r < 0.10) {
            const duration = randomUniform(1, 2);
            const delay = randomUniform(2, 5);
            return `animation: blink ${duration}s linear ${delay}s infinite alternate; will-change: opacity;`;
          }
        })
          .transition()
          .delay(() => randomUniform(0, 750))
          .duration(100)
            .attr("opacity", (d) => d.opacity)
  }

  addRectangularWindows(building) {
    const width = building.width.baseVal.value;
    const height = building.height.baseVal.value;
    const pad = this.opts.windowPadding;
    const windowPositionsY = d3.range(0 + pad, height - pad, this.opts.windowDistance);

    let windows = [];
    for (let y of windowPositionsY) {
      let x;
      if (Math.random() < 0.5) {
        x = randomUniform(0 + pad, width - pad);
      } else {
        x = pad;
      }
      const windowWidth = randomUniform(0.1 * width, 0.8 * width);
      windows.push({
        x: x,
        y: y,
        height: 2,
        width: windowWidth,
      });
    }

    d3.select(building)
      .selectAll("rect")
      .data(windows)
      .enter()
      .append("rect")
        .attr("class", "window")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("width", (d) => d.width)
        .attr("height", (d) => d.height)
        .attr("fill", () => randomChoice(["var(--moon-color)", "white", "gold"] ))
        .attr("style", () => {
          if (this.opts.animateWindows == false) {
            return;
          }

          if (Math.random() < 0.1) {
            const duration = randomUniform(3, 5);
            const delay = randomUniform(2, 5);
            return `animation: blink ${duration}s linear ${delay}s infinite alternate; will-change: opacity;`;
          }
        })
        .attr("opacity", 0)
        .transition()
          .delay((d, i) => 20 * i)
          .duration(100)
          .attr("opacity", () => randomUniform(0.1, 1))
  }
}
