
from bokeh.io import curdoc
import numpy as np
import pandas as pd
from bokeh.plotting import figure, show, output_file
from bokeh.sampledata.us_counties import data as counties
from bokeh.io import show
from bokeh.models import ColumnDataSource, HoverTool, LogColorMapper, ColorBar, LogTicker
from bokeh.palettes import Viridis6 as palette
from bokeh.layouts import column, row, widgetbox
from bokeh.models import CustomJS, Slider, Toggle

import warnings
warnings.filterwarnings('ignore')

palette.reverse()

virus_file = "./data/West_Nile_Virus_by_County.json"
virusdf = pd.read_json(virus_file).set_index('County')

included = ["ca"]

counties = {
    code: county for code, county in counties.items() if county["state"] in included
}

county_xs = [county["lons"] for county in counties.values()]
county_ys = [county["lats"] for county in counties.values()]

county_names = [county['name'] for county in counties.values()]

cases_per_years = {}

def get_cases(counties, year):
    cases_reported = []

    for county_id in counties:
        if counties[county_id]["state"] not in included:
            continue
        try:
            countyid = county_id[0] * 1000 + county_id[1]
            cases = virusdf[(virusdf['id'] == countyid) & (virusdf['Year'] == year)]['Positive_Cases'].sum()

            if np.isnan(cases):
                cases = 0

            cases_reported.append(cases)
        except KeyError:
            dummy = 1
            
    return cases_reported


color_mapper = LogColorMapper(palette=palette)
minyear = virusdf["Year"].min()
maxyear = virusdf["Year"].max()
init_year = minyear

for y in np.arange(minyear, maxyear+1):
    cases_per_years[str(y)] = get_cases(counties, y)

data = dict(x=county_xs, y=county_ys, name=county_names, cases=cases_per_years[str(init_year)], **cases_per_years)
source = ColumnDataSource(data)

TOOLS = "pan,wheel_zoom,reset,hover,save"

p = figure(
    title="West Nile Virus in California", tools=TOOLS,
    x_axis_location=None, y_axis_location=None,
    plot_width=1100, plot_height=1000
)

p.grid.grid_line_color = None

p.patches('x', 'y', source=source,
          fill_color={'field': 'cases', 'transform': color_mapper},
          fill_alpha=0.7, line_color="white", line_width=0.5)

hover = p.select_one(HoverTool)
hover.point_policy = "follow_mouse"
hover.tooltips = [
    ("Name", "@name"),
    ("Virus cases)", "@cases"),
    ("(Long, Lat)", "($x, $y)"),
]

years = Slider(start=minyear, end=maxyear, value=minyear, step=1, title="Positive Cases Reported in Selected Year")
years.value = init_year

def update(source=source, slider=years, window=None):
    data = source.data
    year = cb_obj.get('value')
    data['cases'] = data[str(year)]
    source.trigger('selected', None, year)
 
years.js_on_change('value', CustomJS.from_py_func(update))

# add button with callback to control animation
callback = CustomJS(args=dict(p=p, source=source), code="""
        var data = source.data;
        var f = cb_obj.active;
        var j = 2006;
        
        if(f == true){
            mytimer = setInterval(replace_data, 600);
        } else {
            clearInterval(mytimer);
        }
        
        function replace_data() {
             j++;
             if(j === 2016) {
                 j=2006;
             }
             p.title.text = "Positive West Nile Virus Cases per County in period: " +j;
             data['cases'] = data[j];
             source.change.emit();
        }
        """)

btn = Toggle(label="Play/Stop Animation", button_type="success", active=False, callback=callback)

def update_data(attrname, old, new):
    data = source.data
    year = years.value
    p.title.text = "Positive West Nile Virus Cases per County in period: {0}".format(year)
    data['cases'] = data[str(year)]
    source.trigger('selected', None, year)

for w in [years]:
    w.on_change('value', update_data)

color_bar = ColorBar(color_mapper=color_mapper, ticker=LogTicker(), label_standoff=12, border_line_color=None, location=(0,0))
p.add_layout(color_bar, 'right')
inputs = widgetbox(btn,years)
curdoc().add_root(row(inputs, p, width=1000))
curdoc().title = "West Nile Virus"
