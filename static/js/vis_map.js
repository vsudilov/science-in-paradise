function vis_map(data){
  var width = Math.max(960, window.innerWidth*0.8),
      height = Math.max(500, window.innerHeight);

  width = 256*5;
  var tile = d3.geo.tile()
      .size([width, height]);

  var projection = d3.geo.mercator()
      //.scale((1 << 12) / 2 / Math.PI)
      .scale(200)
      .translate([width / 2, height / 2]);

  var center = projection([0, 0]);

  var zoom = d3.behavior.zoom()
      .scale(projection.scale() * 2 * Math.PI)
      .scaleExtent([1 << 9, 1 << 16])
      .translate([width - center[0], height - center[1]])
      .on("zoom", zoomed);

  // With the center computed, now adjust the projection such that
  // it uses the zoom behavior’s translate and scale.
  projection
      .scale(1 / 2 / Math.PI)
      .translate([0, 0]);

  var svg = d3.select("#svg-container-vis_map").append("svg")
      .attr("class",'map')
      .attr("width", width)
      .attr("height", height);

  var raster = svg.append("g");

  var bubbleG = svg.append("g")
      .attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");

  var bubbles = bubbleG.selectAll(".bubble")
      .data(data)
      .enter()
      .append("g")
        .attr("transform",function(d){return "translate("+projection([d.lng,d.lat])+")scale("+projection.scale()+")"})
        .attr("class","bubble")

  var circles = bubbles.append("circle")
      .attr("fill",'blue')
        
  var text = bubbles.append("text")
       .attr("text-anchor","middle")
       //.attr("transform", 'translate(0,-18)')
       .attr('fill','red')
       .attr('font-size',10)
       .text(function(d) {
         return d.name;
       });


  svg.call(zoom)
  zoomed()

  function zoomed() {
    var tiles = tile
        .scale(zoom.scale())
        .translate(zoom.translate())
        ();

    bubbleG
     .attr("transform",function(d){return "translate("+zoom.translate()+")scale("+zoom.scale()+")"})
          
    circles
      .attr('r', 50/zoom.scale())

    text
      .attr('font-size',100/zoom.scale())

    var image = raster
        .attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")")
      .selectAll("image")
        .data(tiles, function(d) { return d; });

    image.exit()
        .remove();

    image.enter().append("image")
//        .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/examples.map-vyofok3q/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
        .attr("xlink:href", function(d) { return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tile.stamen.com/toner/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
        .attr("width", 1)
        .attr("height", 1)
        .attr("x", function(d) { return d[0]; })
        .attr("y", function(d) { return d[1]; });
  }
}