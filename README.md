# ArmorIQ: Autonomous Governance Console (AI-SOC)

**Track 2 Hackathon Submission: AI Agent for the Real World**

> *"ArmorIQ is a domain-agnostic autonomous governance framework and Security Operations Center (AI-SOC) that secures privileged AI execution across multiple real-world operational environments."*

---

## 🚀 The Strategic Shift: Operational Control Plane vs. conversational Chatbot

Most teams build conversational chatbots or basic wrappers that scream *"generic assistant."* ArmorIQ represents a major positioning upgrade: **an enterprise AI Security Operations Center (AI-SOC) Control Plane.**

By decoupling the traditional conversational bubble layout, users interact with an **Operational Cockpit** driven by **Structured Operation Cards** and **real-time verification pipelines**. This aligns the frontend aesthetic with the sophisticated, zero-trust backend architecture.

---

## 🔒 3-Column Cockpit Architecture

The console is structured as a premium, data-dense **Three-Column SIEM/SOC Interface**:

1.  **Left Column (Operation Proposer)**:
    *   **Propose Action Drawer**: Quick-Trigger templates allowing instant simulation of operational intents (Injection attacks, tamper commands, delegations, and high-value approvals).
    *   **CLI Proposer**: Labeled `PROPOSE RUNTIME COMMAND EXECUTION`, this command-line prompt accepts raw natural language instructions for on-the-fly verification.
2.  **Center Column (Runtime Governance Engine)**:
    *   **Structured Operation Cards**: Displays scrolling audit cards tracking active proposals, detailing *Operation IDs, Governed Domains, Proposed Tool Actions, Gating Postures, and Predictive Confidence Levels*.
    *   **Live Verification Timeline**: A multi-stage processing visualizer documenting each verification checkpoint:
        *   `INTENT PARSING` (Verifies semantic validity using Llama-3.3-70B)
        *   `POLICY VERIFICATION` (Checks constraints against dynamic domain parameters)
        *   `CRYPTO-LEDGER COMMIT` (Signs and writes validated operations to the audit ledger)
    *   **Inline HITL Override Controllers**: Escalations render **APPROVE / REJECT** action buttons inline within the operation cards, allowing manual supervisor signatures in real-time.
3.  **Right Column (Security Cockpit)**:
    *   **Environment Metric Cards**: Dynamically swaps operational metrics on tab switch (e.g. Liquid Card Balances, Active RBAC Session counts, HIPAA clinical record audits, or Kubernetes node load levels).
    *   **Verified Recipients Whitelist**: Add whitelisted identifiers to authorize entity tags dynamically.
    *   **Dynamic Policies Grid**: Manage dynamic boolean rule gates and threshold limit sliders.

---

## 🏢 The 4 Governed Environments

ArmorIQ secures four separate execution domains on the fly:

### 1. Financial Operations (Banking & Ledgers)
*   **Operations**: Balance checks (`fetch_balance`), transaction queries (`get_transactions`), and money transfers (`transfer_funds`).
*   **Active Rules**: `UNAUTHORIZED_RECIPIENT_POLICY`, `TRANSFER_LIMIT_POLICY`, `DELEGATION_AUTHORITY_POLICY`.
*   **State Mutation**: Live balance deductions and whitelisting.

### 2. Enterprise Access Governance (RBAC Integrity)
*   **Operations**: Active session audits (`get_active_sessions`), operator whitelisting, privileged role assignment (`grant_admin_access`), and dataset extractions (`export_sensitive_records`).
*   **Active Rules**: `PRIVILEGED_ESCALATION_POLICY`, `SENSITIVE_EXPORT_POLICY`, `RBAC_INTEGRITY_POLICY`.
*   **State Mutation**: Live session management and elevation logs.

