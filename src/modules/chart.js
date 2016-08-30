// template for Charts.
// This does not follow a parent/child Class inheritance scheme
// functions more like a Chart class factory.
import d3 from 'd3';
import { Data, Dimension, Accessor, Scale, Scaler, Axis, Color, Shape, Extent, On, size } from './configurations.js';
import Feature from './feature.js';
import { extend } from './utils.js';

// chart factory
export function Chart(configs){
 function chart( el, opts ){
   if( !el ) console.error( 'Add a selector' );

   construct.call( this, chart.__config__ );
   this.configure( opts );

   this.el = el;

   if( typeof el == 'object' ) this.$el = el;
   else this.$el = document.querySelector( el );

   this.svg = d3.select( el ).append( 'svg' );
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
  this.feature = Feature(this);
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


export default { Chart, ChartProto };
