
var parseDate = d3.time.format("%Y").parse;

var formatDate = function(d) {
    return d.getFullYear();
};

var margin = {top: 10, right: 20, bottom: 20, left: 100},
    width = 860 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var y0 = d3.scale.ordinal()
    .rangeRoundBands([height, 0], .2);

var y1 = d3.scale.linear();

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 0);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(formatDate);

var nest = d3.nest()
    .key(function(d) { return d.group; });

var dataByGroup;

var color = d3.scale.category10();
var country_select = "United States";

var select = d3.select("#sidebar").append("div").append("select").attr('class','select').on('change', onchange);

function create_svg() {
    d3.selectAll('svg').remove();
     
    var tsvg = d3.select("#content").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    return tsvg;
}

var divtooltip = d3.select("#content")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var svg = create_svg();
var total_breakdown = {};
var medal_breakdown = {};
var medals = {};
var odata = [];
var years = {};
var sports = {};
var countries = {};
var totals = {};

function switch_country_medal(country, medals) {
  for (var c in medals) {
    if (c == country) {
        return medals[country];
      }
    }

  return {};
};

function switch_country_total(country, totals) {
  for (var c in totals) {
    if (c == country) {
      return totals[country];
    }
  }

  return {};
};

function onchange() {
    country_select = d3.select('select').property('value');
    var tmedals = switch_country_medal(country_select, medals);
    var ttotals = switch_country_total(country_select, totals);

    data = update_data(sports, years, tmedals, ttotals);
    svg = create_svg();
    
    data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.value = +d.value;
    });

    dataByGroup = nest.entries(data);

    x.domain(dataByGroup[0].values.map(function(d) { return d.date; }));

    y0.domain(dataByGroup.map(function(d) { return d.key; }));
    y1.domain([0, d3.max(data, function(d) { return d.value; })]).range([y0.rangeBand(), 0]);
  
    var group = create_group(dataByGroup, svg);
    transitionMultiples(svg);
    renderMapImg(country_select);
};

function get_total(row) {
    if (row.Country in totals) {
       if (row.Year in totals[row.Country]) {
            totals[row.Country][row.Year]++;
       }
       else {
            totals[row.Country][row.Year] = 1;
       }
    }
    else {
      totals[row.Country] = {};
      totals[row.Country][row.Year] = 1;
    }

    return totals;
};

function get_total_breakdown(row) {
    if (row.Country in total_breakdown) {
        if (row.Year in total_breakdown[row.Country]) {   
            if (row.Medal in total_breakdown[row.Country][row.Year]) {
                total_breakdown[row.Country][row.Year][row.Medal]++;
            }
            else {
                total_breakdown[row.Country][row.Year][row.Medal] = 1;
            }
        }
        else {
            total_breakdown[row.Country][row.Year] = {};
            total_breakdown[row.Country][row.Year][row.Medal] = 1;
        }
    }
    else {
      total_breakdown[row.Country] = {};
      total_breakdown[row.Country][row.Year] = {};
      total_breakdown[row.Country][row.Year][row.Medal] = 1;
    }

    return total_breakdown;
};

function get_medal_breakdown(row) {
    if (row.Country in medal_breakdown) {
        if (row.Year in medal_breakdown[row.Country]) { 
            if (row.Sport in medal_breakdown[row.Country][row.Year]) {
                if (row.Medal in medal_breakdown[row.Country][row.Year][row.Sport]) {
                   medal_breakdown[row.Country][row.Year][row.Sport][row.Medal]++;
                }
                else {
                   medal_breakdown[row.Country][row.Year][row.Sport][row.Medal] = 1;
                }
            }
            else {
                medal_breakdown[row.Country][row.Year][row.Sport] = {};
                medal_breakdown[row.Country][row.Year][row.Sport][row.Medal] = 1;
            }
        }
        else {
            medal_breakdown[row.Country][row.Year] = {};
            medal_breakdown[row.Country][row.Year][row.Sport] = {};
            medal_breakdown[row.Country][row.Year][row.Sport][row.Medal] = 1;
        }
    }
    else {
      medal_breakdown[row.Country] = {};
      medal_breakdown[row.Country][row.Year] = {};
      medal_breakdown[row.Country][row.Year][row.Sport] = {};
      medal_breakdown[row.Country][row.Year][row.Sport][row.Medal] = 1;
    }

    return medal_breakdown;
};

function get_medals(row) {
    if (row.Country in medals) {
       if (row.Sport in medals[row.Country]) {   
          if (row.Year in medals[row.Country][row.Sport]) {
              medals[row.Country][row.Sport][row.Year]++;
          }
          else {
              medals[row.Country][row.Sport][row.Year] = 1;
          }
       }
       else {
          medals[row.Country][row.Sport] = {};
          medals[row.Country][row.Sport][row.Year] = 1;
       }
    }
    else {
      medals[row.Country] = {};
      medals[row.Country][row.Sport] = {};
      medals[row.Country][row.Sport][row.Year] = 1;
    }

    return medals;
};

function transitionMultiples(svg) {
  var t = svg.transition().duration(750),
      g = t.selectAll(".group").attr("transform", function(d) { 
        return "translate(0," + y0(d.key) + ")"; 
      });

  g.selectAll("rect")
    .attr("x", function(d) { return x(d.date); })
    .attr("y", function(d) { return y1(d.value); });

  g.select(".group-label").attr("y", function(d) { return y1(d.values[0].value / 2); })
};

