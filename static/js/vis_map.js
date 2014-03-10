function vis_map (data) {

  //var scale = d3.scale.log()
    //.domain(d3.extent(data, function(d) {return d.hits}))
    //.range([3, 10]);


  // function move() {
  //   var t = d3.event.translate,
  //       s = d3.event.scale;
  //   t[0] = Math.min(width / 2 * (s - 1), Math.max(width / 2 * (1 - s), t[0]));
  //   t[1] = Math.min(height / 2 * (s - 1) + 230 * s, Math.max(height / 2 * (1 - s) - 230 * s, t[1]));
  //   zoom.translate(t);
  //   g.style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
  // }


  // var zoom = d3.behavior.zoom()
  //   .scaleExtent([1, 8])
  //   .on("zoom", move);


  $.each(data, function (index,datapoint) {
//    datapoint.radius = scale(datapoint.hits)
    datapoint.radius = 1.5
    if ('GoogleMapsResponse' in datapoint){
      datapoint.latitude = datapoint.GoogleMapsResponse.results[0].geometry.location.lat
      datapoint.longitude = datapoint.GoogleMapsResponse.results[0].geometry.location.lng
    } else {
      datapoint.latitude = undefined
      datapoint.longitude = undefined
    }
    datapoint.fillKey = 'bubbleFill'
  });


  var Map = new Datamap({
    element: $('.svg-container-vis_map')[0],
    scope: 'world',
    geographyConfig: {
      popupOnHover: false,
      highlightOnHover: false
    },
    fills: {
      defaultFill: '#ABDDA4', //the keys in this object map to the "fillKey" of [data] or [bubbles]
      bubbleFill : 'blue',
    },  
    data: {
      "bubbleFill": {fillKey:"bubbleFill"},
    },
    done: function(datamap) {
      datamap.svg.selectAll('.datamaps-subunits').on('click',function () {
        console.log("clicked")
        //Zoom functionality here via datamap.setProjection
        //Won't be operable with d3 crunching cx/cy after render...Cut data down might help...?
      })
    }
  });

  Map.bubbles(data,{
    popupTemplate:function (geography, data) {
      return ['<div class="hoverinfo"><strong>' + data.location + '</strong>',
      '</div>'].join('');
    },
    borderWidth: 0.5,
    borderColor: '#FFFFFF',
    popupOnHover: true,
  })
}; //end startVis
