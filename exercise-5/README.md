
1. This is a bokeh interactive application, which requires at least bokeh==0.12.11 to see the interactivity.  Please issue the following command to upgrade if needed.

pip install bokeh==0.12.11

verify that the bokeh version is 0.12.11 and up

bokeh -v

2. Once the bokeh version is at least 0.12.11, go to terminal (command prompt), issue the following command from this root folder to start the bokeh app

bokeh serve nodes.py

2. note: Please ensure port 5006 is available. Once the Tornado web server is started, navigate to http://localhost:5006/nodes with your web browser to see the presentation

If 5006 port is not available, please pick a port that is available, then issue the following command

bokeh serve nodes.py --port yourPort#

then navigate to http://localhost:yourPort#/notes

