export function extend(target, source) {
  for (var k in source) {
    var t = target[k];
    var s = source[k];
    if (t && s && typeof s == "object" ) {
      extend(t, s);
    } else {
      target[k] = s;
    }
  }
  return target;
};

export function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function translate(x,y){
  return 'translate(' + x + ',' + y + ')';
}

export function isEmpty(obj) {
  for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
          return false;
  }
  return true && JSON.stringify(obj) === JSON.stringify({});
}

export function clone(obj){
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    var temp = obj.constructor();
    for (var key in obj) {
        temp[key] = clone(obj[key]);
    }

    return temp;
}

export function extendGeoProperties(k,geometries,json){
  geometries.forEach(function(g){
    json.forEach(function(j){
      if( j[k] == g.properties[k] ) extend(g.properties,j);
    });
  })
}
