---
layout:     post
title:      IntelliJ - new ticket for constraints in SQL
author:		Lukasz Ciesluk
permalink:  /intellij-constraints-sql/
tags:		java
description: "Why IntelliJ should warn about unnamed SQL constraints and how to properly name them using ALTER TABLE statements."
---

When you create a new table in IntelliJ with a constraint on column `STATUS`, it's difficult later on to amend that constraint as Oracle assigns a random name for it

{% highlight sql %}
CREATE TABLE MY_TABLE (
  ID                  NUMERIC(19,0)      NOT NULL,
  STATUS              NVARCHAR2(20)      NOT NULL CHECK (STATUS IN ('OPEN', 'CLOSED'));
);
{% endhighlight %}

What is the proposed effect on it? Getting a warning that it's better to create column constraint using a separate statement like

{% highlight sql %}
ALTER TABLE MY_TABLE ADD CONSTRAINT STATUS_VALIDATION CHECK (STATUS IN ('OPEN', 'CLOSED'));
{% endhighlight %}

[https://youtrack.jetbrains.com/issue/DBE-10549](https://youtrack.jetbrains.com/issue/DBE-10549)