import { Chart } from '../yad3.js';
import { translate } from '../modules/utils.js';

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

export { map };
