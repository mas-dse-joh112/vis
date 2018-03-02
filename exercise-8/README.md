
1. This is a bokeh interactive application, which requires at least bokeh==0.12.11 to see the interactivity.  Please issue the following command to upgrade if needed.

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

5. The notebook requires a sample file in bokeh/sampledata directory.  The notebook will download the files from this directory if the directory does not exist.
