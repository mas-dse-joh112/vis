from continuumio/anaconda

RUN mkdir /ex5

WORKDIR /ex5

ADD sheep_ml.graphml .
ADD nodes.py .

RUN pip install bokeh==0.12.13

# start bokeh app
CMD ["bokeh", "serve", "nodes.py"]
