# ArmorIQ: Runtime Governance Infrastructure for Autonomous AI

**Built with ❤️ using Trae IDE** • The Trust Layer for Autonomous AI Systems

> *"ArmorIQ — Govern Every AI Action Before It Executes."*

---

## 🚀 The Strategic Shift: From Passive Monitoring to Active Governance

Most AI security products focus on:
- Monitoring logs
- Detecting bad prompts
- Scanning outputs
- Blocking obvious jailbreaks
- Providing observability dashboards

**They are passive.**

**ArmorIQ is ACTIVE.**

We solve the emerging enterprise problem: **Autonomous AI systems are starting to take actions without deterministic human review.**

---

## 💡 Built with Trae IDE

This entire project was developed end-to-end using **Trae IDE** - the intelligent development environment for AI-powered applications. Trae IDE provided:

- **AI-assisted code generation** for both frontend and backend components
- **Real-time debugging** and error resolution
- **Smart refactoring** and optimization suggestions
- **Seamless integration** with AI APIs (Groq, OpenAI)
- **Project scaffolding** and best practice recommendations

---

## 🛡️ The Real Danger We Solve

The real risk is not:
- "Bad prompts"
- "Hallucinations"
- "Chatbot misuse"

The real danger is:
- Unauthorized autonomous execution
- Privilege escalation across tools
- Chain-of-action abuse
- Unsafe financial operations
- Silent data exfiltration
- AI-to-AI trust failures
- MCP/tool poisoning
- Runaway agent loops
- Policy drift
- Shadow agents inside enterprises

---

## 🏗️ Product Architecture

### Layer 1 — Agent SDK
Developers integrate:
- Python SDK
- TypeScript SDK
- LangChain middleware
- OpenAI Agents SDK wrapper
- MCP middleware
- CrewAI integration
- AutoGen integration

This allows ArmorIQ to intercept:
- Tool calls
- Memory access
- Agent delegation
- Execution chains

### Layer 2 — Runtime Interceptor
This is the core. Every action passes through:
- Policy engine
- Intent verifier
- Risk analyzer
- Behavioral model
- Trust engine

before execution.

### Layer 3 — Policy Engine
Enterprise defines policies like:
- "No financial transfers above $10k without approval"
- "AI cannot access HR records after 8PM"
- "External API calls blocked for confidential workflows"
- "Code deployment requires human verification"

Policies become executable runtime rules.

### Layer 4 — Trust Graph
Tracks:
- Agents
- Tools
- Users
- Permissions
- Data sensitivity
- Workflows
- Execution lineage

This creates: **Real-time AI trust mapping.**

### Layer 5 — Governance Dashboard
Shows:
- Active agents
- Risk heatmaps
- Execution chains
- Blocked actions
- Anomalous behaviors
- Compliance trails
- Live approvals

---

## 🔑 Core Innovations

### 1. Execution-Centric Governance
ArmorIQ governs:
- Actions
- Chains
- Tool execution
- Permissions
- Intent continuity
- Runtime behavior

**NOT just prompts.**

### 2. Intent Continuity Verification
Every autonomous workflow starts with:
- Objective
- Context
- Constraints
- Permissions
- Trust scope

ArmorIQ continuously checks: **Is the agent still operating within the original approved intent?**

This is huge because most AI failures happen:
- Mid-execution
- After tool chaining
- After context mutation
- After external input injection

**Not at initial prompting.**

### 3. Dynamic Risk Escalation
Instead of static permissions. Example:
- An AI assistant normally reads documents & sends emails (low risk)
- But suddenly accesses payroll, exports customer records, invokes external APIs (risk escalates)

ArmorIQ:
- Pauses execution
- Requests approval
- Reduces permissions
- Sandboxes execution
- Blocks actions

### 4. Human-in-the-Loop Governance
Not every action should be blocked. ArmorIQ intelligently decides:
- Allow
- Monitor
- Sandbox
- Escalate
- Require approval
- Terminate workflow

based on:
- Risk
- Trust score
- Sensitivity
- Anomaly score
- Intent deviation

### 5. Execution Graph Analysis
ArmorIQ tracks entire execution chains. **Not isolated actions.**

Example:
- Reading one document = safe
- Reading 500 sensitive files + external upload = dangerous

The system understands:
- Cumulative risk
- Chain behavior
- Workflow intent
- Sequence anomalies

---

## 🎬 Strongest Demo: "Compromised Enterprise AI Agent"

**Flow:**
1. AI assistant receives task
2. Begins normal operations
3. Malicious prompt/tool injection occurs
4. Agent attempts abnormal actions
5. ArmorIQ detects:
   - Intent drift
   - Abnormal execution chain
   - Permission escalation
   - Sensitive access pattern
6. ArmorIQ:
   - Pauses workflow
   - Isolates execution
   - Requests approval
   - Explains risk reasoning
7. Dashboard visualizes:
   - Attack path
   - Execution graph
   - Trust violations
   - Prevented breach

---

## 🛠️ Setup & Local Launch

We have created a root-level proxy script to make starting the project incredibly seamless:

1. **Install Dependencies & Set Up**: Run directly from the root workspace directory:
```bash
npm run setup
```

2. **Environment Variables**: Create a `.env` file in the `server/` directory (already provided):
```env
GROQ_API_KEY=your_groq_api_key_here
ARMOR_API_KEY=ak_live_f47775b3aa2ffdf821c4ef8124684c21623987ab769e2d1b4ab3947776cd525
PORT=3000
```

3. **Start the Console**: Run directly from the root workspace directory:
```bash
npm run dev
```

4. **Open Console**: Launch a browser and navigate to `http://localhost:3000`.

---

## 🎯 Final Refined Taglines

- **Enterprise**: "Runtime Governance for Autonomous AI"
- **Technical**: "Intent-Aware Execution Control for AI Agents"
- **Investor-Friendly**: "The Trust Layer for Autonomous AI Systems"
- **Strongest Overall**: "ArmorIQ — Govern Every AI Action Before It Executes."

---

## 🔮 The Future

ArmorIQ evolves into: **The Operating System for Trusted Autonomous AI.**

Future companies will not deploy autonomous agents without governance infrastructure. Exactly like:
- Cloud workloads need CrowdStrike
- APIs need gateways
- Users need IAM

AI agents will need: **Runtime Governance Infrastructure.**

That is ArmorIQ.
