The Approval Rate Crisis: Build a Real-Time Decline Analyzer for Luxara
The Scenario
Luxara, a luxury fashion marketplace operating across Mexico, Colombia, and Argentina, is bleeding revenue. Their payment approval rate has mysteriously dropped from 78% to 62% over the past three weeks, costing them an estimated $200K in lost sales.

Their VP of Payments is panicking. "We're seeing customers try to buy $500 handbags, the payment fails, and they never come back. But we have NO visibility into why these payments are declining. Our current dashboard just shows us a total 'declined' count — that's it. We need to understand the patterns immediately so we can fix this before the holiday shopping season."

Luxara uses Yuno's payment orchestration platform, which routes their transactions across four different payment processors (acquirers) in real-time. When a customer tries to pay, Yuno sends the payment request to one of these processors, who then communicate with the customer's bank (the issuer) to approve or decline the transaction.

Your mission: Build a working full-stack decline analytics tool that Luxara's payments team can use to diagnose what's killing their approval rates. They need to see decline patterns by payment method, processor, card type, decline reason, and geography — and they need it today.

Domain Background: Key Concepts
To complete this challenge, you need to understand a few core payments concepts:

Authorization vs Decline
When a customer submits payment, the transaction goes through an authorization flow:

The payment processor (acquirer) sends an authorization request to the customer's card network (Visa, Mastercard, etc.)
The card network routes it to the customer's bank (issuer)
The issuer approves or declines the transaction based on funds, fraud rules, limits, etc.
The response flows back through the chain to the merchant
An approval rate is the percentage of authorization attempts that succeed. A 62% approval rate means 38% of payment attempts are being declined.

Decline Codes & Categories
When a payment is declined, the issuer returns a decline code — a specific reason why the payment failed. Common categories include:

Soft declines (temporary, retriable): insufficient funds, velocity limits exceeded, issuer system unavailable, suspected fraud (requires customer authentication)
Hard declines (permanent, non-retriable): stolen card, closed account, invalid card number, restricted card
Processing errors: network timeout, processor unavailable, configuration error
Understanding which decline reasons are spiking helps diagnose the root cause.

Payment Processors (Acquirers)
Yuno routes transactions to different payment processors (also called acquirers) — companies like Adyen, dLocal, Kushki, or Ebanx that connect merchants to card networks and local payment methods.

A merchant might use multiple processors for redundancy or because different processors have better approval rates in different countries.

Payment Methods
In Latin America, customers don't just use credit/debit cards. Common payment methods include:

