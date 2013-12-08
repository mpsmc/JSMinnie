FROM dockah/base

RUN apt-get update && apt-get install -y build-essential zlib1g-dev python && apt-get autoclean && apt-get clean
RUN adduser jsminnie
RUN mkdir /home/jsminnie/jsminnie
RUN mkdir /home/jsminnie/ejdb
RUN chown -R jsminnie:jsminnie /home/jsminnie/

RUN su -c "cd /home/jsminnie/ejdb && npm install ejdb" jsminnie

ADD . /home/jsminnie/jsminnie/

RUN mv /home/jsminnie/ejdb/node_modules/ /home/jsminnie/jsminnie/
RUN chown -R jsminnie:jsminnie /home/jsminnie/jsminnie
RUN su -c "cd /home/jsminnie/jsminnie && npm install" jsminnie

USER jsminnie
CMD cd /home/jsminnie/config && node /home/jsminnie/jsminnie/src/minnie.js
