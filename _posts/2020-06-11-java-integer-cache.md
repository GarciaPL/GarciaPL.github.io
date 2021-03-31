---
layout:     post
title:      Java Integer Cache
author:		Lukasz Ciesluk
permalink:  /java-integer-cache/
tags:		[java, programming]
---
Do you know that cache exists even for Integers in Java ? I forgot even mention about Byte, Short, Long and Character as well! 

I get it, you might have been amazed by why these types in Java have a cache at all. I ensure you that even Senior Developers are astounded by the existence of this feature which lives with us since Java 5

Why do even have it in JDK ? Answer it's pretty the same when we think or/and use cache in various scenarios - performance and better usage of memory

Let's go through some examples to highlight for which cases this internal cache is utilized

{% highlight java %}
Integer first = 450;
Integer second = 450;

if (first == second)
  System.out.println("The same");
else
  System.out.println("Different");
{% endhighlight %}

Both variables `first` and `second` hold the same value, but they have different references. Within `if` statement, we are comparing their memory address, not values itself as for this we should have been using `equals()`. That's why for the above example our result is `Different` which is correct

{% highlight java %}
Integer first = 12;
Integer second = 12;

if (first == second)
  System.out.println("The same");
else
  System.out.println("Different");
{% endhighlight %}

In that case, the correct answer is `The same`. Before you are going to throw out all your knowledge about how `==` and `equals()` work in Java, please hold on for now

As you have noticed, some kind of barrier exists when values of Integer are cached or not. That range is `-128` and `127` (inclusive). It's applied only on autoboxing when Integer object is going to be build using the constructor ex. `Integer.valueOf(12)`. Hopefully, we can modify the high value of that range via VM argument `-XX:AutoBoxCacheMax=<size>`

Below you can find source code of `Integer.valueOf()` method is taken from `java-8-openjdk-amd64`

{% highlight java %}
    /**
     * Returns an {@code Integer} instance representing the specified
     * {@code int} value.  If a new {@code Integer} instance is not
     * required, this method should generally be used in preference to
     * the constructor {@link #Integer(int)}, as this method is likely
     * to yield significantly better space and time performance by
     * caching frequently requested values.
     *
     * This method will always cache values in the range -128 to 127,
     * inclusive, and may cache other values outside of this range.
     *
     * @param  i an {@code int} value.
     * @return an {@code Integer} instance representing {@code i}.
     * @since  1.5
     */
    public static Integer valueOf(int i) {
        if (i >= IntegerCache.low && i <= IntegerCache.high)
            return IntegerCache.cache[i + (-IntegerCache.low)];
        return new Integer(i);
    }
{% endhighlight %}

The cache is initialized on the first usage of `Integer` class. Within `IntegerCache` we have defined a variable `static final Integer cache[]` which is populated by `Integers` depends on properties like `low (-128)` and `high (127 or set by VM argument)`


Other Java types like Byte, Short, Long (-127 to 127 (inclusive)) and Character (0 to 127 (inclusive)) received fixed range for cache and cannot be amended using VM argument
