// export functions


// create unique menu listings and filterable json links

export function prepData(data) {
  let menus = {};
  let filters = {};
  
  for (var idx in data) {

    var row = data[idx];
    let filterIndex = '';

    for (var [k, val] of Object.entries(row)) {

      if (isNaN(val) && isNaN(k)) {

        filterIndex = filterIndex + val[0]

        if (!(Object.keys(menus).includes(k))) {
          menus[k] = [val];
        }
        else if (Array.isArray(menus[k]) &&
          !(menus[k].includes(val))) {
          menus[k].push(val);
        }
      }
    }

    let linkData = {

        "links": [
          {
            "source": 0, "target": 4,
            "value": Number(row['for-profit to for-profit'])
          },
          {
            "source": 0, "target": 5,
            "value": Number(row['for-profit to private non-profit'])
          },
          {
            "source": 0, "target": 6,
            "value": Number(row['for-profit to 2-year public'])
          },
          {
            "source": 0, "target": 7,
            "value": Number(row['for-profit to 4-year public'])
          },
          {
            "source": 0, "target": 8,
            "value": Number(row['for-profit to non-transfer'])
          },
          {
            "source": 1, "target": 4,
            "value": Number(row['private non-profit to for-profit'])
          },
          {
            "source": 1, "target": 5,
            "value": Number(row['private non-profit to private non-profit'])
          },
          {
            "source": 1, "target": 6,
            "value": Number(row['private non-profit to 2-year public'])
          },
          {
            "source": 1, "target": 7,
            "value": Number(row['private non-profit to 4-year public'])
          },
          {
            "source": 1, "target": 8,
            "value": Number(row['private non-profit to non-transfer'])
          },
          {
            "source": 2, "target": 4,
            "value": Number(row['2-year public to for-profit'])
          },
          {
            "source": 2, "target": 5,
            "value": Number(row['2-year public to private non-profit'])
          },
          {
            "source": 2, "target": 6,
            "value": Number(row['2-year public to 2-year public'])
          },
          {
            "source": 2, "target": 7,
            "value": Number(row['2-year public to 4-year public'])
          },
          {
            "source": 2, "target": 8,
            "value": Number(row['2-year public to non-transfer'])
          },
          {
            "source": 3, "target": 4,
            "value": Number(row['4-year public to for-profit'])
          },
          {
            "source": 3, "target": 5,
            "value": Number(row['4-year public to private non-profit'])
          },
          {
            "source": 3, "target": 6,
            "value": Number(row['4-year public to 2-year public'])
          },
          {
            "source": 3, "target": 7,
            "value": Number(row['4-year public to 4-year public'])
          },
          {
            "source": 3, "target": 8,
            "value": Number(row['4-year public to non-transfer'])
          },
          {
            "source": 4, "target": 9,
            "value": Number(row['for-profit to non-completers'])
          },
          {
            "source": 5, "target": 9,
            "value": Number(row['private non-profit to non-completers'])
          },
          {
            "source": 6, "target": 9,
            "value": Number(row['2-year public to non-completers'])
          },
          {
            "source": 7, "target": 9,
            "value": Number(row['4-year public to non-completers'])
          },
          {
            "source": 8, "target": 9,
            "value": Number(row['non-transfer to non-completers'])
          },
          {
            "source": 4, "target": 10,
            "value": Number(row['for-profit to graduates'])
          },
          {
            "source": 5, "target": 10,
            "value": Number(row['private non-profit to graduates'])
          },
          {
            "source": 6, "target": 10,
            "value": Number(row['2-year public to graduates'])
          },
          {
            "source": 7, "target": 10,
            "value": Number(row['4-year public to graduates'])
          },
          {
            "source": 8, "target": 10,
            "value": Number(row['non-transfer to graduates'])
        }],

      "cost": Number(row['cost']),
      "time": Number(row['time']),
      "gradPerc": Number(row['non-transfer to graduates']) +
        Number(row['4-year public to graduates']) +
        Number(row['2-year public to graduates']) +
        Number(row['private non-profit to graduates']) +
        Number(row['for-profit to graduates'])

      };

      filters[filterIndex] = linkData;

  }
  return [ menus, filters ];
}


// splice node and filtered link value data together

export function updateData(data, selection) {

  let updated = {
    "nodes": [
      { "id": 0, "name": "for-profit", "class": "fp" },
      { "id": 1, "name": "private non-profit", "class": "priv" },
      { "id": 2, "name": "2-year public", "class": "pub2" },
      { "id": 3, "name": "4-year public", "class": "pub4" },
      { "id": 4, "name": "for-profit", "class": "fp" },
      { "id": 5, "name": "private non-profit", "class": "priv" },
      { "id": 6, "name": "2-year public", "class": "pub2" },
      { "id": 7, "name": "4-year public", "class": "pub4" },
      { "id": 8, "name": "non-transfer", "class": "nontran" },
      { "id": 9, "name": "non-completers", "class": "nongrad" },
      { "id": 10, "name": "graduates", "class": "grad" }],
  }

  updated['links'] = data[selection]['links'];
  updated['time'] = data[selection]['time'];
  updated['cost'] = data[selection]['cost'];
  updated['gradPerc'] = data[selection]['gradPerc'];

  return updated;
}


