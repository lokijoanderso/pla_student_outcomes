
import {
  prepData, updateData,
  recalcNodeValues,
  tooltipText,
  makeTitleText,
  renderSVG
} from './utils';
import { select } from 'd3-selection';
import {
  sankey, sankeyLinkHorizontal, sankeyJustify
} from 'd3-sankey';
import { json, csv } from 'd3-fetch';
import { transition } from 'd3-transition';
import 'intersection-observer';
import scrollama from 'scrollama';
import 'stickyfill';


// imports the css file

import './main.css';

// data sources

const RATE_DATA = './data/plaNodes_demog.csv';
let FILTER_DATA = {};

// menu indices for changing selection

const MENU_ORDER = {
  "college": 0,
  "pla": 1,
  "age": 2,
  "race": 3,
  "gender": 4,
  "income": 5,
};

let MENU_OPTS = {};


// default starting selection

let currentSelect = 'anaaaa';
let currentRate = 0;
let currentCost = 0;
let currentTime = 0;


// disable scroll plays for jump to bottom link

let history = {

  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false,
  9: false,
  10: false,
  11: false,
  12: false,
  13: false,
  14: false,
  15: false,

};

let explore = select("#exploreLink");

explore.on("click", function () {

  for (var i = 1; i < 14; i++) {
    stepFired(i, "fire");
  }

});

let topLinks = select("#topOpts");

topLinks
  .selectAll("span")
  .on("mouseover", d => {
    console.log(event.target);

    select(event.currentTarget)
      .select("path")
      .style("fill", "#782E6D");
  })
  .on("mouseout", d => {
    console.log(event.target);

    select(event.currentTarget)
      .select("path")
      .style("fill", "black");
  });


// set the dimensions and margins of the graph

const margin = { top: 10, right: 10, bottom: 0, left: 10 },
  width = 800 - margin.left - margin.right,
  height = 450 - margin.top - margin.bottom;


// append the svg objects to the body of the page

let replayButton = select("#titles")
  .append("svg")
  .attr("id", "replay")
  .append("a")
  .attr("xlink:href", d => "#step1")
  .classed("hidden", true);
replayButton
  .append("rect")
  .attr("width", 30)
  .attr("height", 30)
  .style("fill", "white");
replayButton
  .append("path")
  .attr("d", renderSVG("replay"));

let svg = select("#app").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");


// Set the sankey diagram properties

svg.append("g")
  .classed("links", true);

svg.append("g")
  .classed("nodes", true);

svg.append("g")
  .classed("labels", true);


// import data for sankey rates

csv(RATE_DATA)
  .then(data => {

    [MENU_OPTS, FILTER_DATA] = prepData(data);
    let selectedData = buildFilters(data);

    // add sankey nodes and links

    currentRate = selectedData.gradPerc;
    currentCost = selectedData.cost;
    currentTime = selectedData.time;

    updateSankey(selectedData);

    // initially hide filter options

    select("#filters")
      .style("opacity", 0)
      .style("height", "0px")
      .classed("hidden", true);

    // scrollama set up for triggers
    // using d3 for convenience

    var scrolly = select("#scrolly");
    var figure = scrolly.select("figure");
    var article = scrolly.select("article");
    var step = article.selectAll(".step");

    // initialize the scrollama
    var scroller = scrollama();

    // generic window resize listener event
    function handleResize() {

      // These are the orignal settings... I want to see if I can figure
      // out how to make the svg sizable before using these settings

      // 1. update height of step elements
      //var stepH = Math.floor(window.innerHeight * 0.75);
      //step.style("height", stepH + "px");

      //var figureHeight = window.innerHeight / 2;
      //var figureMarginTop = (window.innerHeight - figureHeight) / 2;

      var stepH = 500;
      var shortH = 200;
      var lastStepH = 700;

      let shortSteps = [14];

      step.style("height", (d, i) => {

        if ((i + 1) === 15) {
          return lastStepH + "px";
        }
        else if (shortSteps.includes((i + 1))) {
          return shortH + "px";
        }

        return stepH + "px";
      });

      var figureHeight = 600;
      var figureMarginTop = 150;

      figure
        .style("height", figureHeight + "px")
        .style("top", figureMarginTop + "px");


      // 3. tell scrollama to update new element dimensions

      scroller.resize();
    }

    // scrollama event handlers

    function handleStepProgress(response) {

      console.log(response);

      var el = select(response.element);
      var classes = el.attr("class");

      // add color to current step only

      step.classed("is-active", function (d, i) {
        return i === response.index;
      });

      // if it hasn't already played, play it!

      if (!stepFired(response.index + 1, "get") ||
        response.direction === "up") {

        // function to change chart

        if (response.index < 13) {
          stepFired(response.index + 1, "fire");
        }
        setVisForStep(response.index + 1,
          response.direction);
      }
    }



    function setupStickyfill() {
      step.selectAll(".sticky").each(function () {
        Stickyfill.add(this);
      });
    }


    function init() {
      setupStickyfill();

      // 1. force a resize on load to ensure proper dimensions are sent to scrollama

      handleResize();

      // 2. setup the scroller passing options
      // 		this will also initialize trigger observations
      // 3. bind scrollama event handlers (this can be chained like below)

      scroller
        .setup({
          step: "#scrolly article .step",
          offset: .2,
          debug: false,
          order: false

        })
        .onStepEnter(handleStepProgress);

      // setup resize event

      window.addEventListener("resize", handleResize);
    }

    // kick things off
    init();


  })
  .catch(e => {
    console.log(e);
  });


