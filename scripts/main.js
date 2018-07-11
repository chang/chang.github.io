'use strict';

function addTypingInterestText(interests) {
  new Typed('#interests', {
    strings: interests,
    typeSpeed: 70,
    backSpeed: 70,
    backDelay: 2500,
    showCursor: true,
    loop: true,
  });
}


/* Set up the content switching tabs. */
class Tabs {
  constructor(selectors) {
    this.selectors = selectors;
    this.activeTab = selectors[0];
    this.switchActiveTab = this.switchActiveTab.bind(this);
  }

  switchActiveTab(newActive) {
    document.querySelector(this.activeTab.tab).classList.remove('is-active');
    document.querySelector(this.activeTab.content).style.display = 'none';
    document.querySelector(newActive.tab).classList.add('is-active');
    document.querySelector(newActive.content).style.display = 'block';

    this.activeTab = newActive;
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
    const duration = 1000;
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

    function delayFunction(d, i) {
      if (horizontal) {
        return duration * (d.x / width);
      } else {
        return duration * (d.y / height);
      }
    }

    this.canvas
      .selectAll('circle')
      .transition()
      .ease(d3.easeCubic)
      .delay(delayFunction)
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

document.addEventListener('DOMContentLoaded', function(event) {
  addTypingInterestText([
    'data science',
    'software engineering',
    'open source',
  ]);

  const tabSelectors = [
    {tab: '#about-tab', content: '#about-content'},
    {tab: '#experience-tab', content: '#experience-content'},
    {tab: '#work-tab', content: '#work-content'},
    {tab: '#contact-tab', content: '#contact-content'},
  ];
  const tabs = new Tabs(tabSelectors);
  tabs.render();
  tabs.switchActiveTab(tabSelectors[1]);


  const viz = new HeroVisualization('#hero-d3');
  viz.render();

});
