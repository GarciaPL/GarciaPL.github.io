---
layout: post
title: Datalust Seq Logs for Spring Boot
author: Lukasz Ciesluk
permalink: "/datalust-seq-logs-spring-boot/"
tags: [java]
description: "How to set up Datalust Seq for centralized logging in Spring Boot applications using Docker, GELF protocol, and Logback configuration."
---

Recently I was working on one project in Spring Boot and I was thinking if there is a better way to access logs of the application instead of connecting to the Docker container and check them at the source. 

After some research I found [Datalust](https://datalust.co/) which allows you to collect logs and traces, monitor applications, and hunt bugs — without data leaving your infrastructure.

Below there is a **docker-compose.yaml** config to setup it. For Spring Boot application you need a proxy layer of **datalust/seq-input-gelf** which would pass your logs to **datalust/seq**. 

**datalust/seq-input-gelf** has defined input stream under UDP of **12201** and also output stream as **SEQ_ADDRESS: "http://seq:5341"** where your logs are going to be passed as **datalust/seq** listens for logs under **5341**

{% highlight xml %}
version: '3.8'

services:
  app:
    container_name: roundapp
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - seq
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - RUNNING_IN_DOCKER=true
    env_file:
      - .env

  seq-input-gelf:
    image: datalust/seq-input-gelf:3.0
    container_name: seq-input-gelf
    depends_on:
      - seq
    ports:
      - "12201:12201/udp"
    environment:
      SEQ_ADDRESS: "http://seq:5341"
    restart: unless-stopped

  seq:
    image: datalust/seq:2025
    container_name: seq
    ports:
      - "5341:80"
    environment:
      - ACCEPT_EULA=Y
      - SEQ_FIRSTRUN_NOAUTHENTICATION=True
    restart: unless-stopped
    volumes:
      - seq_data:/data

volumes:
  seq_data:
{% endhighlight %}


**logback-spring.xml** is required to pass these logs by using [logback-gelf](https://github.com/osiegmar/logback-gelf) which is a Logback appender for sending GELF messages with zero additional dependencies. Property **graylogPort** uses port **12201** which has been defined above in **docker-compose.yaml**.

I used **runningInDocker** variable which allows me to pass these logs to **Seq** only when app runs as a container in Docker.

{% highlight xml %}
<configuration>

  <appender name="SEQ" class="de.siegmar.logbackgelf.GelfUdpAppender">
    <graylogHost>seq-input-gelf</graylogHost>
    <graylogPort>12201</graylogPort>
    <encoder class="de.siegmar.logbackgelf.GelfEncoder"/>
  </appender>

  <property name="runningInDocker" value="${RUNNING_IN_DOCKER:-false}"/>

  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>

  <root level="INFO">
    <appender-ref ref="CONSOLE"/>
    <if condition='property("runningInDocker").equalsIgnoreCase("true")'>
      <then>
        <appender-ref ref="SEQ"/>
      </then>
    </if>
  </root>

</configuration>
{% endhighlight %}


Example how logs look under Datalust Seq
![DatalustSeqSpringBoot](/assets/DatalustSeqSpringBoot/datalust_seq_logs_spring_boot.PNG)