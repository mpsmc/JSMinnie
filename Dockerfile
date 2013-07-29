FROM r04r/nodejs

RUN apt-get update && apt-get install -y build-essential zlib1g-dev python && apt-get autoclean && apt-get clean
RUN adduser jsminnie
RUN mkdir /home/jsminnie/jsminnie
ADD . /home/jsminnie/jsminnie/
RUN chown -R jsminnie:jsminnie /home/jsminnie/jsminnie
RUN su -c "cd /home/jsminnie/jsminnie && npm install" jsminnie

CMD ["/bin/sh", "-c", "cd /home/jsminnie/config && node /home/jsminnie/jsminnie/src/minnie.js"]
