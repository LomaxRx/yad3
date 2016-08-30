import { extend, isEmpty, clone }  from './utils.js'
import d3 from 'd3';

/*
  all the following configurations follow the same/similar pattern.

  1. constructor for a configuration object (e.g dimension) that returns as a function
  2. constructor is given a Chart context
  3. returned function takes key/value arguments that sets object's properties
  4. For configurations that need to be reset with new data (e.g. Scale),
     passing no arguments to configuration function will refresh configuration.
 [5. some times a private 'configs' object is used to define functions needed to
     refresh configurations, this saves us from cluttering the API with
     utility functions]

  //TODO: CLEAN THIS UP.
  // Define update cycle: Currently, chart automatically redraws only when
  // new data is passed. Otherwise, developer has to manually call
  // chart.draw();

*/


export function Data(context){

  function data(){
    if( !arguments.length ) return data.value;
    data.value = arguments[0];

    return context.draw();
  }

  data.value = [];
  data.isEmpty = function(){
    return data.value.length === 0;
  };

  return data;
}

export function Dimension(context){

  function dimension(){
      var self = dimension;
      if( arguments.length == 2 ){
        if(arguments[1] instanceof Object && !(arguments[1] instanceof Array))
          extend( self[arguments[0]], arguments[1] )
        else self[arguments[0]] = arguments[1];
        size(context);
        return context;
      } else if ( arguments.length ) {
        extend( self, arguments[0] );
        size(context);
        return context;
      }

      return context;
  }

  dimension.margin = {
    top: 25,
    bottom: 25,
    left: 25,
    right: 25
  };
  dimension.width = 0;
  dimension.height = 0;
  dimension.outerHeight = function(){
    return this.margin.top + this.margin.bottom + this.height;
  };
  dimension.outerWidth = function(){
    return this.margin.left + this.margin.right + this.width;
  };
  dimension.innerTranslation = function(){
    return 'translate(' + this.margin.left + ',' + this.margin.top + ')';
  };
  dimension.viewBox = function(){
    return '0 0 ' + this.outerWidth() + ' ' + this.outerHeight()
  };

  return dimension;
}

export function Accessor(context){

  function accessor(){
      var self = accessor;
      var a = arguments;
      if( a.length == 2 ){
          self[a[0]] = a[1];
          context.scaler[a[0]] = Scaler.call(context,a[0]);
          context.extent[a[0]] = [];
          return context.extent().scale();
      } else if ( arguments.length ){
        return self[a[0]];
      }

      return context;
  }

  accessor.x = function(d){ return d.x; };
  accessor.y = function(d){ return d.y; };
  accessor.nest = false;

  return accessor;
}

export function Scale(context){
  var configs = {
    x: function(s){ return s.range([0,this.dimension.width]).domain(this.extent.x); },
    y: function(s){ return s.range([this.dimension.height,0]).domain(this.extent.y); }
  };

  function scale(){
    var self = scale,
        a = arguments;

    if( a.length == 2 ){
      if( typeof a[1] == 'function' && !a[1].domain ){
        configs[a[0]] = a[1];

        if(context.isRendered)
          self[a[0]] = configs[a[0]].call(context, self[a[0]] || defaultScale());

        context.scaler[a[0]] = Scaler.call(context,a[0]);
        return context;
      }
      // passing a function refreshes scale on each update
      // passing a d3 scale keeps scale static
      configs[a[0]] = false;
      self[a[0]] = a[1];

      context.scaler[a[0]] = Scaler.call(context,a[0]);

      return context;
    }

    if ( a.length )
      return self[a[0]];

    for( var k in configs ){
      if(configs[k]){
        self[k] = configs[k].call(context, self[k] || defaultScale() );
      }
    }

    return this;
  }

  function defaultScale(){
    return d3.scaleLinear();
  }

  scale.x = defaultScale();
  scale.y = defaultScale();

  return scale;
}

export function Scaler(){
    function DNE(){
      console.warn('Either no scale or no accessor exists for this variable' );
    }
    if( arguments ){
      var s = arguments[0];
      if( !this.accessor[s] ) return DNE;
      if( !this.scale[s] ) return DNE;

      return (function(d){
        return this.scale[s](this.accessor[s](d));
      }).bind(this);

    }

    return DNE;
}

