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

function addTypingInterestText(interests) {
  new Typed('#interest-text', {
    strings: interests,
    typeSpeed: 60,
    backSpeed: 60,
    backDelay: 2000,
    startDelay: 0,
    showCursor: true,
    loop: true,
    });
}

$(document).ready(function() {
  fadeAllElementsIn();

  const interests = [
    "data science.",
    "software engineering.",
    "open source.",
    "3D Printing."
  ];

  addTypingInterestText(interests);
});
