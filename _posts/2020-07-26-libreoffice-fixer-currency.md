---
layout:     post
title:      Fixer currency in Libreoffice
author:		Lukasz Ciesluk
permalink:  /libreoffice-fixer-currency/
tags:		finance
description: "How to fetch real-time currency exchange rates from Fixer.io API directly into LibreOffice Calc spreadsheets using WEBSERVICE and REGEX functions."
---

As I am running some internal spreadsheet to track our cash flow, I had to find out a solid foreign exchange rates and currency conversion API. I have found that 
[Fixer.io](https://fixer.io/) provides access without any cost for up to 1000 APIs calls per month which was enough for my needs.

Fetching foreign currency rate for pair ```EUR/PLN``` using this API looks like this

{% highlight console %}
http://data.fixer.io/api/latest?access_key=XXX&base=&symbols=PLN
{% endhighlight %}

and we will get an output as

{% highlight console %}
{
	"success": true,
	"timestamp": 1595759045,
	"base": "EUR",
	"date": "2020-07-26",
	"rates": {
		"PLN": 4.405059
	}
}
{% endhighlight %}

Injecting this currency rate directly into Libreoffice Calc spreadsheet will look like as below as we will use [WEBSERVICE](https://help.libreoffice.org/Calc/WEBSERVICE)

{% highlight console %}
=WEBSERVICE("http://data.fixer.io/api/latest?access_key=XXX&base=&symbols=PLN")
{% endhighlight %}

but then if you would like to extract for your computational need just the rate you might need to use regex

{% highlight console %}
=REGEX(WEBSERVICE("http://data.fixer.io/api/latest?access_key=XXX&base=&symbols=PLN"),"\d{1,2}[\,\.]{1}\d{1,5}")
{% endhighlight %}

where using ```\d{1,5}``` you specify amount of decimal places you are interested in of number ```4.405059```