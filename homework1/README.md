From terminal (command prompt), issue the following command from this root folder to start the lightweight web server that comes with python

python -m SimpleHTTPServer 

note: Please ensure port 8000 is available.  Once the web server is started, navigate to http://localhost:8000 with your web browser to see the presentation

if 8000 port is not available, please pick a port that is available, then issue the following command

python -m SimpleHTTPServer [<portNo>]

if this command fails, please try the following command to start the web server (python 3)

python -m http.server [<portNo>]


