
import {
  prepData, updateData,
  recalcNodeValues,
  tooltipText,
  makeTitleText
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
  width = 800 - margin.left - margin.right,
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

      var stepH = 500;
      var shortH = 200;
      var lastStepH = 700;

      let shortSteps = [8, 9, 10, 11, 14];

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

      // console.log(response);

      var el = select(response.element);
      var classes = el.attr("class");

      if (classes === "step") {

        // add color to current step only

        step.classed("is-active", function (d, i) {
          return i === response.index;
        });

        // figure.select("p").text(response.index + 1);

      }

      // function to change chart

      setVisForStep(response.index + 1,
        response.progress);

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
          progress: true
        })
        .onStepProgress(handleStepProgress);

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

  var ratesGrad = select(".rate")
    .text("" + (data.gradPerc * 100).toFixed(0) + "%");

  var ratesCost = select(".cost")
    .text("$" + Math.round(data.cost, 0)
      .toLocaleString('en-US'));

  var ratesTime = select(".time")
    .text("" + data.time.toFixed(1));

  // update the chart title

  select("#titles")
    .select("h3")
    .text(makeTitleText(currentSelect));


  console.log("new grad rate:", data.gradPerc);
  console.log("new cost:", data.cost);
  console.log("new time:", data.time); 


}

function setVisForStep(step, progress) {

  let filters = select("#filters");

  let rects = select("#app")
    .select("svg")
    .selectAll("rect");

  let paths = select("#app")
    .select("svg")
    .selectAll("path");


  if (step === 1) {

    if (currentSelect !== "anaaaa") {
      resetDropDowns()
    }

    // reset selection colors
    rects
      .attr("class", d => "node " + d.class);

    paths
      .attr("class", d => "link " + d.source.class);

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

  }

  else if (step === 3) {


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

  }
  else if (step === 4) {

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

  }
  else if (step === 5) {

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
  }

  else if (step === 6) {

    let pv_rate = updateData(FILTER_DATA, "pnaaaa");
    let cc_rate = updateData(FILTER_DATA, "2naaaa");

    // reset data

    if (progress < 0.2 &&
      currentSelect !== "anaaaa") {
      resetDropDowns();
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

    if (progress >= 0.20 &&
      currentSelect !== "2naaaa") {

      currentSelect = "pnaaaa";
      updateSankey(pv_rate);

      setTimeout(function () {

        currentSelect = "2naaaa";
        updateSankey(cc_rate);

      }, 3500)
    }
  }

  else if (step === 7) {

    let pla1 = updateData(FILTER_DATA, "anaaaa");
    let pla2 = updateData(FILTER_DATA, "alaaaa");

    // revert data 

    if (progress < 0.20 &&
      currentSelect !== "anaaaa") {
      resetDropDowns();
    }

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

    if (progress >= 0.20 &&
      currentSelect !== "alaaaa") {
      currentSelect = "anaaaa";
      updateSankey(pla1);

      setTimeout(function () {
        currentSelect = "alaaaa";
        updateSankey(pla2);
      }, 3500);
    }
  }
  else if (step === 8) {

    let old1 = updateData(FILTER_DATA, "anoaaa");
    let old2 = updateData(FILTER_DATA, "aloaaa");


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

    if (progress < 0.5 &&
      currentSelect !== "anaaaa") {
      resetDropDowns();
    }

    if (progress >= 0.5 &&
      currentSelect !== "aloaaa") {
      currentSelect = "anoaaa";
      updateSankey(old1);

      setTimeout(function () {
        currentSelect = "aloaaa";
        updateSankey(old2);
      }, 3000);
    }
  }
  else if (step === 9) {

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

    if (progress >= 0.5 &&
      currentSelect !== "alaaal") {
      currentSelect = "anaaal";
      updateSankey(inc1);

      setTimeout(function () {
        currentSelect = "alaaal";
        updateSankey(inc2);
      }, 3000);
    }
  }
  else if (step === 10) {

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
  
    if (progress >= 0.5 &&
      currentSelect !== "alaHaa") {
    currentSelect = "anaHaa";
    updateSankey(hisp1);

    setTimeout(function () {
      currentSelect = "alaHaa";
      updateSankey(hisp2);
    }, 3000);
  }
  }
  else if (step === 11) {

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

    if (progress >= 0.5 &&
      currentSelect !== "2laaaa") {
      currentSelect = "2naaaa";
      updateSankey(cc1);

      setTimeout(function () {
        currentSelect = "2laaaa";
        updateSankey(cc2);
      }, 3000)
    }
  }

  else if (step === 12) {

    // funky selection combos for later

    var selectRects1 = [0, 2, 5, 7];
    var selectRects2 = [0, 2, 5, 7, 10];
    var selectPaths0 = [0, 2];
    var selectPaths1 = selectRects1;
    var selectPaths2 = [5, 7, 10];

    // progress triggers

    if (progress <= 0.45 &&
      currentSelect !== "anaaaa") {
      resetDropDowns();
    }

    if (progress < 0.15) {

      // reset colors

      rects
        .attr("class", d => "node " + d.class);
      paths
        .attr("class", d => "link " + d.source.class);
    }

    if (progress >= 0.15 && progress < 0.25) {

      // change selection colors 

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

    }
    if (progress >= 0.25 && progress < 0.35) {

      // change selection colors

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

    }
    if (progress >= 0.35 && progress < 0.45) {

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

    }

    if (progress >= 0.45) {

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

      }

    }

  else if (step === 13) {

    // collapsing filters incase of up-scrolling

      filters
        .classed("hidden", false)
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .style("height", "0px");

    
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

  }

  else if (step === 14 &&
    progress >= 0.1) {

    select("figure")
      .style("height", "700px")
      .style("bottom", "50px");

    filters
      .classed("hidden", false)
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .style("height", "100px");

    resetDropDowns();

    rects
      .attr("class", d => "node " + d.class);
    paths
      .attr("class", d => "link " + d.source.class);

  }
}




// set diagram and dropdown selects back to defaults

function resetDropDowns() {

  currentSelect = "anaaaa";

  let selectedData = updateData(FILTER_DATA, currentSelect);

  updateSankey(selectedData);

  select("#filters")
    .selectAll("select")
    .each(function () { this.selectedIndex = 0 })
}

