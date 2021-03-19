# Prior Learning Assessment Data Visualization
## Dynamic Project Final: An Interactive Sankey Diagram
### CAPP 30239 - Data Visualization for Policy Analysis - Winter 2021

by Kelsey Anderson
[kjanderson@uchicago.edu](mailto:kjanderson@uchicago.edu)

## Live project page: 
[https://lokijoanderso.github.io/pla_student_outcomes/](https://lokijoanderso.github.io/pla_student_outcomes/)

## Notes
This is in some ways still a work in progress. You'll find the original assignment readme text at the bottom for context. That may some day go away.

### Learning d3
Much of this project was about struggling to learn d3 and javascript while attempting to make a visually appealing data presentation. I'm still working out some kinks.
The longer animated sequences tend to be laggy if the reader isn't scrolling at exactly the right pace (kinda slow...).

### The Data
One of my team members suggested I put a link to download my data file that runs this tangle of connected lines. I love that idea, but would like to write out some methodology notes and clean up my python code to include that in this repo. The stuff behind the sankey is in a very particular aggregated node-to-node form and it's very much good for 
anything but making some kind of flow mapping.
Ideally I could then post the original data sets, code to translate them for this project and an explanation of what it all means. That seems more useful. It's on the to do list.

## Thanks!
I appreciate you reading my blathering.
More content and less commentary pending. ^_^


## ---------------------------

# Dynamic Project Scaffold

In this folder I've provided an example project that enables you to use modern javascript tooling with as little effort as possible. This scaffold includes

- a dev server that combines javascript modules and presents them to the browser. This comes with autoreload for free! It's great.
- linters and autoformaters so you'll be able to check if your writing well styled javascript code. I have some pretty strong linting in here. You can disable them if you want, but you'll be judged.



## Setup

Make sure you have npm/node/yarn installed.

```sh
npm install
# then
npm run start

# or if yarn-ing
yarn
# then
yarn start
```


You will need to be explicit about your imports, eg
```js
import {functionFromModule} from 'target-module';
```

In this scaffold I have not installed any d3 packages. Some helpful ones (read the ones I usually end up using) are d3-selection, d3-scale, and d3-shape. To add one of these packages just do

```sh
npm install --save PACKAGENAME

# or if yarning
yarn add PACKAGENAME
```


## Usage

Development:

Step 1: Do all of your work in src. There is no step 2.

Production:

There are currently two easy ways to deploy this scaffold onto the internet.  

### Netlify

Netlify is an excellent company that tries to make the dev process as easy as possible. The way you deploy this scaffold there is get an account, start a new project, point it to the relevant github folder (that contains just this scaffold!), set the build command to be 'yarn build' and that's it.


### GH Pages

gh-pages is a wonderful resource for doing web-development, and allows you to have classy YOU_PERSONAL_DOMAIN/projectname type links. You can deploy this scaffold there by running 'yarn build' in your command line, commiting the modified file, and push to github. If you've configured your projects settings correct it should all just work out.