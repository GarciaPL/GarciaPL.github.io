---
layout: post
title: CalPERS Private Equity RAG
author: Lukasz Ciesluk
permalink: "/calpers-private-equity-rag/"
tags: [ai, private-markets, finance]
description: "Building a Retrieval-Augmented Generation system to query CalPERS Private Equity portfolio data."
---

Recently I have been thinking about diving into RAGs, so was looking for a good reference document that I could use. Considering that at the moment I work in private markets, CalPERS Private Equity documents seemed like a good source to use.

CalPERS (California Public Employees' Retirement System) is the largest public pension fund in the United States, managing retirement and health benefits for over 2 million California public employees, retirees, and their families. With approximately $500 billion in assets under management, CalPERS invests across multiple asset classes including public equity, fixed income, real estate, and private equity.

## Technologies

The pipeline is built entirely in Python using the following stack:

- **[LangChain](https://www.langchain.com/)** — orchestration framework for chaining LLM calls, document loaders, and retrievers
- **[LangChain Text Splitters](https://python.langchain.com/docs/concepts/text_splitters/)** — chunking documents into overlapping segments before embedding
- **[LangChain Ollama](https://python.langchain.com/docs/integrations/llms/ollama/)** — integration with locally-running Ollama models
- **[LangChain Community](https://python.langchain.com/docs/integrations/)** — additional loaders and utilities
- **[LangChain HuggingFace](https://python.langchain.com/docs/integrations/text_embedding/huggingfacehub/)** — HuggingFace embeddings bridge
- **[LangChain Chroma](https://python.langchain.com/docs/integrations/vectorstores/chroma/)** — LangChain wrapper for ChromaDB
- **[Sentence Transformers](https://www.sbert.net/)** — local embedding models for converting text chunks into vectors
- **[ChromaDB](https://www.trychroma.com/)** — local vector store for persisting and querying embeddings
- **[PyPDF](https://pypdf.readthedocs.io/)** — PDF ingestion and text extraction
- **[Typer](https://typer.tiangolo.com/)** — CLI interface for running the pipeline from the terminal
- **[Rich](https://rich.readthedocs.io/)** — formatted terminal output
- **[python-dotenv](https://pypi.org/project/python-dotenv/)** — environment variable management
- **[httpx](https://www.python-httpx.org/)** — async HTTP client used by Ollama integration

## Models

One model runs locally via Ollama, no API keys or internet connection required at query time:

- **[gemma3:4b](https://ollama.com/library/gemma3)** via [Ollama](https://ollama.com/) — the default LLM responsible for generating answers from retrieved context. Runs fully on-device. Any model available in Ollama can be substituted.
- **[all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)** via HuggingFace — a lightweight sentence-transformer model used to embed document chunks and queries into vectors for semantic search.

## RAG

The diagram below gives an overview of how RAG works on a high level.

![RAG overview for CalPERS Private Equity data](/assets/CalPERSPrivateEquityRAG/RAG_overview.png)

## References

- [CalPERS](https://www.calpers.ca.gov/)
- [GitHub](https://github.com/GarciaPL/calpers-pe-rag)
