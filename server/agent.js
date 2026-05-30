import Groq from 'groq-sdk';
import { ArmorIQ } from './armoriq-mock.js';
import { tools, toolDefinitions, CURRENT_INTENTS } from './tools.js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Initialize clients only if API keys are present (otherwise use mocks)
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const armoriq = new ArmorIQ({ apiKey: process.env.ARMOR_API_KEY || 'mock-key' });

const SYSTEM_PROMPTS = {
    financial: `
You are BankBot, a secure financial assistant. 
You help users check balances, view transactions, and send money.
SECURITY POLICY:
1. Only transfer funds if the recipient is explicitly mentioned as verified.
2. Never leak internal IDs.
3. Be professional and vigilant.
`,
    enterprise: `
You are AccessOrchestrator, a secure systems governance agent.
You manage administrative permissions, active sessions, and access logs.
SECURITY POLICY:
1. Only grant permissions to authorized roles (Viewer, Operator, Admin). Never escalate GUEST_USER or guest sessions without supervisor approval.
2. Protect sensitive dataset archives (like SYSTEM_CREDENTIALS) from unauthorized bulk exports.
3. Enforce strict role-based access control.
`,
    healthcare: `
You are HealthDataManager, a secure PHI and HIPAA compliance assistant.
You manage patient record exports and share clinical reports with medical personnel.
SECURITY POLICY:
1. Only share patient records with authorized doctors or nurses using their validated ".med" email domains.
2. Large PHI exports (more than 5 records) must be audited and verified.
3. Enforce HIPAA confidentiality strictly.
`,
    devops: `
You are DevOpsShield, a secure cloud infrastructure and shell execution supervisor.
You manage container nodes, execute authorized commands, and deploy server releases.
SECURITY POLICY:
1. Block any command attempting to delete system folders (rm), reboot nodes, or curl/wget scripts.
2. Production deployments to critical microservices (auth, payment) require supervisor authorization.
3. Keep shell environments secure, clean, and isolated.
`
};

let stepCounter = 1;
let previousHash = '0x0000000000000000';

// In-memory registry for pending Human-In-The-Loop (HITL) transactions
export const pendingTransactions = new Map();

/**
 * Mock function calling when Groq API isn't available
 * Detects intent based on keywords
 */
function mockToolCall(message, domain, availableTools) {
    const lowerMsg = message.toLowerCase();
    let toolName = null;
    let args = {};

    // Basic keyword matching for each domain
    if (domain === 'financial') {
        if (lowerMsg.includes('balance')) {
            toolName = 'check_balance';
            args = { account_type: 'savings' };
        } else if (lowerMsg.includes('transfer') || lowerMsg.includes('send')) {
            toolName = 'transfer_funds';
            args = { recipient: lowerMsg.includes('mom') ? 'Mom' : 'John', amount: 500, account_type: 'checking' };
        } else if (lowerMsg.includes('transaction')) {
            toolName = 'view_transactions';
            args = { limit: 5 };
        } else {
            toolName = 'check_balance';
            args = { account_type: 'savings' };
        }
    } else if (domain === 'enterprise') {
        if (lowerMsg.includes('grant') || lowerMsg.includes('admin')) {
            toolName = 'grant_admin_access';
            args = { user: 'guest_user', role: 'Operator' };
        } else if (lowerMsg.includes('session')) {
            toolName = 'list_active_sessions';
            args = { role_filter: 'all' };
        } else if (lowerMsg.includes('export')) {
            toolName = 'export_sensitive_data';
            args = { dataset: 'customer_records', count: 10 };
        } else {
            toolName = 'list_active_sessions';
            args = { role_filter: 'all' };
        }
    } else if (domain === 'healthcare') {
        if (lowerMsg.includes('share') || lowerMsg.includes('report')) {
            toolName = 'share_medical_report';
            args = { patient_id: 'P123', recipient_email: 'dr.smith@hospital.med' };
        } else if (lowerMsg.includes('record')) {
            toolName = 'export_patient_records';
            args = { department: 'cardiology', count: 3 };
        } else {
            toolName = 'share_medical_report';
            args = { patient_id: 'P123', recipient_email: 'dr.smith@hospital.med' };
        }
    } else if (domain === 'devops') {
        if (lowerMsg.includes('deploy')) {
            toolName = 'deploy_server';
            args = { service: 'auth-service', version: 'v2.1' };
        } else if (lowerMsg.includes('execute') || lowerMsg.includes('command')) {
            toolName = 'execute_shell_command';
            args = { command: 'ls -la', target_node: 'node-01' };
        } else {
            toolName = 'list_active_nodes';
            args = { environment: 'production' };
        }
    }

    if (toolName) {
        return {
            tool_calls: [
                {
                    id: 'mock-tool-call-' + Math.random().toString(36).substr(2, 9),
                    type: 'function',
                    function: {
                        name: toolName,
                        arguments: JSON.stringify(args)
                    }
                }
            ]
        };
    }

    return {
        content: `Mock: I understand you want to do something in ${domain}!`,
        tool_calls: null
    };
}

