---
layout:     post
title:      IntelliJ - Static Imports by Replace Structurally
author:		Lukasz Ciesluk
permalink:  /intellij-static-imports-replace-structurally/
tags:		java
description: "How to convert regular imports to static imports across multiple files using IntelliJ's Replace Structurally feature."
---

In my project at work, I was forced to do one very painful refactoring, but hopefully, IntelliJ came to rescue! The task was divided into two steps. The first step was about extracting literal into a constant variable in about maybe 200 places. That step was easy by using Replace in Path (Ctrl+Shift+R). The second and final step was about making static imports to that new constant in every class. Making such a change by hand was too overwhelming for me, but expectantly, there is a tool in IntelliJ called **Replace Structurally**. That tool allows you to replace every import of your variable to be static import instead of normal field import by selecting the option **Use static imports**

![IntelliJ Structural Replace](/assets/IntelliJ/intellij_structural_replace.png)