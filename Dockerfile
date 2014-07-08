FROM dockah/base

RUN apt-get update
RUN apt-get install -y build-essential zlib1g-dev python && apt-get autoclean && apt-get clean
RUN adduser -u 9999 jsminnie
RUN mkdir /home/jsminnie/jsminnie
RUN mkdir /home/jsminnie/ejdb
RUN chown -R jsminnie:jsminnie /home/jsminnie/

ENV NODE_VERSION 0.10.26
RUN curl http://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar xz --strip-components=1

RUN cd /home/jsminnie/ejdb && npm install ejdb
RUN cd /home/jsminnie/ejdb && npm install irc string request simplediff cheerio async traceur wait.for-es6 wolfram-alpha goo.gl mathjs
ADD . /home/jsminnie/jsminnie/
RUN mv /home/jsminnie/ejdb/node_modules/ /home/jsminnie/jsminnie/
RUN cd /home/jsminnie/jsminnie && npm install
RUN chown -R jsminnie:jsminnie /home/jsminnie
USER jsminnie
ENV HOME /home/jsminnie
CMD cd /home/jsminnie/config && /home/jsminnie/jsminnie/src/run.sh
