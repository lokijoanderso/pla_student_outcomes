// example of how to export functions
// this particular util only doubles a value so it shouldn't be too useful

export function myExampleUtil(x) {
  return x * 2;
}

// convert strings to numbers in CSV import

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

// create unique menus for text values in array

export function makeMenuData(data) {
  var menus = {};
  for (var idx in data) {

    var row = data[idx];

    for (var [k, val] of Object.entries(row)) {

      if (isNaN(val) && isNaN(k)) {

        if (!(Object.keys(menus).includes(k))) {
          menus[k] = [ val ];
        }
        else if (Array.isArray(menus[k]) &&
          !(menus[k].includes(val))) {
            menus[k].push(val);
          }
      }
    }
  }
  return menus;
}