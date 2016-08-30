  import { Feature } from '../yad3.js';
  import { translate } from '../modules/utils.js';

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

  export { axes };
