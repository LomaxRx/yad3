import { Chart } from '../yad3.js';
import { translate } from '../modules/utils.js';

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
      .attr('d', function(d){ return line(d.values); });

    g.append('path')
      .attr('class','fg-line')
      .attr('d', function(d){ return line(d.values); })
      .attr('stroke',this.color);

    g.merge(this.line).selectAll('path')
      .attr('d', function(d){ return line(d.values); });

    this.line.exit().remove();

  }
});

export { multiSeriesLine };
