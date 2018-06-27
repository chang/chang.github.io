"use strict";

function fadeAllElementsIn() {
    // Wrap every letter in a span
    $('.ml3').each(function(){
        $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
    });

    const nameFade = {
        targets: '.ml3 .letter',
        opacity: [0, 1],
        easing: "linear",
        duration: 2000,
        delay: function(el, i) {
            return 150 * (i + 1);
        }
    }

    const menuFade = {
        targets: ".my-interests, #link-menu, .interests",
        easing: "linear",
        opacity: [0, 1],
        duration: 1000,
    };

    anime.timeline()
        .add(nameFade)
        .add({
            offset: 1800,
            ...menuFade
        });
}

const AnscombeData = [
    {x: 0, y: 10},
    {x: 1, y: 8},
    {x: 2, y: 13},
    {x: 3, y: 9},
    {x: 4, y: 11},
    {x: 5, y: 14},
    {x: 6, y: 6},
    {x: 7, y: 4},
    {x: 8, y: 12},
    {x: 9, y: 7},
    {x: 10, y: 5},
]

class AnscombesQuartet {

    constructor() {
        this.xMin = -1;
        this.xMax = 12;
        this.yMin = -1;
        this.yMax = 15;

        this.data = AnscombeData;

        const demoCardSelector = "#d3-demo";
        const demoButtonSelector = "#d3-button";
        this.demoCard = d3.select(demoCardSelector);
        this.plot = this.demoCard
            .append("svg")
            .attr("width", "100%")
            .attr("height", "350px")
            .style("border-style", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("border-color", "lightgray");

        // we need to bind all methods we plan to use as higher order functions
        this.handleCardButtonClick = this.handleCardButtonClick.bind(this);
        $(demoButtonSelector).click(this.handleCardButtonClick);
    }

    // Convert cartesian coordinates to SVG coordinates, dependent on
    // current width and height of the plot window.
    cartesianToSVG(x, y) {
        const xSVG =  this.width() *((x - this.xMin) / (this.xMax - this.xMin));
        const ySVG = this.height() - this.height() * ((y - this.yMin) / (this.yMax - this.yMin));
        return [xSVG, ySVG];
    }

    // Create an object of cartesian x, y coordinates representating ticks on the axes.
    makeAxisData() {
        let ticks = [];
        for (let x = 0; x <= this.xMax; x++) {
            ticks.push({x: x, y: 0});
        }
        for (let y = 0; y <= this.yMax; y++) {
            ticks.push({x: 0, y: y});
        }
        return ticks;
    }

    updatePlot() {
        const plot = this.plot;
        const cartesianToSVG = this.cartesianToSVG.bind(this);

        function makeAddPoint(radius, fill) {
            function addPoint(x, y) {
                plot.append("circle")
                    .attr("r", radius)
                    .attr("fill", fill)
                    .attr("cx", x)
                    .attr("cy", y)
            }
            return addPoint;
        }

        // plot axes
        let axes = this.makeAxisData();

        this.plot.selectAll("circle")
            .data(axes)
            .enter()
            .append("circle")
            .attr("r", 2)
            .attr("fill", "black")
            .attr("cx", function(d) {
                const [xSVG, ySVG] = cartesianToSVG(d.x, d.y);
                return xSVG;
            })
            .attr("cy", function(d) {
                const [xSVG, ySVG] = cartesianToSVG(d.x, d.y);
                return ySVG;
            });

        // const testtest = this.data;
        // this.plot.selectAll("circle")
        //     .data(testtest)
        //     .enter()
        //     .append("circle")
        //     .attr("r", 2)
        //     .attr("fill", "black")
        //     .attr("cx", function(d) {
        //         const [xSVG, ySVG] = cartesianToSVG(d.x, d.y);
        //         return xSVG;
        //     })
        //     .attr("cy", function(d) {
        //         const [xSVG, ySVG] = cartesianToSVG(d.x, d.y);
        //         return ySVG;
        //     });

        // this.plot.selectAll("circle")
        //     .data(this.data)
        //     .enter()
        //     .append("circle")
        //     .attr("r", 4)
        //     .attr("fill", "red")
        //     .attr("cx", function(d) {
        //         const [xSVG, ySVG] = cartesianToSVG(d.x, d.y);
        //         return xSVG;
        //     })
        //     .attr("cy", function(d) {
        //         const [xSVG, ySVG] = cartesianToSVG(d.x, d.y);
        //         return ySVG;
        //     })
    }

    width() {
        return parseInt(this.plot.style("width"));
    }

    height() {
        return parseInt(this.plot.style("height"));
    }

    handleCardButtonClick(e, v) {
        console.log(this.width());
        this.updatePlot();
    }

    plotLinear(x) {
        this.plot.selectAll("circle")
            .data(x)
            .enter().append("circle")
            .attr("r", 10)
            .attr("cy", function(d, i) {
                return d * 50;
            })
            .attr("cx", function(d, i) {
                return d * 50;
            })
            .on("click", function() {
                var el = d3.select(this);
                var currentRadius = parseInt(el.style("r"));

                d3.select(this).transition()
                    .duration(500)
                    .attr("fill", "red")
                    .attr("r", currentRadius * 1.2);
            });
    }

    placePoint() {
        this.plot
            .append("circle")
            .attr("fill", "red")
            .attr("r", 20)
            .attr("cx", 100)
            .attr("cy", 300)
            .on("click", function(){
                console.log('clicked');
                d3.select(this).attr("fill", "blue");
            })
    }

    populateStatisticsTable() {
        function makeRow(x0, x1) {
            return '<tr class="left aligned"><td class="selectable">' + x0 + '</td><td class="selectable">' + x1 + '</td></tr>';
        }
        var dummyRows = [
            {statistic: "Mean x", value: 1},
            {statistic: "Variance y", value: 1},
            {statistic: "Mean y", value: 1},
            {statistic: "Variance y", value: 1},
            {statistic: "Correlation", value: 1},
            {statistic: "Regression Intercept", value: 1},
            {statistic: "Regression Coefficient", value: 1},
            {statistic: "R^2", value: 1},
        ]
        for (var row of dummyRows) {
            var {statistic, value} = row;
            $("#d3-card tbody").append(makeRow(statistic, value));
        }

    }
}


$(document).ready(function() {
    // setInterestChange(["data science", "software engineering", "open source"], 3000);
    fadeAllElementsIn();
    $("#d3-card").hide();

    // var demo = new AnscombesQuartet();
    // demo.updatePlot();
    // demo.populateStatisticsTable()
    var typed = new Typed('#interest-text', {
        strings: ["data science.", "software engineering.", "open source.", "3D Printing."],
        typeSpeed: 65,
        backSpeed: 65,
        backDelay: 3000,
        startDelay: 0,
        showCursor: true,
        loop: true,
      });
});