// manually reestablishing node values from links

export function recalcNodeValues(data) {

  let newData = {};

  let newNodes = [];
  let nodeCount = 0;

  for (var [k, v] of Object.entries(data)) {

    if (k === "links") {
      newData["links"] = v;

      for (var l of data["links"]){
        
        if (l.source.id === nodeCount) {
          newNodes.push(l.source);
          nodeCount = nodeCount + 1;
        }
        if (l.target.id === nodeCount) {
          newNodes.push(l.target);
          nodeCount = nodeCount + 1;
        }

        if (nodeCount === 11) { break; }

        };
      }

    else if (k === "time") {
      newData["time"] = v;
    }
    else if (k === "cost") {
      newData["cost"] = v;
    }
    else if (k === "gradPerc") {
      newData["gradPerc"] = v;
    }

  }

  newData["nodes"] = newNodes;

  return newData;

  }



// create text for tooltips

export function tooltipText(data) {

  let percFormatted = (data.value * 100).toFixed(0);

  if (data.id <= 3) {
    return "<p> " +
      percFormatted + "% of students start at a " +
      data.name + "</p> ";
  }
  else if (data.id === 10) {
    return "<p> " +
      percFormatted + "% of students earn a bachelor's degree" +
      "</p> ";
  }
  else if (data.id === 9) {
    return "<p> " +
      percFormatted + "% of students don't complete a bachelor's degree" +
      " </p> ";
  }
  else if (data.id === 8) {
    return "<p> " +
      percFormatted + "% of students don't transfer" +
      "</p> ";
  }
  else {
    return "<p> " +
      percFormatted + "% of students transfer to a " +
      data.name + "</p> <p id='sub'> (they may transfer more than once) </p> ";
  }

}

export function tooltipsPathText(data) {

  let from = data.source.class;
  let to = data.target.class;
  let rate = (data.value * 100).toFixed(1);

  return "<p> " + rate + "% of students <br />" + from + "  >> " +
    to + "</p>";

}

export function makeTitleText(currentSelection) {


  let title = ["Bachelor's Degree Outcomes for ",];

  // mix and match bits
  let opts = {
    "default": "US College Students",
    "sa": "All ",
    "s2": "Public 2-Year Students ",
    "s4": "Public 4-Year Students ",
    "sp": "Private Nonprofit Students ",
    "sf": "For-Profit Students ",
    "pl": "with PLA Credits",
    "p1": "with over 15 PLA Credits",
    "ao": "Students Older than 24 ",
    "a1": "Students Between 18 and 24 ",
    "rB": "Black Students ",
    "rH": "Hispanic Students ",
    "rW": "White Students ",
    "gf": "Female Students ",
    "gm": "Male Students ",
    "il": "Lower Income Students ",
    "im": "Higher Income Students "
  };

  if (currentSelection === "anaaaa") {

    title.push(opts["sa"]);
    title.push(opts["default"]);

  }
  else if (currentSelection.match(/a/gi) &&
    currentSelection.match(/a/gi).length === 4) {

    let optMatch = {
      0: "s",
      2: "a",
      3: "r",
      4: "g",
      5: "i"
    };

    for (var i = 0; i < 7; i++) {

      if (i !== 1 &&
        currentSelection.slice(i, i + 1) !== "a") {

        title.push(opts[optMatch[i] +
          currentSelection.slice(i, i + 1)])

      }
    }
  }
  else {
    if (currentSelection.slice(0, 1) === "a" &&
      currentSelection.slice(2, 6) === "aaaa") {
      title.push(opts["sa"] + "Students ");
    }
    else {
      title.push("Your Customized Demographic ");}
  }

  if (currentSelection.slice(1, 2) !== "n") {
    title .push(opts["pl"])
  }

  return title.join("");

}



// svg collection for project

export function renderSVG(choice) {

  let svgCollection = {

    "arrow": "M23.677 18.52c.914 " +
      "1.523-.183 3.472-1.967 3.472h-19.414c-1.784 " +
      "0-2.881-1.949-1.967-3.472l9.709-16.18c.891-1.483 3.041-1.48 " +
      "3.93 0l9.709 16.18z",

    "replay": "M13.5 2c-5.621 0-10.211 " +
      "4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 " +
      "3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 " +
      "6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 " +
      "2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z",

  };

  if (svgCollection[choice]) {
    return svgCollection[choice];
  } else { return false; }

}