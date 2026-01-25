---
layout: post
title: JodaTime - week number in month of business date
author: Lukasz Ciesluk
permalink: "/joda-time-week-number-in-month-of-business-date/"
tags: [java, programming]
description: "Java code snippet to calculate the week number within a month for a given business date using JodaTime library."
---

If you would like to figure out week number in the month of your business date by using JodaTime in Java, please check below code snippet

Examples
* Week number in the month for business date of 2020-10-07 is 2
* Week number in the month for business date of 2020-10-21 is 4

{% highlight java %}
LocalDate firstDayOfTheMonth = businessDate.dayOfMonth().withMinimumValue();
int weekOfMonth = Weeks.weeksBetween(firstDayOfTheMonth, businessDate.dayOfWeek().withMaximumValue().plusDays(1)).getWeeks();
{% endhighlight %}
