# yad3
Yet Another D3 Framework

## Motivation
- create a simple, un-opinionated D3 framework that allows developers to easily port visualizations from the [bl.ocks ecosystem](http://bl.ocksplorer.org/).
- don't hijack developer's ability to write D3 code for creating visualizations the way they like it, but make charts re-usable with a simple declarative API.
- separate chart rendering logic from data transformations
- separate features like axes, legends from main chart rendering

## Using a defined Chart

```javascript
  yad3.include('scatter');

  var viz = yad3.scatter('#scatter')
    .marginTop(50)
    .width(600)
    .data(data);
```

## Defining custom Chart

```javascript
yad3.Chart( 'scatter', {
  accessor: {
    r: function(d){ return d.r; },
  },
  scale: {
    r: function(){
      return d3.scaleLinear()
        .domain(this.extent.r)
        .range([10,25]);
    }
  },
  render: function(){
    this.scatterGroup = this.chart.append('g')
      .attr('class', 'scatterGroup');

    this.scatter = this.scatterGroup.selectAll('.scatter');
    this.update();
  },
  update: function(){
    this.scatter = this.scatter.data(this.data());

     this.scatter.enter().append('circle')
        .attr( 'class', 'scatter' )
        .attr( 'r', 0 )
        .attr( 'cx', this.scaler.x )
        .attr( 'cy', this.scaler.y )
        .attr( 'fill', this.color )
      .merge(this.scatter)
        .transition()
        .duration(1500)
        .attr( 'r', this.scaler.r )
        .attr( 'cx', this.scaler.x )
        .attr( 'cy', this.scaler.y );

      this.scatter.exit()
        .transition()
        .duration(1500)
        .attr('r',0)
        .remove();
  }
});
```

### yad3.Chart(_name_,_configurations:**Object**_)

when defining a Chart, you must define a `render` function and, optionally, an `update` function.

`render` functions set up any d3.selections or svg elements needed for your visualization and are run once data is made available to the Chart. `update` functions rerender chart using new data, and generally should not define new svg elements.

all functions that you define in your configurations are run within the Chart's scope.

it's good to keep a consistent naming convention so that the Chart or Feature's name corresponds to some d3.selection or function that you define for the Chart (e.g. a Chart named 'scatter' defines a viz.scatter d3.selection).

see [configurations](#configurations)

### yad3.Feature(_name_,_configurations:**Object**_)

defining features is useful for organizing secondary chart elements like axes or legend. defining a feature is identical to defining a Chart, taking `render` and `update` functions as properties. you also set configurations (see [configurations](#configurations)), however, these configurations overwrite the parent Chart's configurations, so be careful!

after defining a feature, you must add it to the Chart `viz.feature(yad3.features.featureName);`

```javascript
yad3.Feature('xAxis',{
  axis: {
    x: function(){
      return d3.axisBottom().range(this.extent.x).domain([0,this.width()]);
    }
  },
  render: function(){
    // this binds xAxis as property of viz
    this.xAxis = this.svg.append('g')
      .attr( 'class', 'x axis' )
      .call(this.axis.x);
  },
  update: function(){
    // we defined axis : x with a function that is refreshed on update
    this.xAxis.transition().duration(1000).call(this.axis.x);
  }
});

// add feature to viz
viz.feature(yad3.features.xAxis);
```

### yad3.include(_name:**String|Array**_)

to avoid namespacing conflicts, Charts aren't available until you include them

## properties

### viz.draw()

after updating configurations, refresh and update visualization

### viz.svg

d3.selection of svg element

### viz.chart

d3.selection of group element translated by margin left and margin right

### viz.extent

static property that defines the extent for each [accessor](#accessor) you define. by default yad3 defines an x and y accessor

```javascript
  var data = [
    { animal: 'duck', populationSize: 50 },
    { animal: 'cow', populationSize: 250 },
    { animal: 'dog', populationSize: 900 }
  ];

  viz.bar('#viz')
    .accessor('x', function(d){ return d.populationSize; })
    .data(data);

  var xExtent = viz.extent.x; // [50,900]
```

### viz.scaler(_datum:**Object**_)

convenience function for scaling data. this requires a consistent naming convention for your scales and accessors

```javascript
 viz.scale('x', d3.scaleLinear() )
  .accessor('x', function(d){ return d.x; })
  .data(data);

 var d = { animal: 'monkey', populationSize: 100 };

 viz.scaler.x(d); // == viz.scale.x( viz.accessor.x(d) );

```

<div id="configurations"></div>
## configurations
configurations work as you would expect with d3. passing no parameters returns the property's value, passing a key/value sets property value.

Generally, each configuration gives you static access to the property you set:
```javascript
var xAccessor = function(d){ return d.x; }

viz.accessor('x', xAccessor )
shouldEqual( viz.accessor.x, xAccessor );
```

### viz.data(_data:**Array**_)

bind new data to visualization. this forces a refresh of all configurations and redraws visualization.

### viz.dimension(_dimension:**Object**_)

```javascript
viz.dimension({
  height: 500,
  margin: {
    top: 100
  }
});
```

#### viz.width(_value:**Integer**_)

#### viz.height(_value:**Integer**_)

#### viz.margin(_margin:**Object**_)

#### viz.marginLeft(_value:**Integer**_)

#### viz.marginRight(_value:**Integer**_)

#### viz.marginTop(_value:**Integer**_)

#### viz.marginBottom(_value:**Integer**_)

### viz.dimension.outerWidth()

convenience function for viz's left and right margin + width

### viz.dimension.outerHeight()

convenience function for viz's top and bottom margin + height

### viz.dimension.innerTranslation()

returns string for xy transformation
`translate(x,y)`

### viz.dimension.viewBox()

returns string for viz's width/height viewBox

<div id="accessor"></div>
### viz.accessor()

Accessors play a big role in maintaining scales, shapes, and color configurations. simply swapping out accessor is a good way to create toggles for your visualizations.

```javascript
document.getElementById('selectionToggle').addEventListener('change', function(){
  var k = this.value;
  viz.accessor('x', function(d){ return d[k]; }).draw();
}, false);
```

**default accessors**
#### viz.accessor.x
`function(d){ return d.x; }`

#### viz.accessor.y
`function(d){ return d.y; }`

### **Update cycle configs**

the following configurations are refreshed during the update cycle.
you can define these configurations either dynamically or statically by using a constant or a function.

```javascript
// static
viz.scale('x', d3.scaleLinear().range([0,100]).domain([0,100]));
// dynamic
viz.scale('x', function(){
  // scale will refresh with current data's extent
  return d3.scaleLinear().range(this.extent.y).domain(this.extent.x);
});
```

### viz.scale()

like [accessor](#accessor), set static or dynamic d3.scale

## default scales
##### viz.scale.x
```javascript
function(){
  return d3.scaleLinear()
    .range([0,this.width()])
    .domain(this.extent.x);
  });
```

##### viz.scale.y
```javascript
function(){
  return d3.scaleLinear()
    .range([0,this.height()])
    .domain(this.extent.y);
  });
```

### viz.color(_property:**String**,value:**Object|String**_)

by default, `viz.color` sets the properties for `viz.color.default`.

**scale** _default: d3.scaleOrdinal()_
no need to define a scale function. just pass static d3.scale (e.g. `d3.scaleOrdinal()`)

**accessor** _default: function(d){ return d.category; }_

**range**
set color range values as array. can be static or dynamic.

**domain** see [viz.color.domain](#vizColorDomain)

<div id="vizColorDomain"></div>
#### viz.color.domain
You can define a static or dynamic domain by setting a constant or a function. You can also set domain as 'categorical' or 'continuous'

**categorical** _(default)_  
setting domain to categorical sets color domain to unique map of all input values. input values are defined by the color's accessor function.

**continuous**  
setting domain to continuous sets color domain to the minimum and maximum extent of input values. input values are defined by the color's accessor function.


### viz.color(_name:**String**,configurations:**Object**_)

you can define multiple color functions for different variables

```javascript
viz.color('populationSize',{
  scale: d3.scaleOrdinal(),
  range: ['#d53e4f','#f46d43','#fdae61','#fee08b'],
  domain: 'categorial', // unique map
  accessor: function(d){ return d.animal; }
});

viz.color.populationSize(d)
```

### viz.shape()

like [accessor](#accessor), set static or dynamic d3.shapes

### viz.axis()

like [accessor](#accessor), set static or dynamic d3.axis

## events

events for modifying chart instance after render. useful for binding mouse events to chart elements

### render

```javascript
viz.on('render', function(){ /** do something **/ });
```

### update
