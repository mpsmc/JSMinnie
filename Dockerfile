FROM dockah/base

RUN apt-get update && apt-get install -y build-essential zlib1g-dev python && apt-get autoclean && apt-get clean
RUN adduser jsminnie
RUN mkdir /home/jsminnie/jsminnie
RUN mkdir /home/jsminnie/ejdb
RUN chown -R jsminnie:jsminnie /home/jsminnie/

ENV NODE_VERSION 0.10.24
RUN curl http://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar xz --strip-components=1

RUN su -c "cd /home/jsminnie/ejdb && npm install ejdb" jsminnie
RUN su -c "cd /home/jsminnie/ejdb && npm install irc string request simplediff cheerio mathjs async traceur wait.for-es6" jsminnie

ADD . /home/jsminnie/jsminnie/

RUN mv /home/jsminnie/ejdb/node_modules/ /home/jsminnie/jsminnie/
RUN chown -R jsminnie:jsminnie /home/jsminnie/jsminnie

USER jsminnie
ENV HOME /home/jsminnie
RUN cd /home/jsminnie/jsminnie && npm install

CMD cd /home/jsminnie/config && node /home/jsminnie/jsminnie/src/minnie.js
