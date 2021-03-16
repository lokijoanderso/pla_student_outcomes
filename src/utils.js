// export functions

// convert strings to numbers in csv import

export function convertNumbers(data) {
  var arr = [];
  for (var idx in data) {
    var r = {};
    var row = data[idx];

    for (var [ k, val ] of Object.entries(row)) {
      r[k] = Number(val);
      if (isNaN(r[k])) {
        r[k] = val;
      }
      }
    arr.push(r);
  }

  return arr;
}


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

  // test code commented out
  // console.log("recalc data:", newData);

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

