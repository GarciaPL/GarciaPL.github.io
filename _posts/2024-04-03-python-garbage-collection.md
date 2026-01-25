---
layout: post
title: Python Garbage Collection
author: Lukasz Ciesluk
permalink: "/python-garbage-collection/"
tags: [python]
description: "Learn how CPython manages memory using reference counting and generational garbage collection to detect circular references."
---

The standard Python interpreter (CPython) uses two garbage collectors at once:
- **reference counting**
- **generational garbage collection**

Reference counting is very simple and efficient, but it has one big drawback - it does not know how to detect **circular references**. Because of this there is an additional collector in Python called generational GC which monitors objects with potential circular references. 

In Python reference counting collector is **fundamental and cannot be disabled** whereas GC is **optional and can be disabled**. GC does not work in real time and runs periodically.

## Reference counting

When you create an object in Python, the underlying C object has both a **Python type** (ex. list, dict or function) and a **reference count**. Python object’s reference count is incremented if the object is referenced and it is decremented when an object is dereferenced. If an object’s reference count is 0, the memory for the object is deallocated.

Ways to increase the reference count for an object
- assign an object to a variable
- add an object to a data structure ex. adding to a list or as a property on a class instance
- pass an object as an argument to the function - in Python concept of **passing by assignment** is used when function is called. **Each argument is assigned to a variable in the function scope** which points to the same object as the variable that was passed in.

You can use the [sys](https://docs.python.org/3/library/sys.html) module from the Python standard library to check reference counts for a particular object.

{% highlight python %}
import sys
a = "my string"
sys.getrefcount(a) #gives 2
{% endhighlight %}

There are **two references** of our variable **a**. One is from creating the variable. The second is when we pass the variable **a** to the **sys.getrefcount()** function. Adding the variable to a data structure ex. list/dictionary etc, will increase reference count.

## Generational garbage collection

{% highlight python %}
class MyClass(object):
	pass
a = MyClass()
a.obj = a
del a
{% endhighlight %}

By deleting the instance, it’s no longer accessible in our program, but Python didn’t destroy the instance from memory. The instance doesn’t have a reference count of zero because it has a reference to itself. We call this type of problem a **circular reference** and you **can’t solve it by reference counting**. The gc exists only to detect and free circular references.

The garbage collector divides all objects into **3 generations**. New objects are included in the first generation. If the new object survives the garbage collection process, then it is moved to the next generation. The higher the generation, the less often it is scanned for garbage. GC detects and breaks circular references by identifying unreachable objects through a process known as **mark and sweep**.

The mark and sweep algorithm works in two phases. In the **mark phase**, it traverses the object graph starting from the root objects and marks all the reachable objects. In the **sweep phase**, it deallocates the memory of the unmarked objects.

Each generation has:
- **special counter** - stores the number of allocations minus the number of deallocations
- **threshold for number of objects** - if the number of objects exceeds that threshold, the garbage collector will trigger a collection process

You may change the behavior of the generational garbage collector in your Python program. This includes **changing the thresholds** for triggering a garbage collection process. Additionally, you can **manually trigger a garbage collection** process **or disable the garbage collection** process altogether.

Python 3.12 introduces a new concept called immortal objects that their reference count doesn't change. Python interpreter can now skip reference counting for some objects that live until the Python process terminates ex for `None`  `True` and `False`.
