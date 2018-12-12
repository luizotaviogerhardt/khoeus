FROM ubuntu:18.04
MAINTAINER Luiz Gerhardt <luizgerhardt93@gmail.com>

ENV BUILD_PACKAGES ruby-dev nodejs libxml2-dev libxslt-dev libsqlite3-dev ruby ruby-nokogiri ruby-bundler 

RUN apt update -y && \
    apt upgrade -y && \
    apt install -y $BUILD_PACKAGES && \
    rm -rf /var/cache/apt/*

RUN mkdir /usr/app
WORKDIR /usr/app

COPY Gemfile /usr/app/
COPY Gemfile.lock /usr/app/
RUN bundle lock
RUN bundle config build.nokogiri --use-system-libraries
RUN bundle install

VOLUME DbVolume:/db

COPY /db/development.sqlite3 /DbVolume:/db/

COPY . /usr/app

EXPOSE 3000
ENTRYPOINT ["rails"]
CMD ["server"]