// function for creating the dropdown menus
// and swapping out the underlying data

function buildFilters(data) {

  let newData = updateData(FILTER_DATA, currentSelect);

  let menuBar = select("#filters")
    .append("div")
    .classed("menuBox", true)
    .style('display', 'flex')
    .selectAll('.dropDown')
    .data(d => Object.keys(MENU_OPTS))
    .join('div');

  select(".menuBox")
    .append("div")
    .attr("class", "resetBox")
    .append("button")
    .text("reset")
    .attr("id", "reset")
    .on("click", function () { resetDropDowns() })
    .join("button")
    .join('div');

  menuBar.append('div').text(d => d);

  menuBar
    .append('select')
    .join('select')
    .attr('name', d => d)
    .on("change", (event, row) => {

      let menuIndex = MENU_ORDER[row];

      let newSelect = currentSelect.slice(0, menuIndex) +
        event.target.value.slice(0, 1) +
        currentSelect.slice(menuIndex + 1, 6);

      currentSelect = newSelect;

      let newData = updateData(FILTER_DATA, newSelect);
      updateSankey(newData);

      // test code commented out 
      console.log(event.target.value, row);

    })
    .selectAll('option')
    .data(d => MENU_OPTS[d])
    .join('option')
    .text(d => d)
    .attr('value', d => d);


  return newData;

}

// function for loading the nodes and lines 

