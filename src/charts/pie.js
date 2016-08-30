import { Chart } from '../yad3.js';
import { translate } from '../modules/utils.js';

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




export { pie };
