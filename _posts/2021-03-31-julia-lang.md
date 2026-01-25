---
layout: post
title: Julia Lang
author: Lukasz Ciesluk
permalink: "/julia-lang/"
tags: [julia, programming]
description: "Introduction to Julia programming language, its JIT compilation, performance benefits over Python, and why finance companies like BlackRock use it."
---

![Julia](/assets/Julia/julia.png)

Recently I have started exploring new dynamic programming language called [Julia](https://julialang.org/) 

Why? As it's getting more interest in finance world where better performance is needed in comparison to Python or MATLAB. For instance BlackRock uses it for time-series analytics and Aviva uses it for risk calculations. Even Federal Reserve Bank of New York used Julia to make models of the United States economy. Some details of it can be found here [JuliaCon 2016 - Economic Modeling at the Federal Reserve Bank of New York - Erica Moszkowski](https://www.youtube.com/watch?v=Vd2LJI3JLU0)

Julia uses a just-in-time (JIT) compiler (as it's not an interpreted language) called "just-ahead-of-time" (JAOT) which was implemented by using LLVM. Code is compiled to native machine code before running it.

Julia has a lot of interesting features:
* Lightweight "green" threading (coroutines)
* Efficient support for Unicode (v. 13.0) with UTF-8 used for strings
* Built-in package manager
* Macros
* Interfaces to work with other languages - Python by PyCall, R by RCall and Java/Scala by JavaCall
* Designed for parallel and distributed computing
* Multiple dispatch - all concrete types are subtypes of abstract types, directly or indirectly subtypes of the **Any** type which is the top of the type hierarchy

Julia's source code is directly executed as executable code as Julia is a compiled language. Multiple dispatch helps to define data types like arrays and numbers in appropriate places. Python is fast but unfortunately not fast as Julia. Python can be faster by using pre-optimized external libraries or even third-party JIT compilers.

Few benchmarks between Julia and Python can be found here [Benchmarks](https://benchmarksgame-team.pages.debian.net/benchmarksgame/fastest/julia-python3.html)

I will try to explore Julia more and that would mean that more posts can be found around it on the blog in the future. Stay tuned!