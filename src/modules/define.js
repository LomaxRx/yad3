import d3 from 'd3';
import { Chart } from './chart.js';
import { extend } from './utils.js'

export function define( type, opts ){
  if( !opts ) console.error( 'You have no render or update functions!' );
  if( !opts.render ) console.error( 'You have no render function!' );
  if( !opts.update ){
    opts.update = opts.render;
    console.warn( 'You have no update function! Update falls back to your render function.' );
  }
  opts.name = type;
  var chart = Chart(opts);

  var init = function(el, _){
    var _chart = new chart( el, _ );
    this.active.push(_chart);
    return _chart;
  };
  // shim for using charts as feature;
  init.opts = opts;
  // for runtime chart definitions with yad3.Chart
  if( this ){
    if( this[type] || this.options[type] ){
      console.warn( 'Duplicate chart name: ' + type );
      type = type + (+type.match( /\d*$/ )[0]+1);
      console.warn( 'Renamed to: ' + type );
    }

    this.options[type] = init;
    if( !opts.asOption ) this[type] = this.options[type];
  }

  return init;
}


export function include( options, newname ){
  if( options instanceof Array ){
    for( var i=0;i<options.length;i++)
      this.include( options[i], newname );
  } else {

    if( !this.options[options] ) console.error( 'No chart option named ' + options );
    var name = newname ? newname : options;
    this[name] = this.options[options];
  }
}

export function remove(chart){
  for(var i=0;i<this.active.length;i++){
    if( this.active[i] == chart ){
      chart.svg.remove();
      return this.active.splice(i,1)[0];
    }
  }
}

export function Feature( name, opts ){
  opts.name = name;
  // for runtime chart definitions with yad3.Feature
  if( this ){
    if( this.features[name] ){
      console.warn( 'Duplicate feature name: ' + name );
      name = name + (+name.match( /\d*$/ )[0]+1);
      console.warn( 'Renamed to: ' + name );
    }

    this.features[name] = opts;
    return this;
  }

  return opts;
}