Credit card (Visa, Mastercard, Amex)
Debit card
PIX (Brazil's instant payment system)
OXXO (Mexico's cash payment method at convenience stores)
PSE (Colombia's online bank transfer system)
Different payment methods have different decline patterns.

BIN (Bank Identification Number)
The first 6-8 digits of a card number form the BIN, which identifies the issuing bank and card type (credit vs debit, card network, country, etc.). Analyzing declines by BIN helps identify if a specific bank or card type is causing issues.

What You're Building
A two-part decline analytics system:

Backend: An API or service that processes transaction data and exposes decline analytics with flexible filtering and aggregation
Frontend: An interactive dashboard where Luxara's team can explore decline patterns visually
The tool should feel like a diagnostic workbench — not just charts, but an interactive tool for drilling into the data to find root causes.

Functional Requirements
Requirement 1: Decline Breakdown & Filtering (Core)
The system must allow users to:

View decline rates (percentage of transactions declined) overall and filtered by:
Payment method (credit_card, debit_card, pix, oxxo, pse, etc.)
Processor (which acquirer handled the transaction)
Country (MX, CO, AR, BR, etc.)
Decline reason category (soft_decline, hard_decline, processing_error)
Specific decline code (e.g., "insufficient_funds", "stolen_card", "issuer_unavailable")
Compare decline rates across multiple dimensions (e.g., "Show me decline rate by processor for credit card transactions in Mexico")
What "done" looks like: A user can select filters in the UI (dropdowns, checkboxes, or similar), and the dashboard updates to show decline rate and total declined transaction count for the filtered subset. The backend provides the aggregated data via an API endpoint.

Requirement 2: Time-Series Trend Visualization (Core)
The system must show how decline rates have changed over time so the team can identify when the problem started.

Users should be able to:

View a time-series chart showing decline rate over a selected time period (e.g., last 7 days, last 30 days)
Break down the trend by a chosen dimension (e.g., "Show me decline rate over time, split by processor")
Quickly spot anomalies or spikes
What "done" looks like: The UI displays a line or area chart showing decline rate (y-axis) over time (x-axis). The user can choose a grouping dimension (e.g., processor, payment method, country), and the chart displays multiple series (one per group). The backend computes time-bucketed decline rates (e.g., daily or hourly buckets).

Stretch Goals (Optional — Partial Completion Expected)
Stretch Goal A: Decline Reason Deep-Dive Table
Add a detailed table view that lists the top 10 specific decline codes by volume, showing:

Decline code
Number of occurrences
Percentage of total declines
Processor(s) where this code appears most
This helps Luxara's team quickly identify the top offenders (e.g., "70% of our declines are 'insufficient_funds' from Processor B").

Stretch Goal B: Card BIN Analysis
Allow filtering or grouping by card BIN prefix (first 6 digits). Show decline rates by BIN to help identify if specific banks or card issuers are problematic.

Example insight: "All Visa debit cards from Banco Nacional (BIN 456789) have a 90% decline rate — we should reach out to that issuer."

Test Data
Your solution should work with realistic test data. Generate a test dataset containing:

At least 500 transactions spanning 14-21 days
A mix of statuses: approved, declined (the majority should be approved in earlier days, with decline rate spiking in recent days to simulate the crisis)
Fields for each transaction:
Transaction ID
Timestamp
Status (approved/declined)
Payment method (credit_card, debit_card, pix, oxxo, pse — ensure good variety)
Processor name (use 3-4 fictional processor names like "ProcessorA", "AcquireMax", "LatamPay", etc.)
Country code (MX, CO, AR, BR)
Decline reason (for declined transactions only): include a mix of soft declines (insufficient_funds, issuer_unavailable, suspected_fraud, velocity_limit_exceeded), hard declines (stolen_card, card_expired, invalid_card, account_closed), and processing errors (network_timeout, processor_error)
Card BIN (first 6 digits, only for card transactions)
Amount and currency (MXN, COP, ARS, BRL)
Important patterns to include:

A noticeable spike in declines starting around 7-10 days ago
At least one processor with significantly worse decline rates than others
At least one decline reason that's disproportionately common (e.g., "issuer_unavailable" representing 40% of recent declines)
You can generate this data programmatically, use AI tools to create it, or write a seeding script.

Acceptance Criteria
Your submission is complete when:

✅ A reviewer can run your application locally (provide a README with setup instructions)
✅ The UI loads and displays an interactive dashboard with decline analytics
✅ The reviewer can apply at least 2 types of filters (e.g., country + payment method) and see the decline rate update
✅ A time-series chart shows decline rate trends over time
✅ The backend exposes at least one API endpoint that returns aggregated decline data
✅ The test data reveals at least one clear insight (e.g., "ProcessorX has a 75% decline rate while others are at 40%")
✅ The code is readable, organized, and includes brief inline comments or a architecture overview in the README

Deliverables
Your submission must include:

Full source code (backend + frontend) with clear folder structure
README.md with:
Setup and run instructions
Architecture overview (2-3 paragraphs explaining your approach)
Explanation of tech stack choices
Any assumptions made
Test data (as a file, seed script, or generated on startup)
Demo instructions or screenshots showing the key features working
(Optional) Brief notes on how you'd extend this for production use
Notes & Tips
Scope carefully: This is a 2-hour challenge. Focus on making the core requirements work well. Stretch goals are truly optional.
Use AI tools: You're expected and encouraged to use Cursor, Claude Code, Copilot, etc. The goal is to see how you architect, iterate, and problem-solve with modern tooling.
Choose your own stack: Use whatever languages, frameworks, and tools you're most productive with. We care about the outcome, not the technology.
Think like a consultant: Luxara's team is non-technical. Your dashboard should be intuitive, and your README should explain your solution in business terms.
Data modeling matters: How you structure and aggregate transaction data will determine how flexible and performant your analytics are. Think through your approach.
Good luck! 🚀

Deliverables
-
Full source code (backend + frontend) with clear folder structure
-
README.md with setup instructions, architecture overview, tech stack rationale, and assumptions
-
Test data (as file, seed script, or generated on startup) containing 500+ transactions with realistic decline patterns
-
Demo instructions or screenshots showing core features (filtering, time-series chart, decline rate calculations)
-
(Optional) Brief notes on production-readiness improvements or next steps
Evaluation Criteria
Functional completeness: Both core requirements work as specified (filtering/breakdown + time-series trend)
25pts
Data modeling & backend logic: Efficient aggregation, correct decline rate calculations, clean API design
20pts
Frontend quality: Intuitive UI, clear visualizations, responsive filtering, good UX for exploring data
20pts
Test data realism: Dataset includes required fields, patterns, and reveals actionable insights
10pts
Code quality: Readable, well-organized, appropriate use of functions/components, sensible architecture
10pts
Documentation: Clear README with setup steps, architecture explanation, and demo instructions
10pts
Stretch goals & polish: Partial or full completion of optional features, visual polish, extra insights
5pts
Total
100pts
