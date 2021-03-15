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
        "time": Number(row['time'])
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

  return updated;
}