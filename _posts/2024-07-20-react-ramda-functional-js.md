---
layout: post
title: Ramda - functional js
author: Lukasz Ciesluk
permalink: "/ramda-functional-js/"
tags: [javascript]
description: "Using Ramda library for functional data transformation in React applications with TypeScript - practical examples with applySpec and pipe."
---

Recently I spent some time working on an app designed to be used during an interview process. The application is supposed to fetch and transform data from several APIs to mostly list investors in private market space along with their commitments for a given asset class. 

It was a perfect opportunity to refresh some knowledge around technologies like React along with libraries as Axios, Cypress, and Jest for testing, TypeScript for static typing, Ramda for data mutation and MUI for styling. Feel free to find app here with some screenshots of the [Investor App](https://github.com/GarciaPL/InvestorApp)

For data processing from APIs, I thought about using good old [Underscore](https://www.npmjs.com/package/underscore) but after some time I realized that last time it was updated about 2 years ago and nowadays it does not work well with React & Typescript. Luckily, I was able to find very interesting library called [Ramda](https://github.com/ramda/ramda) which is **designed specifically for a functional programming style, one that makes it easy to create functional pipelines, one that never mutates user data.**

Let's take some data like below which represents investor commitments for a Private Equity asset class

{% highlight json %}
[
    {
        "id": 34728,
        "asset_class": "pe",
        "firm_id": 2670,
        "currency": "HKD",
        "amount": "5M"
    },
    {
        "id": 90807,
        "asset_class": "pe",
        "firm_id": 2670,
        "currency": "EUR",
        "amount": "15M"
    },
    {
        "id": 25277,
        "asset_class": "pe",
        "firm_id": 2670,
        "currency": "HKD",
        "amount": "80M"
    }
]
{% endhighlight %}

For a PieChart from [Mui](https://mui.com) library, we need to transform data to the format expected by the component so every element would have properties like **id, value, label**. By using Ramda we can achieve it quite easily by just using the code below

{% highlight js %}
import * as R from 'ramda'

interface PieChartLabel {
  id: number
  amount: number
  currency: string
}

const transformCommitments = R.map(
    R.applySpec({
      id: R.prop('id'),
      value: R.pipe(R.prop('amount'), parseMillions),
      label: ({ amount, currency }: PieChartLabel) => `${amount} (${currency})`,
    })
)

const parseMillions: (value: string) => number = R.pipe(
  R.replace('M', ''),
  R.trim,
  parseInt
) as (value: string) => number
{% endhighlight %}

At the end we would receive the below output by just using **transformCommitments(data)**

{% highlight json %}
[
    {
        "id": 34728,
        "value": 5,
        "label": "5M (HKD)"
    },
    {
        "id": 90807,
        "value": 15,
        "label": "15M (EUR)"
    },
    {
        "id": 25277,
        "value": 80,
        "label": "80M (HKD)"
    }
]
{% endhighlight %}

More details about **applySpec** can be found here [Ramda Docs](https://ramdajs.com/docs/#applySpec)