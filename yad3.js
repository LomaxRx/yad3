(function (exports,d3$1) {
  'use strict';

  d3$1 = 'default' in d3$1 ? d3$1['default'] : d3$1;

  function extend(target, source) {
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

  function addCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function translate(x,y){
    return 'translate(' + x + ',' + y + ')';
  }

  /**
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
  **/

  function Data(context){

    function data(){
      if( !arguments.length ) return data.value;
      data.value = arguments[0];

      return context.draw();
    }

    data.value = [];
    data.isEmpty = function(){
      return data.value.length === 0;
    };

    data.flatten = function(){
      if( !context.accessor.nest ) return data.value;
      var d = [];
      data.value.forEach(function(_d){
        _d = context.accessor.nest(_d);
        if( _d instanceof Array )
          d = d.concat(_d);
        else if( typeof _d == 'object' )
          d.push(_d);
        else return false;
      });
      return d;
    }

    return data;
  }

  function Dimension(context){

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

  function Accessor(context){

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

  function Scale(context){
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
      return d3$1.scaleLinear();
    }

    scale.x = defaultScale();
    scale.y = defaultScale();

    return scale;
  }

  function Scaler(){
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

  function Shape(context){
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

    shape.line = d3$1.line().curve(d3$1.curveBundle.beta(1));
    shape.pie = d3$1.pie();

    return shape;
  }

  function Axis(context){
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

    axis.x = d3$1.axisBottom();
    axis.y = d3$1.axisLeft();

    return axis;
  }

  function Color(context){

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
        _color.scale = d3$1.scaleOrdinal();;
        _color.domain = 'categorical';
        _color.range = function(){ return ['#d53e4f','#f46d43','#fdae61','#fee08b','#e6f598','#abdda4','#66c2a5','#3288bd']; };

        _color.refresh = function(){
          // color scale is custom function that's run each time.
          if(!_color.scale.domain) _color.scale = _color.scale.call(context);

          if(_color.domain == 'categorical')
            var d = d3$1.map(context.data(), _color.accessor ).keys();
          else if(_color.domain == 'continuous')
            var d = d3$1.extent(context.data(),_color.accessor);
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

  function Extent(context){
    function extent(){
      var self = extent;
      if( arguments.length == 1 ){
        return self[arguments[0]];
      } else {
        var d = context.data.flatten();

        for( var k in context.accessor )
          if( context.accessor[k] )
            self[k] = d3$1.extent( d, context.accessor[k] );
        return context;
      }
    }

    extent.x = [];
    extent.y = [];

    return extent;
  }

  function On(context){
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

  function size( _chart ){
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

  function Feature$1(context){
    function constructor(opts,transform){

      this.isRendered = false;
      this.configure(opts);

      if(!opts.render) throw new Error( 'Your feature needs to have render function defined!' );
      this.render = opts.render.bind(context);

      if(opts.update)
        this.update = opts.update.bind(context);
      else
        this.update = function(){};

      if(transform)
        this.data = function(){
          return transform(context.data());
        };

      this.draw = function(){
        if(this.isRendered){
          this.update();
        } else {
          this.render();
          this.isRendered = true;
        }
      }

      return this;
    }

    constructor.prototype = context;

    function feature(_opts){

      var self = feature;
      if(arguments.length){
        // shim for using Chart as Feature;
        var opts = _opts.opts || _opts;
        self[opts.name] = new constructor(opts,arguments[1]);
        if(context.isRendered) self[opts.name].draw();
        return context;
      }

      for(var k in self )
        self[k].draw();

      return context;
    }

    return feature

  }

  // chart factory
  function Chart$1(configs){
   function chart( el, opts ){
     if( !el ) console.error( 'Add a selector' );

     construct.call( this, chart.__config__ );
     this.configure( opts );

     this.el = el;

     if( typeof el == 'object' ) this.$el = el;
     else this.$el = document.querySelector( el );

     this.svg = d3$1.select( el ).append( 'svg' );
     this.chart = this.svg.append( 'g' )
      .attr('id','innerChart');

     size( this );

    }

    chart.__config__ = configs;

    return chart;
  }

  // configure chart
  function construct(opts){
    this.isRendered = false;
    this.isResponsive = true;

    this.svg = null;
    this.chart = null;

    this.render = opts.render;
    this.update = opts.update;

    this.data = Data(this);
    this.extent = Extent(this);
    this.dimension = Dimension(this);
    //convenience
    this.height = function(v){ if(!arguments.length) return this.dimension.height; this.dimension('height',v); return this; }
    this.width = function(v){ if(!arguments.length) return this.dimension.width; this.dimension('width',v); return this; }
    this.margin = function(v){ if(!arguments.length) return this.dimension.margin; this.dimension('margin',v); return this; }
    this.marginTop = function(v){ if(!arguments.length) return this.dimension.margin.top; this.dimension('margin', {top: v}); return this; }
    this.marginBottom = function(v){ if(!arguments.length) return this.dimension.margin.bottom; this.dimension('margin',{bottom:v}); return this; }
    this.marginLeft = function(v){ if(!arguments.length) return this.dimension.margin.left; this.dimension('margin',{left:v}); return this; }
    this.marginRight = function(v){ if(!arguments.length) return this.dimension.margin.right; this.dimension('margin',{right:v}); return this; }

    this.accessor = Accessor(this);
    this.scale = Scale(this);
    this.axis = Axis(this);
    this.shape = Shape(this);
    this.color = Color(this);
    this.feature = Feature$1(this);
    this.on = On(this);

    this.scaler = {
      x: Scaler.call(this,'x'),
      y: Scaler.call(this,'y')
    };

    this.configure = function(_){
      if( !_ ) return this;

      if(_.accessor)
        setEachWith( _.accessor, this.accessor );

      if(_.scale)
        setEachWith(  _.scale, this.scale );

      if(_.shape)
        setEachWith( _.shape, this.shape );

      if(_.axis)
        setEachWith( _.axis, this.axis );

      if(_.color)
        setEachWith( _.color, this.color );

      if(_.dimension)
        this.dimension(_.dimension);

      return this;
    };

    this.refresh = function(){
      return this.extent().scale().shape().color().axis().feature();
    };

    this.draw = function(){
      if( this.isRendered && !this.data.isEmpty() ){
          this.refresh()
              .update();
          if(this.on.update) this.on.update();
      } else if( !this.data.isEmpty() ){
          this.refresh()
              .render();
          this.isRendered = true;
          if(this.on.render) this.on.render();
          if(this.on.update) this.on.update();
      }

      return this;
    }

    if(opts) this.configure(opts);

    return this;
  };


  // target has defined setter function like
  // fn( key, value )
  // source is configuration object:
  // { k: v, k2: v2 ... }
  function setEachWith( source, targetFn ){
    for( var k in source )
      targetFn( k, source[k] );
  }

  function Chart( type, opts ){
    if( !opts ) console.error( 'You have no render or update functions!' );
    if( !opts.render ) console.error( 'You have no render function!' );
    if( !opts.update ){
      opts.update = opts.render;
      console.warn( 'You have no update function! Update falls back to your render function.' );
    }
    opts.name = type;
    var chart = Chart$1(opts);

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


  function include( options, newname ){
    if( options instanceof Array ){
      for( var i=0;i<options.length;i++)
        this.include( options[i], newname );
    } else {

      if( !this.options[options] ) console.error( 'No chart option named ' + options );
      var name = newname ? newname : options;
      this[name] = this.options[options];
    }
  }

  function remove(chart){
    for(var i=0;i<this.active.length;i++){
      if( this.active[i] == chart ){
        chart.svg.remove();
        return this.active.splice(i,1)[0];
      }
    }
  }

  function Feature( name, opts ){
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

  var scatter = Chart( 'scatter', {
    accessor: {
      r: function(d){ return d.r || 5; },
    },
    scale: {
      r: function(){
        return d3.scaleLinear().range([10,25]).domain(this.extent.r);
      }
    },
    color: {
      accessor: function(d){ return d.cat; }
    },
    render: function(){
      this.plots = this.chart.append('g')
        .attr('class', 'plots');

      this.update();
    },
    update: function(){
      this.plot = this.plots.selectAll('.plot')
        .data(this.data());
      this.plot.exit()
        // // .transition()
        // // .duration(1500)
        // .attr('r',0)
        .remove();

      this.plot.enter().append('circle')
        .attr('fill-opacity',0.5)
        .attr( 'r', this.scaler.r )
        .attr( 'cx', this.scaler.x )
        .attr( 'cy', (function(d){
          if(d.race=='white') return 0;
          return this.dimension.height;
        }).bind(this))
      .merge(this.plot)
        .attr( 'class', function(d){
          return d.state + ' plot year' + d.x;
        })
        .attr( 'fill', this.color )
        .transition().duration(500)
        .delay(function(d,i){return i/3})
        .attr( 'r', this.scaler.r )
        .attr( 'cx', this.scaler.x )
        .attr( 'cy', this.scaler.y );
    }
  });

  var pie = Chart( 'pie',{
    accessor:{
      pieValue: function(d){
        return d.pieValue;
      }
    },
    color: {
      accessor: function(d){
        return d.category || d.data.category;
      }
    },
    shape: {
      pie: function(){
        return d3.pie().sort(null)
          .value(this.accessor.pieValue);
      }
    },
    render: function(){
      this.pie = this.chart.append('g')
        .attr('id', 'pie')
        .attr( 'transform', translate(this.dimension.width/2,this.dimension.width/2));

      var r = d3.min([this.dimension.width/2,this.dimension.height/2]);
      var arc = d3.arc().innerRadius(r-150).outerRadius(r-100);

      this.arcTween = function(d){
        this._current = this._current || d;
        var interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(0);
        return function(t) {
          return arc(interpolate(t));
        };
      }

      this.update();

    },
    update: function(){
      var data = this.shape.pie(this.data());

      this.arcs = this.pie.selectAll('.arc')
        .data(data);

      this.arcs.enter().append('path')
        .attr('class', 'arc')
      .merge(this.arcs)
        .transition()
        .duration(1500)
        .attr('fill',this.color)
        .attrTween('d', this.arcTween );

      this.arcs.exit().remove();

    }
  });

  var map = Chart('map',{
    scale: {
      projection: function(){
        return d3.geoAlbersUsa()
          .scale(1000)
          .translate([this.width()/2,this.height()/2]);
      }
    },
    shape: {
      path: function(){
        return d3.geoPath().projection(this.scale.projection);
      }
    },
    render: function(){

      this.boundaries = this.chart.append('g')
        .attr('id', 'boundaries')
        .selectAll('path')
        // do your topo transformation elswhere
        .data(this.data())
        .enter().append('path')
        .attr('d',this.shape.path)
        .attr('fill',this.color.default);
    },
    update: function(){

    }
  });

  var hexMap = Chart('hexMap',{
    render: function(){
      this.svg.remove();
      var hex = document.createElement('div');
      hex.innerHTML = hexMapSvg();
      this.svg = d3.select(hex).select('svg');
      this.$el.appendChild(this.svg.node());
      this.chart = this.svg.select('#polygons')
        .attr('transform',translate(this.marginLeft(),this.marginTop())+'scale(0.8)');
      this.states = this.svg.selectAll('#polygons g');

      var data = this.data();

      this.states
        .attr('class','state-group')
        .each(function(){
          var id = this.getAttribute('id');
          for(var i=0; i<data.length;i++){
            var d = data[i];
            if(d.code != id && d.state != id) continue;
            var t = d3.select(this);
            d.originalTranslation = t.attr( 'transform' );
            d.box = t.node().getBBox();
            t.datum(d).selectAll('polygon,text').datum(d);
          }
        });

      this.states.selectAll('text')
        .attr('text-anchor','middle')
        .attr('dy','0.5em')
        .attr('transform', function(d){
          return translate(d.box.width/2,d.box.height/2);
        });
    },
    update: function(){

    }
  });


  function hexMapSvg(){
    return '<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="states" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="68 89.5 503 264.5" enable-background="new 68 89.5 503 264.5" xml:space="preserve"><g id="polygons"><g id="VT" transform="translate(477.5,122.69999694824219)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.1 0,28.6 0,9.6 16.5,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 12.6165 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">VT</text></g><g id="WA" transform="translate(138.6999969482422,153.8000030517578)"><polygon fill="#B3B3B3" points="33,29.1 16.5,38.8 0,29.1 0,9.7 16.5,0 33,9.7 "/><text transform="matrix(1 0 0 1 11.7788 22.4)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">WA</text></g><g id="MT" transform="translate(174.39999389648438,153.8000030517578)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.1685 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">MT</text></g><g id="ND" transform="translate(210.10000610351562,153.8000030517578)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.167 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">ND</text></g><g id="MN" transform="translate(245.8000030517578,153.8000030517578)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 11.8345 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">MN</text></g><g id="WI" transform="translate(281.5,153.8000030517578)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.835 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">WI</text></g><g id="MI" transform="translate(353,153.8000030517578)"><polygon fill="#B3B3B3" points="32.9,28.6 16.4,38.2 0,28.6 0,9.6 16.4,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 13.1175 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">MI</text></g><g id="NY" transform="translate(424.3999938964844,153.8000030517578)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 12.2825 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">NY</text></g><g id="MA" transform="translate(460.1000061035156,153.8000030517578)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 11.95 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">MA</text></g><g id="OR" transform="translate(120.9000015258789,184.89999389648438)"><polygon fill="#B3B3B3" points="32.9,28.7 16.4,38.2 0,28.7 0,9.6 16.4,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 11.95 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">OR</text></g><g id="ID" transform="translate(156.60000610351562,184.89999389648438)"><polygon fill="#B3B3B3" points="32.9,28.7 16.4,38.2 0,28.7 0,9.6 16.4,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 13.45 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">ID</text></g><g id="WY" transform="translate(192.3000030517578,184.89999389648438)"><polygon fill="#B3B3B3" points="32.9,28.7 16.5,38.2 0,28.7 0,9.6 16.5,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 11.6175 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">WY</text></g><g id="SD" transform="translate(228,184.89999389648438)"><polygon fill="#B3B3B3" points="32.9,28.7 16.5,38.2 0,28.7 0,9.6 16.5,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 12.2825 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">SD</text></g><g id="IA" transform="translate(263.70001220703125,184.89999389648438)"><polygon fill="#B3B3B3" points="33,28.7 16.5,38.2 0,28.7 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 13.6655 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">IA</text></g><g id="IL" transform="translate(299.3999938964844,184.89999389648438)"><polygon fill="#B3B3B3" points="33,28.7 16.5,38.2 0,28.7 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 13.998 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">IL</text></g><g id="IN" transform="translate(335.1000061035156,184.89999389648438)"><polygon fill="#B3B3B3" points="33,28.7 16.5,38.2 0,28.7 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 13.5 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">IN</text></g><g id="OH" transform="translate(370.79998779296875,184.89999389648438)"><polygon fill="#B3B3B3" points="33,28.7 16.5,38.2 0,28.7 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">OH</text></g><g id="PA" transform="translate(406.5,184.89999389648438)"><polygon fill="#B3B3B3" points="33,28.7 16.5,38.2 0,28.7 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.7207 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">PA</text></g><g id="NJ" transform="translate(442.20001220703125,184.89999389648438)"><polygon fill="#B3B3B3" points="33,28.7 16.5,38.2 0,28.7 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.8335 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">NJ</text></g><g id="CA" transform="translate(138.6999969482422,216.10000610351562)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12.3325 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">CA</text></g><g id="NV" transform="translate(174.39999389648438,216.10000610351562)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12.3325 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">NV</text></g><g id="CT" transform="translate(477.8999938964844,184.89999389648438)"><polygon fill="#B3B3B3" points="33,28.7 16.5,38.2 0,28.7 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.501 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">CT</text></g><g id="CO" transform="translate(209.5,216.10000610351562)"><polygon fill="#B3B3B3" points="33.3,28.2 17.1,38.1 0.4,29 0,9.9 16.2,0 32.9,9.2 "/><text transform="matrix(1 0 0 1 12.15 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">CO</text></g><g id="NE" transform="translate(245.39999389648438,216.10000610351562)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 32.9,9.5 "/><text transform="matrix(1 0 0 1 12.2825 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">NE</text></g><g id="MO" transform="translate(281.1000061035156,216.10000610351562)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 32.9,9.5 "/><text transform="matrix(1 0 0 1 11.6175 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">MO</text></g><g id="KY" transform="translate(316.79998779296875,216.10000610351562)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12.498 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">KY</text></g><g id="WV" transform="translate(352.5,216.10000610351562)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 11.6675 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">WV</text></g><g id="VA" transform="translate(388.20001220703125,216.10000610351562)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12.7207 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">VA</text></g><g id="MD" transform="translate(423.8999938964844,216.10000610351562)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 11.8345 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">MD</text></g><g id="UT" transform="translate(192.3000030517578,246.8000030517578)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 32.9,9.5 "/><text transform="matrix(1 0 0 1 12.451 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">UT</text></g><g id="NM" transform="translate(228,246.8000030517578)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 32.9,9.5 "/><text transform="matrix(1 0 0 1 11.7845 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">NM</text></g><g id="KS" transform="translate(263.70001220703125,246.8000030517578)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12.498 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">KS</text></g><g id="AR" transform="translate(299.3999938964844,246.8000030517578)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12.3325 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">AR</text></g><g id="TN" transform="translate(335.1000061035156,246.8000030517578)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12.501 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">TN</text></g><g id="NC" transform="translate(370.79998779296875,246.8000030517578)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12.167 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">NC</text></g><g id="SC" transform="translate(406.5,246.8000030517578)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12.3325 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">SC</text></g><g id="ME" transform="translate(532.4000244140625,92.5)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 33,9.5 "/><text transform="matrix(1 0 0 1 12 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">ME</text></g><g id="NH" transform="translate(513.5999755859375,122.69999694824219)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.167 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">NH</text></g><g id="RI" transform="translate(495.70001220703125,153.8000030517578)"><polygon fill="#B3B3B3" points="33.1,28.5 16.8,38.2 0.2,28.8 0,9.7 16.4,0 33,9.4 "/><text transform="matrix(1 0 0 1 13.55 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">RI</text></g><g id="DE" transform="translate(460.1000061035156,216.10000610351562)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.1 0,28.6 0,9.5 16.5,0 32.9,9.5 "/><text transform="matrix(1 0 0 1 12.2825 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">DE</text></g><g id="AZ" transform="translate(210.10000610351562,277.3999938964844)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.6665 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">AZ</text></g><g id="OK" transform="translate(245.8000030517578,277.3999938964844)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.1655 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">OK</text></g><g id="LA" transform="translate(281.5,277.3999938964844)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.8306 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">LA</text></g><g id="MS" transform="translate(317.29998779296875,277.3999938964844)"><polygon fill="#B3B3B3" points="32.9,28.6 16.4,38.2 0,28.6 0,9.6 16.4,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 11.95 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">MS</text></g><g id="AL" transform="translate(353,277.3999938964844)"><polygon fill="#B3B3B3" points="32.9,28.6 16.4,38.2 0,28.6 0,9.6 16.4,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 12.7806 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">AL</text></g><g id="GA" transform="translate(388.70001220703125,277.3999938964844)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 12.1155 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">GA</text></g><g id="TX" transform="translate(263.5,308.6000061035156)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.1 0,28.6 0,9.6 16.5,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 12.6165 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">TX</text></g><g id="FL" transform="translate(370.79998779296875,308.1000061035156)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.1 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.999 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">FL</text></g><g id="DC" transform="translate(462.3999938964844,266.8999938964844)"><polygon fill="#B3B3B3" points="32.9,28.6 16.5,38.1 0,28.6 0,9.6 16.5,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 12.117 22.05)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">DC</text></g><g id="AK" transform="translate(92,104.80000305175781)"><polygon fill="#B3B3B3" points="33,28.6 16.5,38.2 0,28.6 0,9.6 16.5,0 33,9.6 "/><text transform="matrix(1 0 0 1 12.498 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">AK</text></g><g id="HI" transform="translate(74.19999694824219,292.5)"><polygon fill="#B3B3B3" points="32.9,28.6 16.4,38.2 0,28.6 0,9.6 16.4,0 32.9,9.6 "/><text transform="matrix(1 0 0 1 13.45 22.1)" fill="#FFFFFF" font-family="\'ArialMT\'" font-size="6">HI</text></g></g></svg>';

  }

  var multiSeriesLine = Chart( 'multiSeriesLine', {
    accessor: {
      nest: function(d){ return d.values; }
    },
    color: {
      accessor: function(d){ return d.key }
    },
    render: function(){
      this.lines = this.chart.append('g')
        .attr('class', 'lines');

      this.update();
    },
    update: function(){
      var line = this.shape.line;
      this.line = this.lines.selectAll('.line')
        .data(this.data());

      var g = this.line.enter().append('g')
        .attr('class', 'line');

      g.append('path')
        .attr('class','bg-line')
        //.transition()
        //.duration(500)
        .attr('d', function(d){ return line(d.values); });
    //    .attr('stroke',this.color);

      g.append('path')
        .attr('class','fg-line')
        .attr('d', function(d){ return line(d.values); })
        .attr('stroke',this.color);

      g.merge(this.line).selectAll('path')
        .attr('d', function(d){ return line(d.values); });

      this.line.exit().remove();

    }
  });

  var axes = Feature('axes',{
      axis: {
        y: function(d){
          return d3.axisRight(this.scale.y)
            .tickSize(this.dimension.width)
            .tickFormat( d3.format('.0%') );
        },
        x: function(d){
          return d3.axisTop(this.scale.x)
            .tickSize(this.dimension.height+10)
            .tickFormat( d3.format( '.0f' ) );
        }
      },
      render: function(){
        this.yAxis = this.chart.append('g')
          .attr('class', 'y axis')
          .call(this.axis.y);
        this.yAxis.selectAll('text')
          .attr('dx', 15 );
      //    .attr('transform', translate(this.dimension.width,0));

        this.xAxis = this.chart.append('g')
          .attr('class', 'x axis')
          .attr('transform', translate(0,this.dimension.height-10))
          .call(this.axis.x);

      //  this.update();
      },
      update: function(){
        this.yAxis.transition().duration(1000).call(this.axis.y);
        this.yAxis.selectAll('text')
          .attr('dx', 15 );
        this.xAxis.transition().call(this.axis.x);
      }

    });

  var options = {
    scatter: scatter,
    pie: pie,
    map: map,
    hexMap: hexMap,
    multiSeriesLine: multiSeriesLine
  };

  var features = {
    axes: axes
  };

  var active = [];

  exports.options = options;
  exports.active = active;
  exports.features = features;
  exports.Chart = Chart;
  exports.include = include;
  exports.remove = remove;
  exports.Feature = Feature;
  exports.commify = addCommas;
  exports.translate = translate;

}((this.yad3 = this.yad3 || {}),d3));