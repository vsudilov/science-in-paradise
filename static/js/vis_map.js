function vis_map(data){

  //Analyze input dataset to set proper limits/scales on the visualization
  var colors = d3.scale.category20()
  var categories = {}

  $.each(data,function(index,v){
    if ( !(v.category in categories) ) {
      categories[v.category] = {color: colors(Object.keys(categories).length)}
    }
  })

  var daterange = [d3.min(data,function(d){return d.date}),d3.max(data, function(d){return d.date})]

  var rscale = d3.scale.linear()
    .domain([d3.min(data,function(d){return d.duration}),d3.max(data, function(d){return d.duration})])
    .range([1500,5500])
    .nice();
  //

  //jquery-ui slider setup
  $( "#year-slider" ).slider({
    range: true,
    min: daterange[0],
    max: daterange[1],
    values: daterange,
    change: function (event, ui ){
      var newVisData = []
      $.each(data,function(index,v) {
        var n = [ui.values[0],ui.values[1]]
        if (v.date >= n[0] && v.date <= n[1]) {
          newVisData.push(v)
        }
      })
      updateVis(newVisData)
    },
    slide: function( event, ui ) {
      $( "#slider-label-text" ).val( ui.values.join(' - ') );
    }
  });
    //Set the initial values outside of change, so we don't have to put null checking logic in the event handler
  $( "#slider-label-text" ).val( daterange.join(' - '))
  //


  var width = 256*5, //5 tiles of 256 pixels each.
      //width = Math.max(960, window.innerWidth*0.8),
      height = Math.max(500, window.innerHeight);

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
  bubbles.enter()
      .append("g")
        .attr("transform",function(d){return "translate("+projection([d.lng,d.lat])+")scale("+projection.scale()+")"})
        .attr("class","bubble")

  var circles = bubbles.append("circle")
      .attr("fill",function(d) {return categories[d.category].color})
        
  // var text = bubbles.append("text")
  //      .attr("text-anchor","middle")
  //      //.attr("transform", 'translate(0,-18)')
  //      .attr('fill','red')
  //      .attr('font-size',10)
  //      .text(function(d) {
  //        return d.name;
  //      });

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
      .attr('r', function(d) { return Math.sqrt(rscale(d.duration))/zoom.scale()})

    // text
    //   .attr('font-size',100/zoom.scale())

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

  function updateVis(newVisData) {

    var bg = bubbleG.selectAll('.bubble')
      .data(newVisData)
    
    var exit = bg.exit()
    exit.transition().duration(500)
      .selectAll("circle")
      .attr("r",1e-5)
    exit.transition().delay(500).remove()

    var enter = bg.enter()
      .append("g")
        .attr("transform",function(d){return "translate("+projection([d.lng,d.lat])+")scale("+projection.scale()+")"})
        .attr("class","bubble")

    var c = enter.append("circle")
      .attr("fill",function(d) {return categories[d.category].color})
      .attr("r",1e-5)    
      .transition().duration(550)
      .attr("r", function(d) { return Math.sqrt(rscale(d.duration))/zoom.scale()})

          // b.append("circle")
    //     .transition()
    //     .duration(750)
    //     .attr('r', function(d) { return Math.sqrt(rscale(d.duration))/zoom.scale()})
    //     .attr("fill",function(d) {return categories[d.category].color})


    // b
    //   .exit()
    //   .remove()

    // b.append("circle")
    //     .transition()
    //     .duration(750)
    //     .attr('r', function(d) { return Math.sqrt(rscale(d.duration))/zoom.scale()})
    //     .attr("fill",function(d) {return categories[d.category].color})
  }
}