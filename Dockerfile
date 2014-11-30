FROM dockah/base

RUN apt-get update
RUN apt-get install -y build-essential zlib1g-dev python && apt-get autoclean && apt-get clean
RUN adduser -u 9999 jsminnie
RUN mkdir /home/jsminnie/jsminnie
RUN mkdir /home/jsminnie/ejdb
RUN chown -R jsminnie:jsminnie /home/jsminnie/

ENV NODE_VERSION 0.10.26
RUN curl http://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar xz --strip-components=1
RUN cd /home/jsminnie/jsminnie && npm install irc string request ejdb simplediff cheerio async goo.gl

ADD package.json /home/jsminnie/jsminnie/
RUN cd /home/jsminnie/jsminnie && npm install
ADD . /home/jsminnie/jsminnie/
RUN chown -R jsminnie:jsminnie /home/jsminnie

USER jsminnie
ENV HOME /home/jsminnie
CMD cd /home/jsminnie/config && /home/jsminnie/jsminnie/src/run.sh