function updateSankey(data) {

  let myVis = sankey()
    .nodeWidth(150)
    .nodePadding(2)
    .nodeId(d => d.id)
    .size([width, height])
    .nodeAlign(sankeyJustify);

  let graph = myVis(data);

  var t = transition()
    .duration(750);

  // div for the tooltip

  var div = select("#tooltip");

  div
    .join()
    .attr("id", "tooltip")
    .style("opacity", 0);

  // add in the links
  
  let links = svg
    .selectAll("g .links")
    .join("g .links");

  let link = links
    .selectAll("path")
    .data(graph.links);

  link.enter()
    .append("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke-width", d => d.width)
    .attr("class", d => "link " + d.source.class);

    link
      .transition(t)
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke-width", d => d.width);

  link.exit().remove();

  if (!data.nodes[0].y0) {

    console.log("Null Found!");
    let newData = recalcNodeValues(data);
    data = { ...newData };
    graph = myVis(data);
  }

  let nodes = svg
    .selectAll("g .nodes")
    .join("g .nodes");

  let node = nodes
    .selectAll("rect")
    .data(graph.nodes,
      d => d.id);

  // add in the rectangles

  node.enter()
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("id", d => d.id)
    .attr("class", d => "node " + d.class)
    .on("mouseover", function (event, d) {

      div.transition()
        .duration(200)
        .style("opacity", .9);

      div.html(tooltipText(d))
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");
    })
    .on("mouseout", function () {
      div.transition()
        .duration(500)
        .style("opacity", 0); 
    });

  node.transition(t)
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("id", d => d.id);

  node.exit().remove();


  // add in the title for the nodes

  let labels = svg
    .select("g .labels")
    .join("g .labels")
    .selectAll("text")
    .data(graph.nodes)
    .join("text")
    .attr("y", d => (d.y0 + (d.y1 - d.y0) / 2))
    .attr("x", d => (d.x0 + (d.x1 - d.x0) / 2))
    .attr("text-anchor", "middle")
    .text(function (d) {
      if ((d.y1 - d.y0) < 20) {
        return '';
      } else {
        return d.name;
      }
    });

  // update callout div with grad rate, etc


  let ratesGrad = select("h1.rate")
    .text("" + (data.gradPerc * 100).toFixed(0) + "%");

  let ratesCost = select("h1.cost")
    .text("$" + Math.round(data.cost, 0)
      .toLocaleString('en-US'));

  let ratesTime = select("h1.time")
    .text("" + data.time.toFixed(1));

  // check for changes

  let rateChange = (data.gradPerc - currentRate).toFixed(2);
  let costChange = Math.round(data.cost - currentCost, 0);
  let timeChange = (data.time - currentTime).toFixed(1);
  let rateColor = "green";
  let timeColor = "green";
  let costColor = "green";
  let negColor = "red";

  let rateText = "" + Math.round((rateChange * 100), 0) + "%";
  let timeText = timeChange;
  let costText = "$" +
    Math.abs(costChange, 0).toLocaleString('en-US');

  if (Math.abs(rateChange) < 0.005 ) {
    select("h2.rate")
      .attr("class", "rate hidden");
  }
  else {

    if (rateChange > 0) {
      rateText = "+" + rateText;
    } else {
      rateColor = negColor;
    }
  

  let ratesGradChange = select("h2.rate")
    .attr("class", "rate")
    .text( rateText );

    ratesGradChange
      .style("color", rateColor);

  }

  if (costChange === 0) {
    select("h2.cost")
      .attr("class", "cost hidden");
  }
  else {

    if (costChange > 0) {
      costText = "+" + costText;
      costColor = negColor;
    } else {
      costText = "-" + costText;
    }

    let ratesCostChange = select("h2.cost")
      .attr("class", "cost")
      .text(costText);

    ratesCostChange
      .style("color", costColor);

  }

  if (Math.abs(timeChange) < 0.05) {
    select("h2.time")
      .attr("class", "time hidden");
  }
  else {

    if (timeChange > 0) {
      timeText = "+" + timeText;
      timeColor = negColor;
    }

    let ratesCostChange = select("h2.time")
      .attr("class", "time")
      .text(timeText);

    ratesCostChange
      .style("color", timeColor);

  }

  currentRate = data.gradPerc;
  currentCost = data.cost;
  currentTime = data.time;

  // debugging prints commented out
  // console.log("new grad rate:", data.gradPerc);
  // console.log("new cost:", data.cost);
  // console.log("new time:", data.time); 

  // update the chart title

  select("#titles")
    .select("h3")
    .text(makeTitleText(currentSelect));

}

