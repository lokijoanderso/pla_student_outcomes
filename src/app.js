
import {
  prepData, updateData,
  recalcNodeValues,
  tooltipText
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


// set the dimensions and margins of the graph

const margin = { top: 10, right: 10, bottom: 0, left: 10 },
  width = 650 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


// append the svg object to the body of the page

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
      // 1. update height of step elements
      //var stepH = Math.floor(window.innerHeight * 0.75);
      //step.style("height", stepH + "px");

      //var figureHeight = window.innerHeight / 2;
      //var figureMarginTop = (window.innerHeight - figureHeight) / 2;

      var stepH = 850;
      step.style("height", stepH + "px");

      var figureHeight = 600;
      var figureMarginTop = 150;

      figure
        .style("height", figureHeight + "px")
        .style("top", figureMarginTop + "px");

      // 3. tell scrollama to update new element dimensions
      scroller.resize();
    }

    // scrollama event handlers
    function handleStepEnter(response) {
      console.log(response);
      // response = { element, direction, index }

      // add color to current step only
      step.classed("is-active", function (d, i) {
        return i === response.index;
      });

      // update graphic based on step
      figure.select("p").text(response.index + 1);

      // function to change chart

      setVisForStep(response.index + 1, response.direction);

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
          offset: 0.20,
          debug: true
        })
        .onStepEnter(handleStepEnter);

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
    .style('display', 'flex')
    .selectAll('.dropDown')
    .data(d => Object.keys(MENU_OPTS))
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
    .size([width, height])
    .nodeId(d => d.id)
    .nodeAlign(sankeyJustify);

  let graph = myVis(data);

  var t = transition()
    .duration(750);

  // add in the links 
  let links = svg
    .selectAll("g .links")
    .join("g .links");

  let link = links
    .selectAll("path")
    .data(graph.links);

  link.enter()
    .append("path")
    .classed("link", true)
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke-width", d => d.width)
    .attr("id", d => d.source.class);

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
      d => d.id)
    .classed("node", true);

  // div for the tooltip

  var div = select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // add in the rectangles

  node.enter()
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("id", d => d.class)
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
    .attr("height", d => d.y1 - d.y0);

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

  var ratesGrad = select(".grad")
    .text("" + (data.gradPerc * 100).toFixed(0) + "%");

  var ratesCost = select(".cost")
    .text("$" + Math.round(data.cost, 0)
      .toLocaleString('en-US'));

  var ratesTime = select(".time")
      .text("" + data.time.toFixed(1));



  console.log("new grad rate:", data.gradPerc);
  console.log("new cost:", data.cost);
  console.log("new time:", data.time); 


}

function setVisForStep(step, direction) {

  let filters = select("#filters");

  if (step === 4) {

    currentSelect = "anaaaa";

    let selectedData = updateData(FILTER_DATA, currentSelect);

    updateSankey(selectedData);

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

  if (step === 3) {

    if (direction === "up") {

      filters
        .classed("hidden", false)
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .style("height", "0px");
    }

  }
}