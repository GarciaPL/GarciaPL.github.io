---
layout: post
title: Consolidated Tape Provider (CTP)
author: Lukasz Ciesluk
permalink: "/consolidated-tape-provider/"
tags: [trading]
description: "Understanding the UK's Consolidated Tape Provider framework for bond market data aggregation, transparency, and impact on market participants."
---

![ConsolidatedTapeProvider](/assets/ConsolidatedTapeProvider/CTP.png)

## Scope

Consolidated Tape Provider (CTP) in the UK is a framework designed specifically for the bond market. The Financial Conduct Authority (FCA) has established a framework which aggregates near real-time post-trade market data from various UK venues into one comprehensive data feed. There is also a plan to provide the same mechanism for other asset classes in the future such as equities, ETFs and derivatives. [2]

## Challenge

Imagine a market participant who would like to obtain an overview of the bond market, which is traded mostly OTC (over-the-counter).

At the moment, bond markets are fragmented, obtaining data is expensive, sometimes inconsistent due to mismatches in standardization. Currently, the only way is to buy and piece together data from many separate sources, which implies cost and complexity.

## Objectives

CTP aims to democratize access to market data for all investors, improve price transparency, provide liquidity, support better execution, reduce data costs for market participants, and, overall, make the UK bond market more attractive to investors.

In terms of the UK bond market, it will cover
- Corporate bonds
- Government bonds (Gilts)
- Other fixed-income instruments traded in the UK - e.g., supranational and covered bonds

## Users

Main users would span across
- Asset managers
- Banks / Dealers / Broker-dealers
- Pension funds
- Insurance companies
- Trading venues
- Regulators
- Data vendors

All users need a single, authoritative view of executed prices and volumes. 

- Buy side as asset managers, pensions funds and insurance companies data will use the data to understand fair value, assess liquidity, and support best-execution decisions to meet UK MiFID best execution obligations
- Sell side as banks, dealers, broker-dealers data will use the data to quote competitively, manage inventory risk, and calibrate pricing strategies
- Regulators would mostly use it to assess market efficiency, transparency, and overall market quality

Most of the above users will use consolidated post-trade prices as a market reference, but not always as the sole or primary reference. It will be combined with dealer quotes, axes and RFQs.

## Solution

What's important to note is that CTP will contain only post-trade data, so it cannot be seen as an overview of live order book. CTP will mainly combine prices and volumes.

There is no single publicly published around data model that will be used for CTP with exact field names, but FCA Handbook consolidated tape rules (MAR 9.2B) defines fields and flags to be used

| Category                      | Description                                      | Example / Notes                                         |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| **Instrument identifiers**    | Standard identifiers to uniquely identify a bond | ISIN, CUSIP (where applicable), or other exchange codes |
| **Trade price**               | Executed price per unit                          | Price in % of par or monetary terms                     |
| **Trade volume / size**       | Quantity traded                                  | Notional amount or number of bonds                      |
| **Trade timestamp**           | Exact time of execution                          | ISO 8601 timestamp with timezone                        |
| **Venue / counterparty info** | Source of the trade                              | Trading venue MIC                                       |
| **Trade type**                | Nature of execution                              | On-venue vs OTC, auction, internalisation               |
| **Currency**                  | Currency of the trade                            | GBP, EUR, USD, etc.                                     |
| **Settlement information**    | Optional / where relevant                        | Settlement date, trade type (T+2, etc.)                 |

In terms of delivery, CTP is expected to be available via APIs as a primary access mechanism, though not necessarily the only one. The FCA states in the framework that distributed data should support automated consumption.

Access could take the form of:
- Streaming APIs for near-real-time updates
- Bulk data access for historical or large datasets
- File-based delivery, such as scheduled batch files (e.g., daily or hourly)

APIs will not only provide real-time data, but also allow users to query and retrieve historical post-trade information, supporting analytics, compliance, and benchmarking. Moreover, as per Appendix A, historical licence holders shall be given access to historical data through an online user interface (UI). More information about licences can also be found in the same document.

## References

### Appendix A: Bond Consolidated Tape Provider Tender Process
[Tender process for appointing a bond consolidate tape provider (CTP) – 4 August 2025](https://www.fca.org.uk/publication/documents/bond-consolidated-tape-concession-agreement-schedule.pdf)

### Appendix B: UK’s New Transparency Regime Calibration
[First Look: Week 1](https://www.tradeweb.com/newsroom/media-center/insights/blog/first-look-week-1-of-the-uks-new-transparency-regime-calibration/)

### Appendix C: Rules for Bond CT
[FCA confirms final rules for a bond consolidated tape](https://www.pwc.co.uk/industries/financial-services/understanding-regulatory-developments/fca-confirms-final-rules-for-a-bond-consolidated-tape.html)

### Appendix D: Invitation to Tender
[Invitation to Tender (ITT) UK Bond Consolidated Tape](https://www.fca.org.uk/publication/documents/bond-consolidated-tape-itt.pdf)