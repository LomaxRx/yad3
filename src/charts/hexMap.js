import { Chart } from '../yad3.js';
import { translate } from '../modules/utils.js';

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

export { hexMap };