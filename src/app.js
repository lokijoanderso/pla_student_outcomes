
import { convertNumbers, makeMenuData } from './utils';
import { select } from 'd3-selection';
import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';
import { json, csv } from 'd3-fetch';


// data sources

const NODE_DATA = './data/plaNodes.json';
const RATE_DATA = './data/plaNodes_demog.csv';


// this command imports the css file, if you remove it your css wont be applied!

import './main.css';


// set the dimensions and margins of the graph

var margin = { top: 10, right: 10, bottom: 50, left: 10 },
  width = 650 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;


// import data for dynamic rates

csv(RATE_DATA)
  .then(data => {

    let parsed = convertNumbers(data);
    buildFilters(parsed);

  })
  .catch(e => {
    console.log(e);
  });


// import data for basic sankey setup

fetch(NODE_DATA)
  .then(response => response.json())
  .then(data => {

    buildSankey(data);

  })
  .catch(e => {
    console.log(e);
});




function buildFilters(data) {

  var menus = makeMenuData(data);

  var menuBar = select("#filters")
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
    .selectAll('option')
    .data(d => menus[d])
    .join('option')
    .text(d => d)
    .attr('value', d => d);

  console.log(menus);
  console.log(data);

}


function buildSankey(data) {

  // append the svg object to the body of the page

  var svg = select("#app").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");


  // Set the sankey diagram properties

  let myVis = sankey()
    .nodeWidth(150)
    .nodePadding(2)
    .size([width, height])
    .nodeId(d => d.id)
    .nodeAlign(sankeyJustify);

  let graph = myVis(data);

  // add in the links
  let links = svg
    .append("g")
    .classed("links", true)
    .selectAll("path")
    .data(graph.links)
    .enter()
    .append("path")
    .classed("link", true)
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke-width", d => d.width)
    .attr("id", d => d.source.class);

  // add in the rectangles

  let nodes = svg
    .append("g")
    .classed("nodes", true)
    .selectAll("rect")
    .data(graph.nodes)
    .enter()
    .append("rect")
    .classed("node", true)
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("id", d => d.class);

    // add in the title for the nodes

  let labels = svg
    .append("g")
    .classed("labels", true)
    .selectAll("text")
    .data(graph.nodes)
    .enter()
    .append("text")
    .attr("y", d => ( d.y0 + (d.y1 - d.y0 )/ 2))
    .attr("x", d => ( d.x0 + (d.x1 - d.x0) / 2))
    .attr("text-anchor", "middle")
    .text(d => d.name);

  // console.log(data);
    
}


