---
layout: post
title: Python's Decorators
author: Lukasz Ciesluk
permalink: "/python-decorators/"
tags: [python]
description: "Complete guide to Python decorators: basic usage, decorators with parameters, class-based decorators, and using @wraps for metadata preservation."
---

Python offers a way to modify behaviour of the function or class without modifying it's source by using **Decorators**

Common use case include logging, authorization, authentication, performance measurement, caching, rate limiting, input validation, retry logic, method chaining etc

There are two types of decorators: those that accept parameters and those that do not

Let's focus on the example where decorator only takes the function to be wrapped within decorator

{% highlight python %}
def uppercase(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs).upper()
    return wrapper
{% endhighlight %}

If you would like to use this decorator on a given function just use **@uppercase**

{% highlight python %}
@uppercase
def greet(name):
    return f"Hello, {name}!"

print(greet("Karishma"))
{% endhighlight %}

A Decorator which accepts parameters needs to provide a decorator factory, which returns the actual decorator for a given function

{% highlight python %}
def role_required(role):        # <-- decorator factory taking argument
    def decorator(fn):          # <-- actual decorator taking the function
        def wrapper(*args, **kwargs):
            # your logic here
            return fn(*args, **kwargs)
        return wrapper
    return decorator
{% endhighlight %}

Decorators can also take a class as an argument by using the dunder methods **__init__** and **__call__** to initialize and wrap the function

{% highlight python %}
class CubeCalculator:
    def __init__(self, function):
        self.function = function

    def __call__(self, *args, **kwargs):
        result = self.function(*args, **kwargs)
		# additional logic
        return result

@CubeCalculator
def get_cube(n):
    print("Input number:", n)
    return n * n * n
{% endhighlight %}

**BONUS**

Recently I was testing some capabilities of micro web application framework Flask along with Swagger, provided by library called flasgger which creates Swagger 2.0 API documentation for all your Flask views extracting specs from docstrings or referenced YAML files. 

After adding a small decorator to one of the endpoints, I found that Swagger stopped listing it under **/apidocs** url.

Solution to it was using **@wraps** function from **functools** to inherit the metadata provided for Swagger discoverability. Without **@wraps**, the wrapper function replaces the original function’s metadata—such as __name__, __doc__, and other attributes with its own.

{% highlight python %}
def role_required(role):
    @wraps
    def decorator(fn):
        def wrapper(*args, **kwargs):
            # your logic here
            return fn(*args, **kwargs)
        return wrapper
    return decorator
{% endhighlight %}