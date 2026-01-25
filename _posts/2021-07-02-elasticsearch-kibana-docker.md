---
layout: post
title: Elasticsearch and Kibana in Docker
author: Lukasz Ciesluk
permalink: "/elasticsearch-kibana-docker/"
tags: [docker]
description: "Step-by-step guide to running Elasticsearch and Kibana locally using Docker with proper network configuration."
---

As I have started playing a little bit with ElasticSearch and Kibana locally, obviously via Docker. Feel free to find below how to start play with it as well.

First of all, let's create a network in Docker that will be used to communicate by these products

{% highlight shell %}
docker network create elastic
{% endhighlight %}

Now we run Elasticsearch linked to an elastic network in single-node mode as we do not expect to cluster it with more nodes on localhost

{% highlight shell %}
docker run --name elasticsearch --network elastic -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:7.13.2
{% endhighlight %}

Finally, we run Kibana also linked to an elastic network. We are also forced to define a variable called ELASTICSEARCH_HOSTS which is going to be loaded into kibana.yml into a container

{% highlight shell %}
docker run --name kibana --network elastic -p 5601:5601 -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" kibana:7.13.2
{% endhighlight %}

Remember that elasticsearch and kibana should have the same versions, it's a compelling requirement so they might both work correctly!