function setVisForStep(step, direction) {

  let filters = select("#filters");

  let rects = select("#app")
    .select("svg")
    .selectAll("rect");

  let paths = select("#app")
    .select("svg")
    .selectAll("path");

  function resetAll() {

    // reset data

    resetDropDowns()

    // hide button

    replayButton
      .classed("hidden", true)
      .attr("xlink:href", d => "#step1");

    // hide filters

    filters
      .classed("hidden", true)
      .style("opacity", 0)
      .style("height", "0px");

    // reset selection colors

    rects
      .attr("class", d => "node " + d.class);

    paths
      .attr("class", d => "link " + d.source.class);

  }


  if (step === 1 ) {

    resetAll();

    if (direction === "up") {
      setTimeout(function () {
        for (var i = 1; i < 15; i++) {
          stepFired(i, "reset");
        }
      }, 1000)
    }

    stepFired(step, "reset");

  }
  else if (step === 2) {

    // change selection colors

    rects
      .attr("class", d => {

        if (d.id <= 3) {
          return "node selected";
        }
        else { return "node unselected"; }
      });

    paths
      .attr("class", "link unselected");

    stepFired(step, "reset");

  }

  else if (step === 3 ) {

    // change selection colors

    rects
      .attr("class", d => {

        if (d.id <= 7 && d.id >= 4) {
          return "node selected";
        }
        else { return "node unselected"; }
      });

    paths
      .attr("class", d => {

        if (d.source.id <= 3 &&
          d.target.id <= 7 &&
          d.target.id >= 4) {
          return "link selected";
        }
        else { return "link unselected"; }
      });

    stepFired(step, "reset");
  }
  else if (step === 4 ) {

    // change selection colors

    rects
      .attr("class", d => {

        if (d.id === 8) {
          return "node selected";
        }
        else { return "node unselected"; }
      });

    paths
      .attr("class", d => {

        if (d.target.id === 8) {
          return "link selected";
        }
        else { return "link unselected"; }
      });

    stepFired(step, "reset");

  }
  else if (step === 5 ) {

    // change selection colors

    rects
      .attr("class", d => {

        if (d.id === 10) {
          return "node selected";
        }
        else { return "node unselected"; }
      });

    paths
      .attr("class", d => {

        if (d.target.id === 10) {
          return "link selected";
        }
        else { return "link unselected"; }
      });

    stepFired(step, "reset");

  }

  else if (step === 6) {


    if (currentSelect !== "anaaaa") {
      resetAll();
    }

    // change selection colors

    rects
      .attr("class", d => {

        if (d.id === 10 ||
          d.id <= 3) {
          return "node selected";
        }
        else { return "node unselected"; }
      });

    paths
      .attr("class", d => "link unselected");

    if (direction === "up") {
      stepFired(step, "reset");
    } else {

      let pv_rate = updateData(FILTER_DATA, "pnaaaa");
      let cc_rate = updateData(FILTER_DATA, "2naaaa");

      // change selection colors

      rects
        .attr("class", d => {

          if (d.id === 10 ||
            d.id <= 3) {
            return "node selected";
          }
          else { return "node unselected"; }
        });

      paths
        .attr("class", d => "link unselected");

      setTimeout(function () {

        currentSelect = "pnaaaa";
        updateSankey(pv_rate);
      }, 1000);

      setTimeout(function () {
        currentSelect = "2naaaa";
        updateSankey(cc_rate);

      }, 5000);

      setTimeout(function () {

        replayButton
          .classed("hidden", false)
          .attr("xlink:href", d => "#step" + step)
          .on("click", function () {
            stepFired(step, "reset");
            resetDropDowns();
          });

      }, 8000);
    }
  }

  else if (step === 7) {

    if (direction === "up") {
      stepFired(step, "reset");
    } else {

      let pla1 = updateData(FILTER_DATA, "anaaaa");
      let pla2 = updateData(FILTER_DATA, "alaaaa");


      // change selection colors

      rects
        .attr("class", d => {

          if (d.id === 10) {
            return "node selected";
          }
          else { return "node unselected"; }
        });

      paths
        .attr("class", "link unselected");

      // animate impact of pla

      setTimeout(function () {

        currentSelect = "anaaaa";
        updateSankey(pla1);
      }, 1);

      setTimeout(function () {
        currentSelect = "alaaaa";
        updateSankey(pla2);
      }, 4000);

      setTimeout(function () {

        replayButton
          .classed("hidden", false)
          .attr("xlink:href", d => "#step" + step);

      }, 6000);
    }

  }
  else if (step === 8 ) {

    if (direction === "up") {
      stepFired(step, "reset");
    } else {

      let old1 = updateData(FILTER_DATA, "anoaaa");
      let old2 = updateData(FILTER_DATA, "aloaaa");


      // change selection colors

      if (currentSelect !== "anaaaa" ||
        currentSelect !== "alaaaa") {
        resetAll();
      };

      rects
        .attr("class", d => {
          if (d.id === 10) {
            return "node selected";
          }
          else { return "node unselected"; }
        });

      paths
        .attr("class", "link unselected");

      setTimeout(function () {
        currentSelect = "anoaaa";
        updateSankey(old1);
      }, 1);

      setTimeout(function () {
        currentSelect = "aloaaa";
        updateSankey(old2);
      }, 4000);

      setTimeout(function () {

        replayButton
          .classed("hidden", false)
          .attr("xlink:href", d => "#step" + step);

      }, 6500);

    }

  }
  else if (step === 9) {

    if (direction === "up") {
      stepFired(step, "reset");
    } else {
    let inc1 = updateData(FILTER_DATA, "anaaal");
    let inc2 = updateData(FILTER_DATA, "alaaal");

    // change selection colors

    rects
      .attr("class", d => {
        if (d.id === 10) {
          return "node selected";
        }
        else { return "node unselected"; }
      });

    paths
      .attr("class", "link unselected");

      if (currentSelect !== "alaaal") {
        setTimeout(function () {
          currentSelect = "anaaal";
          updateSankey(inc1);
        }, 1);

        setTimeout(function () {
          currentSelect = "alaaal";
          updateSankey(inc2);
        }, 4000);

        setTimeout(function () {

          replayButton
            .classed("hidden", false)
            .attr("xlink:href", d => "#step" + step);

        }, 6500);
      }
    }
  }
  else if (step === 10 ) {

    if (direction === "up") {
      stepFired(step, "reset");
    } else {
    let hisp1 = updateData(FILTER_DATA, "anaHaa");
    let hisp2 = updateData(FILTER_DATA, "alaHaa");

    // change selection colors

    rects
      .attr("class", d => {
        if (d.id === 10) {
          return "node selected";
        }
        else { return "node unselected"; }
      });

    paths
      .attr("class", "link unselected");

      if (currentSelect !== "alaHaa") {

        setTimeout(function () {
          currentSelect = "anaHaa";
          updateSankey(hisp1);
        }, 1);

        setTimeout(function () {
          currentSelect = "alaHaa";
          updateSankey(hisp2);
        }, 4000);

        setTimeout(function () {

          replayButton
            .classed("hidden", false)
            .attr("xlink:href", d => "#step" + step);

        }, 6500);
      }

    }
  }
  else if (step === 11) {

    if (direction === "up") {
      stepFired(step, "reset");
    } else {
    let cc1 = updateData(FILTER_DATA, "2naaaa");
    let cc2 = updateData(FILTER_DATA, "2laaaa");

    // change selection colors

    rects
      .attr("class", d => {
        if (d.id === 10) {
          return "node selected";
        }
        else { return "node unselected"; }
      });

    paths
      .attr("class", "link unselected");

      if (currentSelect !== "2laaaa") {

        setTimeout(function () {
          currentSelect = "2naaaa";
          updateSankey(cc1);
        }, 1);

        setTimeout(function () {
          currentSelect = "2laaaa";
          updateSankey(cc2);
        }, 4000);

        setTimeout(function () {

          replayButton
            .classed("hidden", false)
            .attr("xlink:href", d => "#step" + step);

        }, 6500);
      }
    }

  }

  else if (step === 12) {

    if (direction === "up") {
      stepFired(step, "reset");
    } else {
      // funky selection combos for later

      var selectRects1 = [0, 2, 5, 7];
      var selectRects2 = [0, 2, 5, 7, 10];
      var selectPaths0 = [0, 2];
      var selectPaths1 = selectRects1;
      var selectPaths2 = [5, 7, 10];


      // progress triggers

      if (currentSelect !== "anaaaa") {
        resetAll();
      };

      rects
        .attr("class", d => {

          if (d.id === 0 ||
            d.id === 2) {
            return "node selected";
          }
          else { return "node unselected"; }
        });

      paths
        .attr("class", "link unselected");

      setTimeout(function () {

        rects
          .transition()
          .duration(500)
          .attr("class", d => {

            if (selectRects1.includes(d.id)) {
              return "node selected";
            }
            else { return "node unselected"; }
          });

        paths
          .transition()
          .duration(500)
          .attr("class", d => {

            if (selectPaths0.includes(d.source.id) &&
              selectPaths1.includes(d.target.id)) {
              return "link selected";
            }
            else { return "link unselected"; }
          });

      }, 2000);

      setTimeout(function () {

        // change selection colors

        rects
          .transition()
          .duration(500)
          .attr("class", d => {

            if (selectRects2.includes(d.id)) {
              return "node selected";
            }
            else { return "node unselected"; }
          });

        paths
          .transition()
          .duration(500)
          .attr("class", d => {

            if (selectPaths1.includes(d.source.id) &&
              selectPaths2.includes(d.target.id)) {
              return "link selected";
            }
            else { return "link unselected"; }
          });

      }, 3000);

      setTimeout(function () {

        if (currentSelect !== "alaaaa") {
          currentSelect = "alaaaa";
          let selectedData = updateData(FILTER_DATA, currentSelect);
          updateSankey(selectedData);
        }

        rects
          .attr("class", d => {

            if (selectRects2.includes(d.id)) {
              return "node selected";
            }
            else { return "node unselected"; }
          });

        paths
          .attr("class", d => {

            if (selectPaths1.includes(d.source.id) &&
              selectPaths2.includes(d.target.id)) {
              return "link selected";
            }
            else { return "link unselected"; }
          });

      }, 5000);

      setTimeout(function () {

        replayButton
          .classed("hidden", false)
          .attr("xlink:href", d => "#step" + step);

      }, 6000);
    }
  }

  else if (step === 13) {

    if (direction === "up") {
      // collapsing filters incase of up-scrolling
      resetAll();
      stepFired(step, "reset");
    } else {

      // select PLA data 

      if (currentSelect !== "a1aaaa") {

        currentSelect = "a1aaaa";
        let selectedData = updateData(FILTER_DATA, currentSelect);
        updateSankey(selectedData);

      }

      // reset colors

      rects
        .attr("class", d => "node " + d.class);
      paths
        .attr("class", d => "link " + d.source.class);
    };

  }

  else if (step === 14) {


    function step14() {

      resetAll();

      select("figure")
        .style("height", "700px")
        .style("bottom", "50px");

      filters
        .classed("hidden", false)
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .style("height", "100px");
    }

    if (direction === "down") { step14(); }
    if (direction === "up") {
      filters
        .classed("hidden", true)
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .style("height", "0px");
    }

    // reset for a sticky bug if someone
    // scrolls through really fast

    setTimeout(function () {
      if (currentSelect === "alaaaa") { step14() }
    }, 10000);

  }
  else if ( step === 15 ) {

    select("figure")
      .style("height", "700px")
      .style("bottom", "50px");

    filters
      .classed("hidden", false)
      .style("opacity", 1)
      .style("height", "100px");

    rects
      .attr("class", d => "node " + d.class);
    paths
      .attr("class", d => "link " + d.source.class);


    if (currentSelect !== "anaaaa") {
      resetDropDowns();
    }

  }
}




// set diagram and dropdown selects back to defaults

function resetDropDowns() {

  currentSelect = "anaaaa";

  let selectedData = updateData(FILTER_DATA, currentSelect);

  currentRate = selectedData.gradPerc;
  currentCost = selectedData.cost;
  currentTime = selectedData.time;

  updateSankey(selectedData);

  select("#filters")
    .selectAll("select")
    .each(function () { this.selectedIndex = 0 })
}

// manage animations

function stepFired(step, action) {

  console.log(step, " trigger ", history[step], "- step ", step);

  if (action === "reset") {
    console.log("resetting step animation");
    history[step] = false;
    return true;
  }
  else if (action === "get") {
    return history[step];
  }
  else if (action === "fire") {
    if (!history[step]) {
      history[step] = true;
      return true;
    }
    else {
      return false;
    }
  }
  else {
    console.log("stepFired(" + step +
      ", " + action + ") caused error.");
  }

  return none;

}