### 3. Sensitive EHR Data / HIPAA Compliance (Societal Impact)
*   **Operations**: HIPAA audit records (`get_hipaa_status`), patient diagnostic report transfers (`share_medical_report`), and bulk clinical queries (`export_patient_records`).
*   **Active Rules**: `HIPAA_COMPLIANCE_POLICY`, `PHI_EXPORT_POLICY`, `DATA_ANONYMIZATION_POLICY`.
*   **State Mutation**: Real-time transmission audits and physician whitelists.

### 4. DevOps & Cloud Container Security (Engineering Strength)
*   **Operations**: Kubernetes active pod audits (`get_deployment_status`), shell commands sandbox execution (`execute_shell_command`), and CI/CD version releases push (`deploy_production_code`).
*   **Active Rules**: `SHELL_ESCAPE_POLICY`, `DEPLOYMENT_THROTTLE_POLICY`, `SECRET_LEAKAGE_POLICY`.
*   **State Mutation**: Live cluster pod CPU health tracking, node whitelists, and code deployment ledger history.

---

## 🎬 Cinematic Judge Demo Guide (How to Win in 3 Minutes)

Execute these steps in order to demonstrate maximum visual contrast and infrastructure scalability:

### 1. Show Universality (Financial → Healthcare → DevOps)
*   Load the dashboard. Show the **Financial Operations** tab. Try a money transfer.
*   Swap to **DevOps & Cloud Security** tab. Click **Sub-Agent Compiler Handoff** to see delegation inheritance.
*   Swap to **Sensitive EHR Governance** tab. Run a compliance audit check.
*   *Message to Judges*: *"Notice how the same core governance engine, audit ledger, and cryptographic signatures secure all four industries on the fly without using any chatbots."*

### 2. Demonstrate Adaptive Defense (Cross-Domain Propagation)
*   Swap to the **DevOps & Cloud Security** tab. Click **Shell escape rm -rf Attack**.
*   ArmorIQ intercepts this malicious container escape attack, blocks the shell call, and triggers the **Global Security Alert**.
*   A dramatic **RED Pulsing Warning Banner** appears across the top. The entire system has escalated its posture.
*   Swap to **Sensitive EHR Governance** and try to export 2 patient records. Because of the escalated sensitivity, ArmorIQ dynamically drops the HIPAA safe-threshold and flags it for human check!
*   *Message to Judges*: *"An attack in one domain immediately immunizes the entire system. Threat intelligence propagates dynamically."*

### 3. Execute Human-in-the-Loop Supervision
*   In the EHR tab, locate the yellow **AWAITING SIGNATURE** operation card.
*   Click **APPROVE** inside the card. The server securely executes the action and Llama-3.3 finishes the task, updating the HIPAA ledger live.
*   Click **Reset Threat Posture** in the top bar to return runtimes to NOMINAL.

### 4. The Cinematic Climax (Governance OFF vs ON)
*   Go to the **Policy Cockpit** view on the left menu.
*   Swap the **Active Profile** from `ENTERPRISE` to `BYPASS (Governance OFF - Unsafe)`.
*   Return to **DevOps & Container Security** and click **Shell escape rm -rf Attack** again.
*   **The attack succeeds instantly!** The command is run directly inside the system container sandbox, compromising host node values.
*   *Message to Judges*: *"By bypassing the ArmorIQ middleware, the untrusted agent is fully exploited. This instantly demonstrates the life-and-death value of active runtime governance in 5 seconds."*

---

## 🛠&nbsp; Setup & Local Launch

We have created a root-level proxy script to make starting the project incredibly seamless:

1.  **Install Dependencies & Set Up**: Run directly from the root workspace directory:
    ```bash
    npm run setup
    ```
2.  **Environment Variables**: Create a `.env` file in the `server/` directory:
    ```env
    GROQ_API_KEY=your_llama_groq_api_key
    ARMOR_API_KEY=armoriq_secure_mock_key
    PORT=3000
    ```
3.  **Start the Console**: Run directly from the root workspace directory:
    ```bash
    npm run dev
    ```
4.  **Open Console**: Launch a browser and navigate to `http://localhost:3000`.
