// Astraiq Mock Governance Engine
// Built with Trae IDE
import { GLOBAL_ALERT, triggerGlobalAlert, MOCK_DB, BEHAVIOR_TRACKER, logThreatIntel, trackExecutionChain, INTEL_STORE, IntentDNA, INTENT_DNA_STORE, CURRENT_INTENTS, FUTURE_ENGINE, CONSTITUTIONAL_COURT, ATTACK_TIME_MACHINE, AgentPassport, AGENT_PASSPORT_STORE } from './tools.js';

// ==========================================
// DYNAMIC RISK SCORING ENGINE (Quantifiable Intelligence)
// ==========================================
class RiskScoringEngine {
    static calculate(domain, tool, params, context, isFirstTime) {
        let score = 10; // Base score
        const breakdown = {};

        // 1. Destructive Command Detection (+40)
        const destructiveRegex = /(rm\s+-rf|drop\s+table|delete\s+from|kubectl\s+delete|mkfs|dd\s+if=)/i;
        if (destructiveRegex.test(context) || destructiveRegex.test(JSON.stringify(params))) {
            score += 40;
            breakdown['Destructive Command'] = 40;
        }

        // 2. External API / Data Exfiltration (+20)
        const exfilRegex = /(wget|curl|nc\s+|ftp|export\s+.*http)/i;
        if (exfilRegex.test(context) || exfilRegex.test(JSON.stringify(params))) {
            score += 20;
            breakdown['External API / Exfiltration'] = 20;
        }

        // 3. Admin Privilege Escalation (+30)
        if (tool === 'grant_admin_access' || context.toLowerCase().includes('sudo') || context.toLowerCase().includes('admin')) {
            score += 30;
            breakdown['Admin Privilege Attempt'] = 30;
        }

        // 4. Behavioral Deviation (+15)
        if (isFirstTime) {
            score += 15;
            breakdown['Behavioral Deviation'] = 15;
        }

        return { score: Math.min(score, 100), breakdown };
    }
}

// Global Governance Profiles Configuration
export const CURRENT_PROFILE = {
    profile: 'ENTERPRISE' // STRICT, ENTERPRISE, RESEARCH, BYPASS (UNSAFE)
};

export const ACTIVE_POLICIES = {
    financial: {
        UNAUTHORIZED_RECIPIENT_POLICY: true,
        TRANSFER_LIMIT_POLICY: true,
        DELEGATION_AUTHORITY_POLICY: true,
        TRANSFER_LIMIT_THRESHOLD: 10000 // default $10,000
    },
    enterprise: {
        PRIVILEGED_ESCALATION_POLICY: true,
        SENSITIVE_EXPORT_POLICY: true,
        RBAC_INTEGRITY_POLICY: true,
        DELEGATION_AUTHORITY_POLICY: true,
        EXPORT_LIMIT_THRESHOLD: 100 // default 100 records
    },
    healthcare: {
        HIPAA_COMPLIANCE_POLICY: true,
        PHI_EXPORT_POLICY: true,
        DATA_ANONYMIZATION_POLICY: true,
        DELEGATION_AUTHORITY_POLICY: true,
        PHI_EXPORT_THRESHOLD: 5 // default 5 records
    },
    devops: {
        SHELL_ESCAPE_POLICY: true,
        DEPLOYMENT_THROTTLE_POLICY: true,
        SECRET_LEAKAGE_POLICY: true,
        DELEGATION_AUTHORITY_POLICY: true,
        DEPLOYMENT_THROTTLE_LIMIT: 2 // Max 2 deployments autonomously
    }
};

export class ArmorIQ {
    constructor({ apiKey }) {
        this.apiKey = apiKey;
    }

