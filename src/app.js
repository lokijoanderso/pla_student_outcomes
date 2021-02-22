// if the data you are going to import is small, then you can import it using es6 import
// (I like to use use screaming snake case for imported json)
// import MY_DATA from './app/data/example.json'

import {myExampleUtil} from './utils';
import {select} from 'd3-selection';
// this command imports the css file, if you remove it your css wont be applied!
import './main.css';

// this is just one example of how to import data. there are lots of ways to do it!
fetch('./data/example.json')
  .then(response => response.json())
  .then(data => myVis(data))
  .catch(e => {
    console.log(e);
  });

function myVis(data) {
  const width = 5000;
  const height = (36 / 24) * width;
  console.log(data, height);
  console.log('Hi!');
  // EXAMPLE FIRST FUNCTION
  select('#app')
    .append('h1')
    .text('hi!');
}
