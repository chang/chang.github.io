"use strict";

function fadeAllElementsIn() {
  anime({
    targets: "#my-name, .my-interests, #link-menu, .interests",
    easing: "linear",
    opacity: [0, 1],
    delay: 1000,
    duration: 2000,
  });
}

function addTypingInterestText(interests) {
  new Typed('#interest-text', {
    strings: interests,
    typeSpeed: 60,
    backSpeed: 60,
    backDelay: 2000,
    showCursor: true,
    loop: true,
  });
}


$(document).ready(function() {
  fadeAllElementsIn();

  addTypingInterestText([
    "data science.",
    "software engineering.",
    "computer aided design.",
    "open source.",
  ]);

  const sky = new NightSky({
    numStars: 200,
    numShootingStars: 10,
    shootingStarColors: ["white", "gold", "red", "skyblue", "orange"],
    stars: true,
    moon: true,
    shootingStars: false,
  });

  const skyline = new CitySkyline({
    numBuildings: 20,
    minHeightScale: 0.2,
    maxHeightScale: 0.9,
    minWidthScale: 0.05,
    maxWidthScale: 0.12,
    buildingColor: () => randomChoice(["#000000", "#0a0a0a", "#111111"]),

    windowRadius: "0.1em",
    windowPadding: 7,
    windowDistance: 4,
    windowOpacity: () => randomUniform(0.3, 1),
    windowFilterFunction: function(windows) { return windows.filter(() => Math.random() < 0.25); },
    windowOnStaggeringDelay: 100,
  });

  sky.render();
  skyline.render();
});
