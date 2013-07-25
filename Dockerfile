FROM r04r/nodejs

RUN apt-get update
RUN apt-get install -y build-essential zlib1g-dev
RUN apt-get install -y python
RUN adduser jsminnie
RUN mkdir /home/jsminnie/jsminnie
ADD . /home/jsminnie/jsminnie/
RUN chown -R jsminnie:jsminnie /home/jsminnie/jsminnie
RUN su -c "cd /home/jsminnie/jsminnie && npm install" jsminnie

CMD ["su", "-c", "cd /home/jsminnie/config && nodejs /home/jsminnie/jsminnie/src/server.js"]
