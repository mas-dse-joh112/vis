
1. There are two separate software solutions to run, a bokeh interactive application and a jupyter notebook.
   The bokeh interactive application requires at least bokeh==0.12.11 to see the interactivity.  Please issue the following command to upgrade if needed.

pip install bokeh==0.12.11

verify that the bokeh version is 0.12.11 and up

bokeh -v

2. This bokeh application also requires flexx, please issue the following command to install it.  The Python functions in CustomJS need flexx.

pip install flexx

3. From terminal (command prompt), issue the following command from this root folder to start the bokeh app

bokeh serve cases.py

4. note: Please ensure port 5006 is available. Once the Tornado web server is started, navigate to http://localhost:5006/nodes with your web browser to see the presentation

If 5006 port is not available, please pick a port that is available, then issue the following command

bokeh serve cases.py --port yourPort#

then navigate to http://localhost:yourPort#/cases with desired browser

5. The notebook requires a sample file in one's .bokeh home directory (~/.bokeh/data). 
   The notebook will download the files and write to this sample data directory if the directory does not exist.

6. Please issue jupyter notebook from this root directory to see the notebook, which is separate from the bokeh app.
   The notebook requires folium and holoviews (pip install them if needed)
   The notebook opens a new tab with "cases.html" output file to display the map showing the positive West Nile Virus cases reported overall
