
import { prepData, updateData, recalcNodeValues } from './utils';
import { select } from 'd3-selection';
import {
  sankey, sankeyLinkHorizontal, sankeyJustify
} from 'd3-sankey';
import { json, csv } from 'd3-fetch';
import { transition } from 'd3-transition';

// data sources

const RATE_DATA = './data/plaNodes_demog.csv';

// default starting selection

let currentSelect = 'anaaaa';

// menu indices for changing selection

const MENU_ORDER = {
  "school": 0,
  "pla": 1,
  "age": 2,
  "race": 3,
  "gender": 4,
  "income": 5,
};

// this command imports the css file, if you remove it your css wont be applied!

import './main.css';


// set the dimensions and margins of the graph

const margin = { top: 10, right: 10, bottom: 50, left: 10 },
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

    let filterData = buildFilters(data);
    let selectedData = updateData(filterData, currentSelect);

    // add sankey nodes and links

    updateSankey(selectedData);

  })
  .catch(e => {
    console.log(e);
  });


// function for creating the dropdown menus
// and swapping out the underlying data

function buildFilters(data) {

  const [menus, filters] = prepData(data);

  let menuBar = select("#filters")
    .append("div")
    .style('display', 'flex')
    .selectAll('.dropDown')
    .data(d => Object.keys(menus))
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

      let newData = updateData(filters, newSelect);
      updateSankey(newData);

      // test code commented out
      console.log(newData);
      //console.log(newSelect);
      console.log(event.target.value, row);

    })
    .selectAll('option')
    .data(d => menus[d])
    .join('option')
    .text(d => d)
    .attr('value', d => d);

  // test code commented out
  // console.log(menus);
  // console.log(filters);

  return filters;

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


  // add in the rectangles

  node.enter()
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("id", d => d.class);

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


}