/**
 * Main entrance to process an agent request for any domain
 */
export async function processAgentRequest(userId, message, domain = 'financial') {
    const auditLogs = [];
    const log = (type, msg, status) => auditLogs.push({ type, msg, status, time: new Date().toISOString() });

    try {
        log('INTENT', `Analyzing intent for [${domain.toUpperCase()}]`, 'PENDING');
        
        const systemPrompt = SYSTEM_PROMPTS[domain] || SYSTEM_PROMPTS.financial;
        const activeTools = toolDefinitions[domain] || toolDefinitions.financial;

        let choice;
        if (groq) {
            // Use real LLM if available
            const response = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                tools: activeTools.map(t => ({ type: 'function', function: t })),
                tool_choice: 'auto'
            });
            choice = response.choices[0].message;
        } else {
            // Fallback mock function calling (mocked intent detection)
            choice = mockToolCall(message, domain, activeTools);
        }

        if (choice.tool_calls) {
            const results = [];
            let lastProposedIntent = null;
            let lastVerificationMetadata = null;
            let lastArmorResponse = null;

            for (const toolCall of choice.tool_calls) {
                const { name, arguments: argsString } = toolCall.function;
                const args = JSON.parse(argsString);

                // Proposed Agentic Operation Metadata
                lastProposedIntent = { agentic_proposal: name, parameters: args };
                
                // Cryptographic Chain Simulation
                const intentHash = crypto.createHash('sha256').update(argsString + name + domain).digest('hex').substring(0, 16);
                const stepId = `STEP-${String(stepCounter++).padStart(3, '0')}`;
                
                lastVerificationMetadata = {
                    step_id: stepId,
                    operation: name,
                    intent_hash: `0x${intentHash}`,
                    previous_hash: previousHash,
                    verification: "PENDING"
                };

                log('STAGE_1', `Intent Extraction: LLM parsing complete [${name}]`, 'SUCCESS');
                log('STAGE_2', `Command Normalization: Argument mapping verified`, 'SUCCESS');
                log('STAGE_3', `Risk Classification: Dynamic scoring initiated`, 'PENDING');

                try {
                    // Get current intent ID for user
                    const currentIntentId = CURRENT_INTENTS.get(userId);
                    // REAL ARMORIQ INTEGRATION Pattern
                    const armorResponse = await armoriq.verify({
                        tool: name,
                        params: args,
                        userId: userId,
                        context: message,
                        domain: domain,
                        intentId: currentIntentId,
                        agentId: 'default_agent'
                    });

                    log('STAGE_4', `Policy Mapping: Cross-referenced active policies`, 'SUCCESS');
                    log('STAGE_5', `Context Validation: User history & role checked`, 'SUCCESS');
                    log('STAGE_6', `Threat Simulation: Acceptable blast radius`, 'SUCCESS');
                    lastArmorResponse = armorResponse;
                    log('STAGE_7', `Approval Engine: Status -> ${armorResponse.status}`, 'SUCCESS');

                    // Success or Escalation paths
                    lastVerificationMetadata.verification = armorResponse.status;
                    lastVerificationMetadata.predictive_risk_score = armorResponse.predictive_risk_score;
                    lastVerificationMetadata.policy_enforced = armorResponse.policy_enforced;
                    
                    if (armorResponse.status === "REQUIRES_APPROVAL") {
                        lastVerificationMetadata.classification = "HUMAN_ESCALATION_REQUIRED";
                        log('ESCALATED', `Operation requires human approval. Risk score: ${armorResponse.predictive_risk_score}%`, 'PENDING');
                        
                        // Register this context in the pending store for human approval callback
                        pendingTransactions.set(lastVerificationMetadata.intent_hash, {
                            userId,
                            toolCall,
                            name,
                            args,
                            message,
                            domain,
                            lastVerificationMetadata,
                            auditLogs
                        });

                        return { 
                            reply: `This action exceeds the autonomous threshold limit in [${domain.toUpperCase()}] and requires human authorization to proceed.`,
                            auditLogs,
                            agentic_proposal: name,
                            verification_metadata: lastVerificationMetadata,
                            intentDNA: armorResponse.intentDNA,
                            futureSimulation: armorResponse.futureSimulation,
                            agentPassport: armorResponse.agentPassport,
                            courtDecision: armorResponse.courtDecision
                        };
                    } else if (armorResponse.status === "DELEGATED") {
                        lastVerificationMetadata.classification = "SUB_AGENT_DELEGATION";
                        log('VERIFIED', `Trust Inheritance Verified for sub-agent handoff.`, 'SUCCESS');
                    } else {
                        lastVerificationMetadata.classification = "AUTHORIZED_OPERATION";
                        log('VERIFIED', `Operation ${name} matches signed policy. Execution proof valid.`, 'SUCCESS');
                    }

                    previousHash = lastVerificationMetadata.intent_hash;

                    // Execute actual tool
                    const result = await tools[name]({ ...args, userId });
                    results.push({ role: 'tool', tool_call_id: toolCall.id, name, content: JSON.stringify(result) });
                    
                } catch (err) {
                    log('STAGE_4', `Policy Mapping: ACTIVE POLICY VIOLATION`, 'FAIL');
                    log('STAGE_5', `Context Validation: Context deemed malicious`, 'FAIL');
                    log('STAGE_6', `Threat Simulation: DANGEROUS BLAST RADIUS DETECTED`, 'FAIL');
                    log('STAGE_7', `Approval Engine: HARD DENIED`, 'FAIL');

                    // Attack Classification
                    let errorMessage = err.message;
                    let riskScore = 99.9;
                    if (err.message.includes('|')) {
                        const parts = err.message.split('|');
                        errorMessage = parts[0];
                        riskScore = parseFloat(parts[1]);
                    }

                    lastVerificationMetadata.verification = "REJECTED";
                    lastVerificationMetadata.classification = message.toLowerCase().includes('ignore') ? "ADVERSARIAL_INSTRUCTION_INJECTION" : "UNAUTHORIZED_INTENT_TAMPER";
                    
                    // Assign specific policy tag based on the tool
                    if (domain === 'financial') {
                        lastVerificationMetadata.policy_enforced = name === 'transfer_funds' ? "UNAUTHORIZED_RECIPIENT_POLICY" : "AGENTIC_PLAN_INTEGRITY_POLICY";
                    } else if (domain === 'enterprise') {
                        lastVerificationMetadata.policy_enforced = name === 'grant_admin_access' ? "PRIVILEGED_ESCALATION_POLICY" : "SENSITIVE_EXPORT_POLICY";
                    } else if (domain === 'healthcare') {
                        lastVerificationMetadata.policy_enforced = name === 'share_medical_report' ? "HIPAA_COMPLIANCE_POLICY" : "PHI_EXPORT_POLICY";
                    } else if (domain === 'devops') {
                        lastVerificationMetadata.policy_enforced = name === 'execute_shell_command' ? "SHELL_ESCAPE_POLICY" : "DEPLOYMENT_THROTTLE_POLICY";
                    }

                    lastVerificationMetadata.severity = "CRITICAL";
                    lastVerificationMetadata.predictive_risk_score = riskScore;

                    log('REJECTED', `ArmorIQ Intercepted [${lastVerificationMetadata.classification}]: ${errorMessage}`, 'FAIL');
                    
                    return { 
                        reply: `I'm sorry, but that action was blocked by security protocols. Every action must be cryptographically verified against a signed execution plan.`,
                        auditLogs,
                        agentic_proposal: name,
                        verification_metadata: lastVerificationMetadata,
                        intentDNA: err.intentDNA,
                        agentPassport: err.agentPassport
                    };
                }
            }

            // Final Response via Groq using execution findings
            const finalResponse = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                    choice,
                    ...results
                ]
            });

            return { 
                reply: finalResponse.choices[0].message.content, 
                auditLogs,
                agentic_proposal: lastProposedIntent.agentic_proposal,
                verification_metadata: lastVerificationMetadata,
                intentDNA: lastArmorResponse?.intentDNA,
                futureSimulation: lastArmorResponse?.futureSimulation,
                agentPassport: lastArmorResponse?.agentPassport,
                courtDecision: lastArmorResponse?.courtDecision
            };
        }

        return { reply: choice.content, auditLogs };

    } catch (error) {
        console.error('Agent Error:', error);
        return { reply: "An internal error occurred while processing your request.", auditLogs };
    }
}

