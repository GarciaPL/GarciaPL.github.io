---
layout: post
title: Zero Lock Execution
date: 2026-05-27
author: Lukasz Ciesluk
permalink: "/zero-lock-execution/"
tags: [programming, java, trading]
description: "Zero lock execution achieves thread safety without synchronized blocks or ReentrantLock, eliminating contention and reducing latency in concurrent systems."
---

Zero lock execution is a family of concurrency techniques that achieve thread safety without traditional `synchronized` blocks or `ReentrantLock`. Threads make progress without blocking on mutexes or semaphores.

## Why Avoid Locks?

Traditional locks carry costs as:

- **Context switching**: the OS suspends and resumes threads, burning CPU cycles on scheduling overhead
- **Priority inversion**: a low-priority thread holding a lock blocks a high-priority thread that needs it
- **Deadlocks**: circular wait conditions freeze threads indefinitely
- **Scalability ceiling**: under high contention (multiple threads competing for the same resource), throughput can *decrease* as you add threads

## Techniques

### Compare-And-Swap (CAS)

CAS is a CPU-level instruction: atomicity is guaranteed at silicon level with no OS involvement and no thread suspension. CAS atomically checks whether a memory location still holds the previously read value and, if so, replaces it with a new value. In Java, `AtomicInteger` and `AtomicReference` expose CAS via `compareAndSet()`.

{% highlight java %}
AtomicInteger counter = new AtomicInteger(0);
int expected = counter.get();
boolean updated = counter.compareAndSet(expected, expected + 1);
{% endhighlight %}

If another thread modified the value between `get()` and `compareAndSet()`, the CAS fails and the caller retries: no blocking, but under extreme contention a spin loop can cause livelock. Exponential backoff or yielding between retries mitigates this.

### The ABA Problem

CAS compares by value only. If a memory location changes A → B → A between `get()` and `compareAndSet()`, CAS sees A and succeeds, but the state has changed underneath. This matters in pointer-based structures where a recycled address looks identical to the original.

Java's `AtomicStampedReference` attaches a version counter alongside the value. Both must match for CAS to succeed, eliminating ABA.

### Lock-Free Data Structures

Java's `ConcurrentLinkedQueue` and `ConcurrentSkipListMap` are lock-free. `ConcurrentHashMap` takes a hybrid approach: CAS for inserts into empty buckets and fine-grained `synchronized` blocks only on individual bucket heads, so contention is limited to threads colliding on the same bucket rather than the entire map.

### Immutability

Immutable objects need no synchronisation: they are safe to share across threads by construction. In Java, `final` fields, `String`, `record` types, and persistent data structures all avoid shared mutable state entirely.

### Thread Confinement

Keep mutable state owned by one thread only, eliminating sharing rather than synchronising it. `ThreadLocal` is the standard Java mechanism.

### False Sharing

When two threads write to different variables that happen to share a cache line, each write invalidates the other CPU's cached copy, causing coherence traffic with no logical sharing. Performance can degrade by an order of magnitude.

### The Disruptor Pattern (LMAX)

A ring buffer–based inter-thread messaging framework designed for ultra-low latency. Producers write to slots in a pre-allocated ring buffer; consumers track their own sequence numbers. No locks, no GC pressure from allocations, cache-line padding to prevent false sharing. Throughput in benchmarks exceeds `java.util.concurrent` queues by an order of magnitude. The Disruptor pattern will be covered in depth in a dedicated post on this blog.

## Summary

Locks serialize access. Zero-lock techniques serialize only the conflict, or eliminate the conflict entirely. Lock-free is not always faster: under high contention, CAS retry overhead can make blocking queues outperform lock-free ones. Profile before assuming.
