import { Chart } from '../yad3.js';
import { translate } from '../modules/utils.js';

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

export { scatter };
