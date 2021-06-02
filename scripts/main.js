'use strict';


/* Set up the content switching tabs. */
class Tabs {
  constructor(selectors) {
    this.selectors = selectors;
    this.activeTab = selectors[0];
    this.switchActiveTab = this.switchActiveTab.bind(this);
  }

  switchActiveTab(newActive) {
    if (newActive === this.activeTab) {
      return;
    }

    document.querySelector(this.activeTab.tab).classList.remove('is-active');
    document.querySelector(newActive.tab).classList.add('is-active');

    const newTabIsRightOfCurrent = this.selectors.indexOf(newActive) > this.selectors.indexOf(this.activeTab);
    const translateX = newTabIsRightOfCurrent ? -10 : 10;

    const fadeNewTabIn = function() {
      anime({
        targets: newActive.content,
        opacity: [0, 1],
        translateX: [-translateX, 0],
        duration: 75,
        easing: 'easeOutQuad',
      })

      // wrap display setting change in the complete callback to avoid a 'flash'
      document.querySelector(this.activeTab.content).style.display = 'none';
      document.querySelector(newActive.content).style.display = 'block';
      this.activeTab = newActive;

    }.bind(this);

    anime({
      targets: this.activeTab.content,
      opacity: [1, 0],
      translateX: [0, translateX],
      duration: 75,
      easing: 'easeInQuad',
      complete: fadeNewTabIn,
    })

  }

  render() {
    for (const selector of this.selectors) {
      document.querySelector(selector.tab).addEventListener('click', () => {
        this.switchActiveTab(selector);
      })
    }
  }
}

function randomChoice(collection) {
  return collection[Math.floor(Math.random() * collection.length)];
}

function randomUniform(lo, hi) {
  return lo + Math.random() * (hi - lo);
}

function roundToNearest(x, nearest) {
  return Math.floor(x / nearest) * nearest;
}

class HeroVisualization {
  constructor(canvasSelector) {
    this.canvas = this.setupCanvas(canvasSelector);
    this.opts = {
      n: 500,
      r: 3,
    }
  }

  setupCanvas(canvasSelector) {
    return d3.select(canvasSelector)
      .append('div')
      .append('svg')
        .attr('width', '100%')
        .attr('height', '200px')
    // .attr('class', 'debug')
  }

  canvasHeight() {
    return parseInt(this.canvas.style('height'));
  }

  canvasWidth() {
    return parseInt(this.canvas.style('width'));
  }

  makeRandomData() {
    const data = [];
    const nearest = 10;
    const pad = this.opts.r * 3;

    for (let i = 0; i < this.opts.n; i++) {
      data.push({
        x: roundToNearest(randomUniform(10, this.canvasWidth() - 10), nearest),
        y: roundToNearest(randomUniform(10, this.canvasHeight() - 10), nearest),
      });
    }
    return data;
  }

  randomColorScheme() {
    return randomChoice([
      d3.interpolateViridis,
      d3.interpolateInferno,
      d3.interpolatePlasma,
      d3.interpolateCool,
      d3.interpolateRainbow,
      d3.interpolateSinebow,
    ])
  }

  makeGaussianData() {

  }

  makeBimodalData() {

  }

  updateRandom() {
    const data = this.makeRandomData();
    const colorScale = d3.scaleSequential(this.randomColorScheme())
    .domain([0, this.canvasWidth()]);

    this.canvas
    .selectAll('circle')
    .transition()
    .ease(d3.easeCubic)
    .duration(1000)
    .delay((d, i) => {
      const mx = this.canvasWidth() / 2;
      const my = this.canvasHeight() / 2;
      const dx = Math.abs(mx - data[i].x);
      const dy = Math.abs(my - data[i].y);
      return (dx + dy) * 5;
    })
    .attr('cx', (d, i) => data[i].x)
    .attr('cy', (d, i) => data[i].y)
    .attr('fill', (d, i) => colorScale(data[i].x))
  }

  updateColor(horizontal, reverse) {
    const duration = 100;
    const width = this.canvasWidth();
    const height = this.canvasHeight();

    let colorScale;
    if (horizontal) {
      colorScale = d3.scaleSequential(this.randomColorScheme())
      .domain([0, width]);
    } else {
      colorScale = d3.scaleSequential(this.randomColorScheme())
      .domain([0, height]);
    }

    const randomX = randomUniform(0, width);
    const randomY = randomUniform(0, height);

    function delayFunction(d, i) {
      // if (horizontal) {
      //   return duration * (d.x / width);
      // } else {
      //   return duration * (d.y / height);
      // }
      const distance = Math.sqrt((d.x - randomX) ** 2 + (d.y - randomY) ** 2) * 2;
      console.log(distance);

      return distance;
    }

    this.canvas
    .selectAll('circle')
    .transition()
    .ease(d3.easeCubic)
    .delay(delayFunction)
    .duration(duration)
    .attr('fill', (d) => colorScale(horizontal ? d.x : d.y))
    .attr('r', 2 * this.opts.r)
    .transition()
    .attr('r', this.opts.r)
  }

  render() {
    // setup initial starting positions
    this.canvas
    .selectAll('circle')
    .data(this.makeRandomData())
    .enter()
    .append('circle')
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('r', this.opts.r)
    .attr('fill', 'black')

    setInterval(() => {
      this.updateColor(randomChoice([true, false]));
    }, 3000);
  }
}


function bounceMessage() {
  anime({
    targets: document.querySelectorAll('.message'),
    scale: [0.9, 1],
    opacity: [0.75, 1],
    duration: 500,
  })
}

function fadeInAll() {
  anime({
    targets: document.querySelectorAll(''),
    opacity: [0, 1],
    duration: 2000,
  })
}

document.addEventListener('DOMContentLoaded', function(event) {

  new TypeIt("#heading", {
    speed: 80,
    waitUntilVisible: true,
    startDelay: 1500,
    afterComplete: function (step, instance) {
      instance.destroy();
    }
  })
    .type("Hi, ")
    .pause(700)
    .type("I'm Eric.", {speed: 120})
    .pause(3000)
    .go();

  const sky = new NightSky({
    numStars: 50,
    numShootingStars: 5,
    shootingStarColors: ["white", "gold", "red", "skyblue", "orange"],
  });

  sky.render();
  // tabs.switchActiveTab(tabSelectors[1]);

});
