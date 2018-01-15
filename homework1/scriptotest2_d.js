
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
var country_select = "";
//var country_select = "United States";

var select = d3.select("#sidebar").append("div").append("select").attr('class','select').on('change', onchange);

var divtooltip = d3.select("#content")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function create_svg() {
    d3.selectAll('svg').remove();
     
    var tsvg = d3.select("#content").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
              .attr("style", "outline: thin solid #e5e5e5;");

    return tsvg;
}

var svg = create_svg();

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
    //d3.select('body').append('p').text(country_select + ' is the last selected option.');
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
      .attr("x", -10)
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
        divtooltip.transition()
          .duration(200)
          .style("opacity", .9);
        divtooltip.html("Number of medals won")
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
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

d3.csv("./data/exercise2-olympics.csv", function(error, data) {
  data.forEach(function(d) {
    years[d.Year] = 1;
    sports[d.Sport] = 1;
    countries[d.Country] = 1;

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
      .text(function (d) { return d; });
      //.property("selected", function(d){ return d === country_select; });

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
});