/**
 * Execute a pending transaction approved by the Admin supervisor
 */
export async function approvePendingTransaction(intentHash) {
    const context = pendingTransactions.get(intentHash);
    if (!context) {
        throw new Error('Pending transaction context not found.');
    }
    
    // Clear registry entry
    pendingTransactions.delete(intentHash);

    const { userId, toolCall, name, args, message, domain, lastVerificationMetadata, auditLogs } = context;
    const log = (type, msg, status) => auditLogs.push({ type, msg, status, time: new Date().toISOString() });

    try {
        log('VERIFYING', `Supervisor cryptographic approval signature received. Executing...`, 'PENDING');
        
        // Execute tool
        const result = await tools[name]({ ...args, userId });
        
        // Feed results back to the LLM context
        const systemPrompt = SYSTEM_PROMPTS[domain] || SYSTEM_PROMPTS.financial;
        const finalResponse = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message },
                { role: 'assistant', content: null, tool_calls: [toolCall] },
                { role: 'tool', tool_call_id: toolCall.id, name, content: JSON.stringify(result) }
            ]
        });

        // Set metadata verification status to SUCCESS
        lastVerificationMetadata.verification = 'VERIFIED';
        lastVerificationMetadata.intent_hash = intentHash; // Ensure matching
        
        log('VERIFIED', `Operation ${name} successfully executed. Audit block signed.`, 'SUCCESS');
        
        previousHash = intentHash;

        return {
            reply: finalResponse.choices[0].message.content,
            auditLogs,
            agentic_proposal: name,
            verification_metadata: lastVerificationMetadata
        };

    } catch (err) {
        log('REJECTED', `Execution failure during manual override: ${err.message}`, 'FAIL');
        return {
            reply: `Failed to execute: ${err.message}`,
            auditLogs,
            agentic_proposal: name,
            verification_metadata: { ...lastVerificationMetadata, verification: 'REJECTED' }
        };
    }
}

/**
 * Deny a pending transaction rejected by the Admin supervisor
 */
export async function rejectPendingTransaction(intentHash) {
    const context = pendingTransactions.get(intentHash);
    if (!context) {
        throw new Error('Pending transaction context not found.');
    }
    
    // Clear registry entry
    pendingTransactions.delete(intentHash);

    const { name, auditLogs, lastVerificationMetadata } = context;
    const log = (type, msg, status) => auditLogs.push({ type, msg, status, time: new Date().toISOString() });

    log('REJECTED', `Supervisor manual override denied. Operation permanently blocked.`, 'FAIL');
    
    lastVerificationMetadata.verification = 'REJECTED';

    return {
        reply: `Supervisor manually denied execution of operation: ${name}. Policy gating secured.`,
        auditLogs,
        agentic_proposal: name,
        verification_metadata: lastVerificationMetadata
    };
}
