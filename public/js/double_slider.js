
// https://github.com/kbroman/d3examples/blob/master/d3doubleslider/double_slider.js
// Generated by CoffeeScript 1.12.5
var double_slider;

double_slider = function(chartOpts) {
  var buttoncolor, buttondotcolor, buttondotsize, buttonround, buttonsize, buttonstroke, chart, height, margin, nticks, rectcolor, rectheight, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, slider_svg, stopindex, textsize, tickgap, tickheight, ticks, value, width;
  if (chartOpts == null) {
    chartOpts = {};
  }
  width = (ref = chartOpts != null ? chartOpts.width : void 0) != null ? ref : 800;
  height = (ref1 = chartOpts != null ? chartOpts.height : void 0) != null ? ref1 : 80;
  margin = (ref2 = chartOpts != null ? chartOpts.margin : void 0) != null ? ref2 : 25;
  rectheight = (ref3 = chartOpts != null ? chartOpts.rectheight : void 0) != null ? ref3 : 10;
  rectcolor = (ref4 = chartOpts != null ? chartOpts.rectcolor : void 0) != null ? ref4 : "#ccc";
  buttonsize = (ref5 = chartOpts != null ? chartOpts.buttonsize : void 0) != null ? ref5 : rectheight * 2;
  buttoncolor = (ref6 = chartOpts != null ? chartOpts.buttoncolor : void 0) != null ? ref6 : "#eee";
  buttonstroke = (ref7 = chartOpts != null ? chartOpts.buttonstroke : void 0) != null ? ref7 : "black";
  buttonround = (ref8 = chartOpts != null ? chartOpts.buttonround : void 0) != null ? ref8 : buttonsize * 0.2;
  buttondotcolor = (ref9 = chartOpts != null ? chartOpts.buttondotcolor : void 0) != null ? ref9 : ["slateblue", "orchid"];
  buttondotsize = (ref10 = chartOpts != null ? chartOpts.buttondotsize : void 0) != null ? ref10 : buttonsize / 4;
  tickheight = (ref11 = chartOpts != null ? chartOpts.tickheight : void 0) != null ? ref11 : 10;
  tickgap = (ref12 = chartOpts != null ? chartOpts.tickgap : void 0) != null ? ref12 : tickheight / 2;
  textsize = (ref13 = chartOpts != null ? chartOpts.textsize : void 0) != null ? ref13 : 14;
  nticks = (ref14 = chartOpts != null ? chartOpts.nticks : void 0) != null ? ref14 : 5;
  ticks = (ref15 = chartOpts != null ? chartOpts.ticks : void 0) != null ? ref15 : null;
  value = [0, 0];
  stopindex = [0, 0];
  slider_svg = null;
  if (!Array.isArray(buttoncolor)) {
    buttoncolor = [buttoncolor, buttoncolor];
  }
  if (!Array.isArray(buttonstroke)) {
    buttonstroke = [buttonstroke, buttonstroke];
  }
  if (!Array.isArray(buttondotcolor)) {
    buttondotcolor = [buttondotcolor, buttondotcolor];
  }
  chart = function(selection, callback1, callback2, range, stops) {
    var buttons, callbacks, clamp_pixels, dragged, end_drag, nearest_stop, start_drag, xcscale, xscale;
    callbacks = [callback1, callback2];
    if (range == null) {
      range = [margin, width - margin * 2];
    }
    if (stops != null) {
      stopindex = [0, 1].map(function(i) {
        return Math.floor(Math.random() * stops.length);
      });
      value = stopindex.map(function(i) {
        return stops[i];
      });
    } else {
      value = [0, 1].map(function(i) {
        return (range[1] - range[0]) * Math.random() + range[0];
      });
    }
    slider_svg = selection.insert("svg").attr("height", height).attr("width", width);
    xcscale = d3.scaleLinear().range([margin, width - margin]).domain(range).clamp(true);
    xscale = function(d) {
      if (stops != null) {
        return xcscale(stops[nearest_stop(d)]);
      }
      return xcscale(d);
    };
    nearest_stop = function(d) {
      var abs_diff;
      abs_diff = stops.map(function(val) {
        return Math.abs(val - d);
      });
      return abs_diff.indexOf(d3.min(abs_diff));
    };
    clamp_pixels = function(pixels, interval) {
      if (pixels < interval[0]) {
        return interval[0];
      }
      if (pixels > interval[1]) {
        return interval[1];
      }
      return pixels;
    };
    slider_svg.insert("rect").attr("x", margin).attr("y", height / 2 - rectheight / 2).attr("rx", rectheight * 0.3).attr("ry", rectheight * 0.3).attr("width", width - margin * 2).attr("height", rectheight).attr("fill", rectcolor);
    if (ticks == null) {
      ticks = xcscale.ticks(nticks);
    }
    slider_svg.selectAll("empty").data(ticks).enter().insert("line").attr("x1", function(d) {
      return xcscale(d);
    }).attr("x2", function(d) {
      return xcscale(d);
    }).attr("y1", height / 2 + rectheight / 2 + tickgap).attr("y2", height / 2 + rectheight / 2 + tickgap + tickheight).attr("stroke", "black").attr("shape-rendering", "crispEdges");
    slider_svg.selectAll("empty").data(ticks).enter().insert("text").attr("x", function(d) {
      return xcscale(d);
    }).attr("y", height / 2 + rectheight / 2 + tickgap * 2 + tickheight).text(function(d) {
      return d;
    }).style("font-size", textsize).style("dominant-baseline", "hanging").style("text-anchor", "middle").style("pointer-events", "none").style("-webkit-user-select", "none").style("-moz-user-select", "none").style("-ms-user-select", "none");
    buttons = [0, 1].map(function(i) {
      return slider_svg.insert("g").attr("id", "button" + (i + 1)).attr("transform", function(d) {
        return "translate(" + xscale(value[i]) + ",0)";
      });
    });
    [0, 1].map(function(i) {
      buttons[i].insert("rect").attr("x", -buttonsize / 2).attr("y", height / 2 - buttonsize / 2).attr("height", buttonsize).attr("width", buttonsize).attr("rx", buttonround).attr("ry", buttonround).attr("stroke", buttonstroke[i]).attr("stroke-width", 2).attr("fill", buttoncolor[i]);
      return buttons[i].insert("circle").attr("cx", 0).attr("cy", height / 2).attr("r", buttondotsize).attr("fill", buttondotcolor[i]);
    });
    start_drag = function(i) {
      return function(d) {
        return buttons[i].raise();
      };
    };
    dragged = function(i) {
      return function(d) {
        var clamped_pixels, pixel_value;
        pixel_value = d3.event.x - margin;
        clamped_pixels = clamp_pixels(pixel_value, [0, width - margin * 2]);
        value[i] = xcscale.invert(clamped_pixels + margin);
        d3.select(this).attr("transform", "translate(" + xcscale(value[i]) + ",0)");
        if (stops != null) {
          stopindex[i] = nearest_stop(value[i]);
          value[i] = stops[stopindex[i]];
        }
        if (callbacks[i] != null) {
          return callbacks[i](chart);
        }
      };
    };
    end_drag = function(i) {
      return function(d) {
        var clamped_pixels, pixel_value;
        pixel_value = d3.event.x - margin;
        clamped_pixels = clamp_pixels(pixel_value, [0, width - margin * 2]);
        value[i] = xcscale.invert(clamped_pixels + margin);
        if (stops != null) {
          stopindex[i] = nearest_stop(value[i]);
          value[i] = stops[stopindex[i]];
        }
        if (callbacks[i] != null) {
          callbacks[i](chart);
        }
        return d3.select(this).attr("transform", "translate(" + xcscale(value[i]) + ",0)");
      };
    };
    return [0, 1].map(function(i) {
      buttons[i].call(d3.drag().on("start", start_drag(i)).on("drag", dragged(i)).on("end", end_drag(i)));
      if (callbacks[i] != null) {
        return callbacks[i](chart);
      }
    });
  };
  chart.value = function() {
    return value;
  };
  chart.stopindex = function() {
    return stopindex;
  };
  chart.remove = function() {
    return slider_svg.remove();
  };
  return chart;
};