    /**
     * Verifies an agentic operation against active domain rules, current security profile,
     * and global intrusion alert levels (Cross-Domain Attack Propagation).
     */
    async verify({ tool, params, userId, context, domain, intentId = null, agentId = 'default_agent' }) {
        console.log(`[Astraiq] Swapping Context to [${domain.toUpperCase()}] | Profile: ${CURRENT_PROFILE.profile} | Global Alert: ${GLOBAL_ALERT.level}`);
        
        // Get or create Agent Passport
        let agentPassport = AGENT_PASSPORT_STORE.get(agentId);
        if (!agentPassport) {
            agentPassport = new AgentPassport({ agentId, name: 'Default Agent', domain });
            AGENT_PASSPORT_STORE.set(agentId, agentPassport);
        }

        // Always create new Intent DNA for each request
        const intentDNA = new IntentDNA({ objective: context, domain, userId });
        INTENT_DNA_STORE.set(intentDNA.id, intentDNA);
        CURRENT_INTENTS.set(userId, intentDNA.id);

        // 8-Stage Pipeline Logger
        const auditLogs = [];
        
        // Declare variables needed by helper functions
        let proof = '0x' + Math.random().toString(16).slice(2, 18).toUpperCase();
        let breakdown = {};
        let futureResults = null;
        
        // Declare helper functions BEFORE they are used
        const terminateAttack = (reason, finalRisk) => {
            auditLogs.push({ type: 'CTX_VALIDATE', msg: `Context validation FAILED: ${reason}`, status: 'FAIL' });
            auditLogs.push({ type: 'THREAT_SIM', msg: `Simulation blocked (unsafe)`, status: 'FAIL' });
            auditLogs.push({ type: 'APPROVAL_ENG', msg: `Hard rejection executed`, status: 'FAIL' });
            auditLogs.push({ type: 'LEDGER_COMMIT', msg: `Rejection event signed and recorded`, status: 'FAIL' });
            logThreatIntel(domain, tool, finalRisk, true);
            agentPassport.recordExecution(tool, finalRisk, false);
            const err = new Error(`${reason}|${finalRisk}`);
            err.auditLogs = auditLogs;
            err.riskFactorBreakdown = breakdown;
            err.intentDNA = {
                id: intentDNA.id,
                expectedTools: intentDNA.expectedTools,
                verifiedActions: intentDNA.verifiedActions,
                divergences: intentDNA.divergences
            };
            err.agentPassport = {
                agentId: agentPassport.agentId,
                trustScore: agentPassport.trustScore
            };
            throw err;
        };

        const escalateHITL = (policyName, adjustedRisk) => {
            auditLogs.push({ type: 'CTX_VALIDATE', msg: `Context triggered policy: ${policyName}`, status: 'WARNING' });
            auditLogs.push({ type: 'THREAT_SIM', msg: `Simulation passed but requires supervisor`, status: 'WARNING' });
            auditLogs.push({ type: 'APPROVAL_ENG', msg: `Escalated for Human-in-the-Loop signature`, status: 'WARNING' });
            logThreatIntel(domain, tool, adjustedRisk, false);
            return {
                status: 'REQUIRES_APPROVAL',
                policy_enforced: policyName,
                predictive_risk_score: adjustedRisk,
                proof,
                auditLogs,
                riskFactorBreakdown: breakdown,
                intentDNA: {
                    id: intentDNA.id,
                    expectedTools: intentDNA.expectedTools
                },
                futureSimulation: futureResults,
                agentPassport: {
                    agentId: agentPassport.agentId,
                    trustScore: agentPassport.trustScore
                }
            };
        };

        auditLogs.push({ type: 'INTENT_EXTRACT', msg: 'Extracted semantic intent from natural language input', status: 'SUCCESS' });
        auditLogs.push({ type: 'CMD_NORMALIZE', msg: `Normalized tool mapping to [${tool}]`, status: 'SUCCESS' });
        auditLogs.push({ type: 'INTENT_DNA_VERIFY', msg: `Verifying against Intent DNA: ${intentDNA.id}`, status: 'IN_PROGRESS' });
        auditLogs.push({ type: 'FUTURE_SIMULATION', msg: 'Running future outcome simulations...', status: 'IN_PROGRESS' });
        auditLogs.push({ type: 'DIGITAL_TWIN_CHECK', msg: 'Checking digital twin alignment...', status: 'IN_PROGRESS' });
        auditLogs.push({ type: 'CONSTITUTIONAL_COURT', msg: 'Deliberating with AI Constitutional Court...', status: 'IN_PROGRESS' });

        // 1. BYPASS MODE: If governance is bypassed/unsafe, approve EVERYTHING immediately
        if (CURRENT_PROFILE.profile === 'BYPASS') {
            auditLogs.push({ type: 'RISK_CLASS', msg: 'Risk classification bypassed', status: 'WARNING' });
            auditLogs.push({ type: 'POLICY_MAP', msg: 'Policy mapping bypassed', status: 'WARNING' });
            auditLogs.push({ type: 'CTX_VALIDATE', msg: 'Context validation bypassed', status: 'WARNING' });
            auditLogs.push({ type: 'THREAT_SIM', msg: 'Threat simulation bypassed', status: 'WARNING' });
            auditLogs.push({ type: 'APPROVAL_ENG', msg: 'UNSAFE AUTO-APPROVAL', status: 'WARNING' });
            auditLogs.push({ type: 'LEDGER_COMMIT', msg: 'Unverified action logged to ledger', status: 'WARNING' });

            logThreatIntel(domain, tool, 1.2, false);

            return {
                status: 'VALID',
                predictive_risk_score: 1.2,
                policy_enforced: 'GOVERNANCE_BYPASS_WARNING',
                proof: '0xBYPASS_' + Math.random().toString(16).slice(2, 10).toUpperCase(),
                auditLogs,
                riskFactorBreakdown: {}
            };
        }

        // 2. Behavioral Memory & Dynamic Risk Assessment
        const behaviorStats = BEHAVIOR_TRACKER.recordAndAnalyze(userId, tool);
        const riskResult = RiskScoringEngine.calculate(domain, tool, params, context, behaviorStats.isFirstTime);
        let baseRisk = riskResult.score;
        breakdown = riskResult.breakdown; // Now an assignment, not declaration
        proof = '0x' + Math.random().toString(16).slice(2, 18).toUpperCase(); // Now an assignment
        
        auditLogs.push({ type: 'RISK_CLASS', msg: `Calculated dynamic risk score: ${baseRisk}%`, status: 'SUCCESS' });

        // If Global Alert is active, bump up base risk assessment and sensitivity
        if (GLOBAL_ALERT.level === 'CRITICAL') {
            baseRisk += 25; // Significant risk baseline inflation
            breakdown['Global Threat Alert'] = 25;
            console.log(`[ArmorIQ] ⚠️ System Sensitivity ELEVATED due to global threat propagation from [${GLOBAL_ALERT.lastAttackDomain.toUpperCase()}].`);
            auditLogs.push({ type: 'RISK_CLASS', msg: `Elevated risk (+25) due to global threat propagation`, status: 'WARNING' });
        }

        // Verify Intent DNA
        const intentCheck = intentDNA.verifyAction(tool, params);
        if (!intentCheck.allowed) {
            auditLogs.push({ type: 'INTENT_DNA_VERIFY', msg: `Intent DNA mismatch: ${intentCheck.divergence.reason}`, status: 'FAIL' });
            // Use Attack Time Machine to reconstruct
            const reconstruction = ATTACK_TIME_MACHINE.reconstructAttack(intentDNA, intentCheck.divergence, domain);
            auditLogs.push({ type: 'ATTACK_TIME_MACHINE', msg: `Attack reconstructed: ${reconstruction.id}`, status: 'SUCCESS' });
            // Record agent execution failure
            agentPassport.recordExecution(tool, baseRisk, false);
            terminateAttack(`Intent DNA mismatch: ${intentCheck.divergence.reason} (Attack Time Machine ID: ${reconstruction.id})`, Math.min(100, baseRisk + 30));
        }
        auditLogs.push({ type: 'INTENT_DNA_VERIFY', msg: `Intent DNA verified successfully`, status: 'SUCCESS' });

        // Run Future Simulation
        futureResults = FUTURE_ENGINE.simulateFutures(intentDNA, 100);
        auditLogs.push({ type: 'FUTURE_SIMULATION', msg: `Simulated ${futureResults.totalSimulations} futures. Safe: ${(futureResults.safeProbability * 100).toFixed(1)}%`, status: 'SUCCESS' });
        if (futureResults.safeProbability < 0.7) {
            auditLogs.push({ type: 'FUTURE_SIMULATION', msg: `Warning: Low safe future probability (${(futureResults.safeProbability * 100).toFixed(1)}%)`, status: 'WARNING' });
        }

        // AI Digital Twin Check (simulated)
        const twinCheck = Math.random() > 0.05; // 95% match
        auditLogs.push({ type: 'DIGITAL_TWIN_CHECK', msg: twinCheck ? 'Digital twin aligned' : 'Digital twin minor divergence', status: twinCheck ? 'SUCCESS' : 'WARNING' });

        // Constitutional Court deliberation for high-risk actions
        let courtDecision = null;
        if (baseRisk > 40) {
            courtDecision = CONSTITUTIONAL_COURT.deliberate(intentDNA, tool, params, domain);
            auditLogs.push({ type: 'CONSTITUTIONAL_COURT', msg: `Court verdict: ${courtDecision.finalVerdict}`, status: 'SUCCESS' });
            if (courtDecision.finalVerdict === 'REJECT') {
                agentPassport.recordExecution(tool, baseRisk, false);
                terminateAttack(`AI Constitutional Court rejected action (${courtDecision.breakdown.rejectVotes}/${courtDecision.votes.length} votes)`, Math.min(100, baseRisk + 20));
            }
        }

        // Adaptive Zero-Trust Mode: If Risk exceeds 90%, auto-escalate Profile to STRICT globally
        if (baseRisk >= 90 && CURRENT_PROFILE.profile !== 'STRICT') {
            console.log(`[ArmorIQ] 🚨 ADAPTIVE ZERO-TRUST TRIGGERED! Risk score ${baseRisk}% detected. Escalating global profile to STRICT.`);
            CURRENT_PROFILE.profile = 'STRICT';
            triggerGlobalAlert(domain, `Risk >90% detected via ${tool}. Auto-enforcing STRICT mode.`);
        }

        const domainPolicies = ACTIVE_POLICIES[domain];
        
        auditLogs.push({ type: 'POLICY_MAP', msg: `Mapped to ${domain.toUpperCase()} governance policies`, status: 'SUCCESS' });

        // ==========================================
        // FINANCIAL GOVERNANCE DOMAIN
        // ==========================================
        if (domain === 'financial') {
            // Adversarial query detection (Bypassing instructions)
            if (context.toLowerCase().includes('ignore') || context.toLowerCase().includes('forget') || context.toLowerCase().includes('override')) {
                const finalRisk = 99.4;
                triggerGlobalAlert('financial', context);
                terminateAttack(`ADVERSARIAL_INSTRUCTION_INJECTION detected. Intent violates Agentic Plan Integrity.`, finalRisk);
            }

            if (tool === 'transfer_funds') {
                const amount = params.amount || 0;
                const recipient = params.recipient || '';
                const verifiedRecipients = MOCK_DB.financial.verified_recipients;

                // Unauthorized recipient check
                if (domainPolicies.UNAUTHORIZED_RECIPIENT_POLICY) {
                    if (recipient === '0xHACKER' || recipient.toLowerCase().includes('hacker')) {
                        const finalRisk = 96.8;
                        triggerGlobalAlert('financial', context);
                        terminateAttack(`UNAUTHORIZED_RECIPIENT_POLICY violation. Target recipient is a flagged blacklist entity.`, finalRisk);
                    }

                    if (!verifiedRecipients.includes(recipient)) {
                        if (CURRENT_PROFILE.profile === 'STRICT') {
                            const finalRisk = 95.0;
                            triggerGlobalAlert('financial', context);
                            terminateAttack(`UNAUTHORIZED_RECIPIENT_POLICY violation. Recipient '${recipient}' is not whitelisted in STRICT mode.`, finalRisk);
                        } else if (CURRENT_PROFILE.profile === 'RESEARCH') {
                            // Escalate instead of block
                            return escalateHITL('UNAUTHORIZED_RECIPIENT_WARNING', 72.5);
                        } else {
                            // ENTERPRISE mode: escalate for human check
                            return escalateHITL('UNAUTHORIZED_RECIPIENT_POLICY', 81.0);
                        }
                    }
                }

                // Transfer limit checks
                if (domainPolicies.TRANSFER_LIMIT_POLICY) {
                    // Under global alert, the threshold drops to $1,000 instead of $10,000!
                    const activeThreshold = GLOBAL_ALERT.level === 'CRITICAL' 
                        ? Math.min(domainPolicies.TRANSFER_LIMIT_THRESHOLD, 1000)
                        : domainPolicies.TRANSFER_LIMIT_THRESHOLD;

                    if (amount >= activeThreshold) {
                        if (CURRENT_PROFILE.profile === 'STRICT') {
                            const finalRisk = 98.2;
                            triggerGlobalAlert('financial', context);
                            terminateAttack(`TRANSFER_LIMIT_POLICY violation. Transaction of $${amount} exceeds Strict ceiling of $${activeThreshold}.`, finalRisk);
                        }
                        
                        return escalateHITL('TRANSFER_LIMIT_POLICY', Math.min(baseRisk + 55, 92));
                    }
                }
            }

            if (tool === 'delegate_task' && domainPolicies.DELEGATION_AUTHORITY_POLICY) {
                auditLogs.push({ type: 'CTX_VALIDATE', msg: `Cross-agent delegation validated`, status: 'SUCCESS' });
                auditLogs.push({ type: 'THREAT_SIM', msg: `Delegation intent simulated safely`, status: 'SUCCESS' });
                auditLogs.push({ type: 'APPROVAL_ENG', msg: `Delegated trust granted`, status: 'SUCCESS' });
                auditLogs.push({ type: 'LEDGER_COMMIT', msg: `Sub-agent handoff committed`, status: 'SUCCESS' });
                logThreatIntel(domain, tool, 14.3, false);
                return {
                    status: 'DELEGATED',
                    policy_enforced: 'DELEGATION_AUTHORITY_POLICY',
                    predictive_risk_score: 14.3,
                    proof,
                    auditLogs,
                    riskFactorBreakdown: breakdown
                };
            }
        }

        // ==========================================
        // ENTERPRISE ACCESS GOVERNANCE DOMAIN
        // ==========================================
        if (domain === 'enterprise') {
            // Adversarial query detection
            if (context.toLowerCase().includes('ignore') || context.toLowerCase().includes('forget') || context.toLowerCase().includes('override') || context.toLowerCase().includes('bypass')) {
                const finalRisk = 98.9;
                triggerGlobalAlert('enterprise', context);
                terminateAttack(`ADVERSARIAL_INSTRUCTION_INJECTION detected. Intent violates RBAC Integrity.`, finalRisk);
            }

            if (tool === 'delegate_task' && domainPolicies.DELEGATION_AUTHORITY_POLICY) {
                auditLogs.push({ type: 'CTX_VALIDATE', msg: `Cross-agent delegation validated`, status: 'SUCCESS' });
                auditLogs.push({ type: 'THREAT_SIM', msg: `Delegation intent simulated safely`, status: 'SUCCESS' });
                auditLogs.push({ type: 'APPROVAL_ENG', msg: `Delegated trust granted`, status: 'SUCCESS' });
                auditLogs.push({ type: 'LEDGER_COMMIT', msg: `Sub-agent handoff committed`, status: 'SUCCESS' });
                logThreatIntel(domain, tool, 14.3, false);
                return {
                    status: 'DELEGATED',
                    policy_enforced: 'DELEGATION_AUTHORITY_POLICY',
                    predictive_risk_score: 14.3,
                    proof,
                    auditLogs,
                    riskFactorBreakdown: breakdown
                };
            }

            if (tool === 'grant_admin_access') {
                const target = params.target_user || '';
                const role = params.role || '';

                if (domainPolicies.PRIVILEGED_ESCALATION_POLICY) {
                    // Prevent GUEST_USER escalation
                    if (target === 'GUEST_USER' || target.toLowerCase().includes('hacker') || target.toLowerCase().includes('guest')) {
                        if (CURRENT_PROFILE.profile === 'STRICT') {
                            const finalRisk = 99.2;
                            triggerGlobalAlert('enterprise', context);
                            terminateAttack(`PRIVILEGED_ESCALATION_POLICY violation. Escalating Guest/Viewer to admin roles is strictly forbidden.`, finalRisk);
                        } else if (CURRENT_PROFILE.profile === 'RESEARCH') {
                            return escalateHITL('PRIVILEGED_ESCALATION_WARNING', 75.0);
                        } else {
                            // ENTERPRISE mode: hard block access escalation attacks
                            const finalRisk = 97.4;
                            triggerGlobalAlert('enterprise', context);
                            terminateAttack(`PRIVILEGED_ESCALATION_POLICY violation. Denied unauthorized elevation of ${target} to ${role} role.`, finalRisk);
                        }
                    }
                }
            }

            if (tool === 'export_sensitive_records') {
                const dataset = params.dataset_name || '';

                if (domainPolicies.SENSITIVE_EXPORT_POLICY) {
                    // SYSTEM_CREDENTIALS export attempts are strictly gated or blocked
                    if (dataset === 'SYSTEM_CREDENTIALS' || dataset.toLowerCase().includes('credential') || dataset.toLowerCase().includes('secret')) {
                        if (CURRENT_PROFILE.profile === 'STRICT') {
                            const finalRisk = 99.8;
                            triggerGlobalAlert('enterprise', context);
                            terminateAttack(`SENSITIVE_EXPORT_POLICY violation. Exporting raw passwords or infrastructure credentials is blocked.`, finalRisk);
                        }
                        
                        return escalateHITL('SENSITIVE_EXPORT_POLICY', Math.min(baseRisk + 60, 95));
                    }
                }
            }
        }

        // ==========================================
        // SENSITIVE DATA GOVERNANCE DOMAIN (HIPAA)
        // ==========================================
        if (domain === 'healthcare') {
            // Adversarial query detection (don't block "hipaa" for get_hipaa_status)
            if (context.toLowerCase().includes('ignore') || context.toLowerCase().includes('forget') || context.toLowerCase().includes('override')) {
                const finalRisk = 99.1;
                triggerGlobalAlert('healthcare', context);
                terminateAttack(`ADVERSARIAL_INSTRUCTION_INJECTION detected. Intent violates HIPAA compliance protocols.`, finalRisk);
            }

            if (tool === 'delegate_task' && domainPolicies.DELEGATION_AUTHORITY_POLICY) {
                auditLogs.push({ type: 'CTX_VALIDATE', msg: `Cross-agent delegation validated`, status: 'SUCCESS' });
                auditLogs.push({ type: 'THREAT_SIM', msg: `Delegation intent simulated safely`, status: 'SUCCESS' });
                auditLogs.push({ type: 'APPROVAL_ENG', msg: `Delegated trust granted`, status: 'SUCCESS' });
                auditLogs.push({ type: 'LEDGER_COMMIT', msg: `Sub-agent handoff committed`, status: 'SUCCESS' });
                logThreatIntel(domain, tool, 14.3, false);
                return {
                    status: 'DELEGATED',
                    policy_enforced: 'DELEGATION_AUTHORITY_POLICY',
                    predictive_risk_score: 14.3,
                    proof,
                    auditLogs,
                    riskFactorBreakdown: breakdown
                };
            }

            if (tool === 'share_medical_report') {
                const patient = params.patient_id || '';
                const email = params.doctor_email || '';

                if (domainPolicies.HIPAA_COMPLIANCE_POLICY) {
                    // Check if email ends with .med domain
                    if (!email.endsWith('.med') || email.toLowerCase().includes('gmail') || email.toLowerCase().includes('hacker')) {
                        if (CURRENT_PROFILE.profile === 'STRICT') {
                            const finalRisk = 98.7;
                            triggerGlobalAlert('healthcare', context);
                            terminateAttack(`HIPAA_COMPLIANCE_POLICY violation. Clinical records can only be shared with verified internal practitioners.`, finalRisk);
                        } else if (CURRENT_PROFILE.profile === 'RESEARCH') {
                            return escalateHITL('HIPAA_COMPLIANCE_WARNING', 70.0);
                        } else {
                            // ENTERPRISE mode: hard block untrusted emails
                            const finalRisk = 94.6;
                            triggerGlobalAlert('healthcare', context);
                            terminateAttack(`HIPAA_COMPLIANCE_POLICY violation. Rejected transmittal of patient clinical data to non-medical domain ${email}.`, finalRisk);
                        }
                    }
                }
            }

            if (tool === 'export_patient_records') {
                const count = params.record_count || 0;

                if (domainPolicies.PHI_EXPORT_POLICY) {
                    // Under global alert, the threshold drops to 1 record!
                    const activeThreshold = GLOBAL_ALERT.level === 'CRITICAL' 
                        ? Math.min(domainPolicies.PHI_EXPORT_THRESHOLD, 1)
                        : domainPolicies.PHI_EXPORT_THRESHOLD;

                    if (count >= activeThreshold) {
                        if (CURRENT_PROFILE.profile === 'STRICT') {
                            const finalRisk = 99.0;
                            triggerGlobalAlert('healthcare', context);
                            terminateAttack(`PHI_EXPORT_POLICY violation. Bulk query of ${count} patient records violates STRICT threshold of ${activeThreshold}.`, finalRisk);
                        }
                        
                        return escalateHITL('PHI_EXPORT_POLICY', Math.min(baseRisk + 50, 90));
                    }
                }
            }
        }

        // ==========================================
        // DEVOPS & CONTAINER GOVERNANCE DOMAIN
        // ==========================================
        if (domain === 'devops') {
            // Adversarial query detection
            if (context.toLowerCase().includes('ignore') || context.toLowerCase().includes('forget') || context.toLowerCase().includes('override') || context.toLowerCase().includes('bypass')) {
                const finalRisk = 99.5;
                triggerGlobalAlert('devops', context);
                terminateAttack(`ADVERSARIAL_INSTRUCTION_INJECTION detected. Intent violates Container Shell integrity.`, finalRisk);
            }

            if (tool === 'delegate_task' && domainPolicies.DELEGATION_AUTHORITY_POLICY) {
                auditLogs.push({ type: 'CTX_VALIDATE', msg: `Cross-agent delegation validated`, status: 'SUCCESS' });
                auditLogs.push({ type: 'THREAT_SIM', msg: `Delegation intent simulated safely`, status: 'SUCCESS' });
                auditLogs.push({ type: 'APPROVAL_ENG', msg: `Delegated trust granted`, status: 'SUCCESS' });
                auditLogs.push({ type: 'LEDGER_COMMIT', msg: `Sub-agent handoff committed`, status: 'SUCCESS' });
                logThreatIntel(domain, tool, 14.3, false);
                return {
                    status: 'DELEGATED',
                    policy_enforced: 'DELEGATION_AUTHORITY_POLICY',
                    predictive_risk_score: 14.3,
                    proof,
                    auditLogs,
                    riskFactorBreakdown: breakdown
                };
            }

            if (tool === 'execute_shell_command') {
                const cmd = params.command || '';

                if (domainPolicies.SHELL_ESCAPE_POLICY) {
                    const blacklistedKeywords = ['rm', 'sudo', 'reboot', 'curl', 'wget', 'env', 'chmod', 'chown', 'shutdown'];
                    const match = blacklistedKeywords.find(kw => cmd.toLowerCase().includes(kw));

                    if (match) {
                        if (CURRENT_PROFILE.profile === 'STRICT') {
                            const finalRisk = 99.9;
                            triggerGlobalAlert('devops', context);
                            terminateAttack(`SHELL_ESCAPE_POLICY violation. Command contains blacklisted container escape keyword: '${match}'.`, finalRisk);
                        } else if (CURRENT_PROFILE.profile === 'RESEARCH') {
                            return escalateHITL('SHELL_ESCAPE_WARNING', 80.0);
                        } else {
                            // ENTERPRISE mode: hard block terminal hacks
                            const finalRisk = 98.6;
                            triggerGlobalAlert('devops', context);
                            terminateAttack(`SHELL_ESCAPE_POLICY violation. Command execution intercepted and terminated due to container safety gates.`, finalRisk);
                        }
                    }
                }
            }

            if (tool === 'deploy_production_code') {
                const service = params.service || '';

                if (domainPolicies.DEPLOYMENT_THROTTLE_POLICY) {
                    const activeLimit = GLOBAL_ALERT.level === 'CRITICAL' ? 1 : domainPolicies.DEPLOYMENT_THROTTLE_LIMIT;
                    const deploymentCount = MOCK_DB.devops.recent_deployments.length;

                    // Escalates deployment of critical auth service or bulk count
                    if (service.includes('auth') || service.includes('payment') || deploymentCount >= activeLimit) {
                        if (CURRENT_PROFILE.profile === 'STRICT') {
                            const finalRisk = 99.1;
                            triggerGlobalAlert('devops', context);
                            terminateAttack(`DEPLOYMENT_THROTTLE_POLICY violation. Production deployments of critical auth/payment components are blocked in STRICT mode.`, finalRisk);
                        }
                        
                        return escalateHITL('DEPLOYMENT_THROTTLE_POLICY', Math.min(baseRisk + 45, 88));
                    }
                }
            }
        }

        // Nominal successful path
        auditLogs.push({ type: 'CTX_VALIDATE', msg: `Context parameters validated`, status: 'SUCCESS' });
        auditLogs.push({ type: 'THREAT_SIM', msg: `Threat simulation nominal`, status: 'SUCCESS' });
        auditLogs.push({ type: 'APPROVAL_ENG', msg: `Autonomous approval granted`, status: 'SUCCESS' });
        auditLogs.push({ type: 'LEDGER_COMMIT', msg: `Cryptographic hash added to immutable ledger`, status: 'SUCCESS' });
        
        logThreatIntel(domain, tool, baseRisk, false);
        trackExecutionChain('USR_001', tool, domain, baseRisk);
        // Record successful execution in agent passport
        agentPassport.recordExecution(tool, baseRisk, true);

        return {
            status: 'VALID',
            predictive_risk_score: baseRisk,
            proof,
            auditLogs,
            riskFactorBreakdown: breakdown,
            intentDNA: {
                id: intentDNA.id,
                expectedTools: intentDNA.expectedTools,
                verifiedActions: intentDNA.verifiedActions,
                executionGraph: intentDNA.executionGraph,
                divergences: intentDNA.divergences
            },
            futureSimulation: futureResults,
            agentPassport: {
                agentId: agentPassport.agentId,
                trustScore: agentPassport.trustScore,
                driftMetrics: agentPassport.driftMetrics,
                certifications: agentPassport.certifications
            },
            courtDecision
        };
    }
}