export function Shape(context){
  var configs = {
    line: function(s){
      return s.x(
        (function(d){ return this.scale.x(this.accessor.x(d)); }).bind(this)
      ).y(
        (function(d){ return this.scale.y(this.accessor.y(d)); }).bind(this)
      );
    },
    pie: function(s){ return s.value(function(d){ return this.accessor.x(d);}); }
  };

  function shape(){
    var self = shape,
        a = arguments;
    if( a.length == 2 ){
      if( typeof a[1] == 'function' && !a[1].context ){
        configs[a[0]] = a[1];
        self[a[0]] = configs[a[0]].call(context);
        return context;
      }
      self[a[0]] = a[1];
      return context;
    }

    if ( arguments.length )
      return self[k];

    for( var k in self ){
      if( !configs[k] ){
        self[k] = configs.line.call(context,self[k]);
      } else {
        self[k] = configs[k].call(context,self[k])
      }
    }

    return context;
  }

  shape.line = d3.line().curve(d3.curveBundle.beta(1));
  shape.pie = d3.pie();

  return shape;
}

export function Axis(context){
  var configs = {
    x: function(a){ return a.scale(this.scale.x); },
    y: function(a){ return a.scale(this.scale.y); }
  };

  function axis(){
    var self = axis,
        a = arguments;
    if( a.length == 2 ){
      if( typeof a[1] == 'function' && !a[1].scale ){
        configs[a[0]] = a[1];
        self[a[0]] = a[1].call(context,self[a[0]]);
        return context;
      }
      self[a[0]] = a[1];
      return context;
    }

    if( arguments.length )
      return self[k];

    for( var k in self )
      self[k] = configs[k].call(context,self[k])

    return context;
  }

  axis.x = d3.axisBottom();
  axis.y = d3.axisLeft();

  return axis;
}

export function Color(context){

  function color(){

    var self = color;
    var a = arguments;
    if( a.length == 2 ){

      if( a[0] == 'range' || a[0] == 'accessor' || a[0] == 'scale' || a[0] == 'domain' ){
        self.default[a[0]] = a[1];
        self.default.refresh();
        return context;
      }

      if(!self[a[0]])
        self[a[0]] = new ColorDef();

      for(var k in a[1])
        self[a[0]][k] = a[1][k];

      self[a[0]].refresh();

      return context;
    }

    if( a.length ){
      if(a[0] instanceof String ) return self[a[0]];
      return self.default.call(context,a[0]);
    }

    for(var k in self )
      self[k].refresh();

    return context;
  }

  color.default = new ColorDef();

  function ColorDef(){

      function _color(d){
        return _color.scale(_color.accessor(d));
      }

      _color.accessor = function(d){ return d.category };;
      _color.scale = d3.scaleOrdinal();;
      _color.domain = 'categorical';
      _color.range = function(){ return ['#d53e4f','#f46d43','#fdae61','#fee08b','#e6f598','#abdda4','#66c2a5','#3288bd']; };

      _color.refresh = function(){
        // color scale is custom function that's run each time.
        if(!_color.scale.domain) _color.scale = _color.scale.call(context);

        if(_color.domain == 'categorical')
          var d = d3.map(context.data(), _color.accessor ).keys();
        else if(_color.domain == 'continuous')
          var d = d3.extent(context.data(),_color.accessor);
        else if( _color.domain instanceof Function )
          var d = _color.domain.call(context);
        else
          var d = _color.domain;

        var r = _color.range instanceof Function ? _color.range.call(context) : _color.range;

        _color.scale.domain(d.sort()).range(r);

      }

      return _color;
  }

  return color;
}

export function Extent(context){
  function extent(){
    var self = extent;
    if( arguments.length == 1 ){
      return self[arguments[0]];
    } else {


      for( var k in context.accessor )
        if( context.accessor[k] )
          self[k] = d3.extent( this.data, context.accessor[k] );
      return context;
    }
  }

  extent.x = [];
  extent.y = [];

  return extent;
}

export function On(context){
  function on(e,callback){
    var self = on;

    if(arguments.length == 2){
      self[e] = callback.bind(context);
      return context;
    }

    if(arguments.length) return self[e]

    for(k in self)
      self[k].call(context);

    return context;
  }

  return on;

}

export function size( _chart ){
  if(!_chart.svg) return;
  var d = _chart.dimension;

  if( d.height === 0 ) d.height = _chart.$el.offsetHeight - d.margin.top - d.margin.bottom;
  if( d.width === 0 ) d.width = _chart.$el.offsetWidth - d.margin.left - d.margin.right;

  if( _chart.isResponsive )
    _chart.svg.attr( 'viewBox', d.viewBox() );
  else
    _chart.svg.attr( 'height', d.outerHeight() )
      .attr( 'width', d.outerWidth() );

  _chart.chart.attr( 'transform', _chart.dimension.innerTranslation() );
}