function get_breakdown_text(d) {
  var medal_order = ["Gold", "Silver", "Bronze"];
  var year = formatDate(d.date);
  var breakdowns = "";

  if (d.group == "Total") {
    breakdowns = total_breakdown[country_select][year];
  }
  else {
    breakdowns = medal_breakdown[country_select][year][d.group];
  }

  var toolstr = "";

  for (var i=0; i < medal_order.length; i++) {
    var m = medal_order[i];

    if (m in breakdowns) {
      toolstr += m + " " + breakdowns[m] + "<br>";
    }
  }

  return toolstr;
}

function create_group(tgroup, svg) {
  var group = svg.selectAll(".group")
      .data(tgroup)
      .enter().append("g")
      .attr("class", "group")
      .attr("transform", function(d) {
        return "translate(0," + y0(d.key) + ")"; 
      });

  group.append("text")
      .attr("class", "group-label")
      .attr("x", -20)
      .attr("y", function(d) { 
        return 10 + y1(d.values[0].value / 2); 
      })
      .attr("dy", ".05em")
      .style("text-anchor","right")
      .text(function(d) { 
        return d.key;
      });

  group.selectAll("rect")
      .data(function(d) { 
        return d.values; 
      })
      .enter().append("rect")
      .style("fill", function(d) { 
        return color(d.group); 
      })
      .attr("id", "rectid")
      .attr("x", function(d) { 
        return x(d.date); 
      })
      .attr("y", function(d) { 
        return y1(d.value);
      })
      .attr("width", x.rangeBand())
      .attr("height", function(d) { 
        return y0.rangeBand() - y1(d.value); 
      })
      .on("mouseover", function(d) {
        toolstr = get_breakdown_text(d);
        
        divtooltip.transition()
          .duration(200)
          .style("opacity", .9);

        divtooltip.html(toolstr)
        .style("left", (d3.select(this)) + "px")
        .style("top", d3.event.pageY + "px");
      })
      .on("mouseout", function(d) {
        divtooltip.transition()
        .duration(500)
        .style("opacity", 0);
      });

  group.selectAll("rectid")
      .data(function(d) {
        return d.values; 
      })
      .enter().append("text")
      .attr("x", function(d) {
        return x(d.date)+x.rangeBand()/2; 
      })
      .attr("y",function(d) {
        return y1(d.value); 
      })
      .attr("dy", ".02em")
      .text(function(d) {
        if (d.value > 0) {
          return (d.value);
        }
      });

  group.filter(function(d, i) { 
    return !i; 
  }).append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + y0.rangeBand() + ")")
    .call(xAxis);

  return group;
};

function create_nesting(total) {
  var tdata = [];

  for (var t in total) {
    tdata.push({'group':"Total",'date':t,'value':total[t]});
  }
  return tdata;
};

function update_data(sports, years, medals, totals) {
  var tdata = [];

  for (var y in years) {
    if (y in totals) {
      tdata.push({'group':"Total",'date':y,'value':totals[y]});
    }
    else {
      tdata.push({'group':"Total",'date':y,'value':0});
    }
  }

  for (var s in sports) {
    for (var y in years) {
      if (s in medals) {
        if (y in medals[s]) {
          tdata.push({'group':s,'date':y,'value':medals[s][y]});
        }
        else {
          tdata.push({'group':s,'date':y,'value':0});
        }
      }
      else {
        tdata.push({'group':s,'date':y,'value':0});
      }
    }
  }

  return tdata;
};

function renderMapImg(v_country) {
  var isvg=d3.select("#pic").append("svg")
    .attr('height',60)
    .attr('width',100)
    .append("image")
    .attr('height',60)
    .attr('width',100);
  
  d3.csv("data/flags.csv", function(data) 
  {
    data.forEach(function(d) {
      if (d.Country==v_country) {
        isvg.attr("xlink:href",d.Flag);
      }
    });
  });
};

d3.csv("./data/exercise2-olympics.csv", function(error, data) {
  data.forEach(function(d) {
    years[d.Year] = 1;
    sports[d.Sport] = 1;
    countries[d.Country] = 1;
    medal_breakdown = get_medal_breakdown(d);
    total_breakdown = get_total_breakdown(d);
    medals = get_medals(d);
    totals = get_total(d);
  });

  var tmedals = switch_country_medal(country_select, medals);
  var ttotals = switch_country_total(country_select, totals);
  data = update_data(sports, years, tmedals, ttotals);

  var ckeys = Object.keys(countries);
  countries = ckeys.sort();

  var optGroups = [{"key": "Countries", "value": countries}];

  var options = select.selectAll('optgroup')
      .data(optGroups)
      .enter()
      .append('optgroup')
      .attr('label',function (d) { return d.key; })
      .selectAll('option')
      .data(function (d) { return d.value; })
      .enter()
      .append('option')
      .attr('value', function (d) { return d; })
      .text(function (d) { return d; })
      .property("selected", function(d){ return d === country_select; })

      .on("mouseover", function(d) {
        divtooltip.transition()
          .duration(200)
          .style("opacity", .9);
          
        divtooltip.html("Countries participated in the Olympics")
        .style("left", d3.event.sourceEvent.x + "px")
        .style("top", d3.event.sourceEvent.y + "px");
      })
      .on("mouseout", function(d) {
        divtooltip.transition()
        .duration(500)
        .style("opacity", 0);
      });

  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.value = +d.value;
  });

  dataByGroup = nest.entries(data);

  x.domain(dataByGroup[0].values.map(function(d) {
    return d.date; 
  }));

  y0.domain(dataByGroup.map(function(d) { return d.key; }));
  y1.domain([0, d3.max(data, function(d) { return d.value; })]).range([y0.rangeBand(), 0]);
  
  var group = create_group(dataByGroup, svg);

  transitionMultiples(svg);
  renderMapImg(country_select);
});
