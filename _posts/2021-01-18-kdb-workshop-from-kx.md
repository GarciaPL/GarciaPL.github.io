---
layout: post
title: Kdb workshop from Kx
author: Lukasz Ciesluk
permalink: "/kdb-workshop-from-kx/"
tags: [kdb, finance]
description: "Experience from Kx workshop covering Kdb+ database, q programming language, and why it's valuable for high-frequency trading."
---

In early December 2020, I had a pleasure to take part of Workshop organized by [Kx](https://kx.com/) about [Kdb+](https://en.wikipedia.org/wiki/Kdb%2B) which is a column-based relational time-series database. 

Workshop was divided into three sections
- data exploration - grouping, aggregations, joins 
- ***q*** language - deeper look on its features like atom & vector operations along with temporal arithmetic and adverbs
- data loading - using external sources like CSV and JSON

Getting through the material was pretty enjoyable because of the trainer of course, but also that all exercises were implemented in Jupyter Notebook, so it was easy to navigate and evaluate your calculations against correct data

Kdb+ itself made a good impression on me as a tool to process very large sets of data in a matter of few milliseconds. It seems that key to the success of it is that data is pushed to random-access memory (RAM) for processing. 

The core of kdb+ was built using ***q*** programming language which was discussed during the workshop.

I think that kdb+ is a very good tool to explore it more if someone has a desire to work in the finance world, for instance in high-frequency trading (HFT) companies which use it for analyzing time-series data such as stock or commodity exchange data.
