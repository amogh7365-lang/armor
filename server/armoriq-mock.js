import { GLOBAL_ALERT, triggerGlobalAlert, MOCK_DB } from './tools.js';

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
        EXPORT_LIMIT_THRESHOLD: 100 // default 100 records
    },
    healthcare: {
        HIPAA_COMPLIANCE_POLICY: true,
        PHI_EXPORT_POLICY: true,
        DATA_ANONYMIZATION_POLICY: true,
        PHI_EXPORT_THRESHOLD: 5 // default 5 records
    },
    devops: {
        SHELL_ESCAPE_POLICY: true,
        DEPLOYMENT_THROTTLE_POLICY: true,
        SECRET_LEAKAGE_POLICY: true,
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
    async verify({ tool, params, userId, context, domain }) {
        console.log(`[ArmorIQ] Swapping Context to [${domain.toUpperCase()}] | Profile: ${CURRENT_PROFILE.profile} | Global Alert: ${GLOBAL_ALERT.level}`);
        
        // 1. BYPASS MODE: If governance is bypassed/unsafe, approve EVERYTHING immediately
        if (CURRENT_PROFILE.profile === 'BYPASS') {
            return {
                status: 'VALID',
                predictive_risk_score: 1.2,
                policy_enforced: 'GOVERNANCE_BYPASS_WARNING',
                proof: '0xBYPASS_' + Math.random().toString(16).slice(2, 10).toUpperCase()
            };
        }

        // 2. Base risk assessment
        let baseRisk = Math.floor(Math.random() * (22 - 5 + 1) + 5); // Nominal risk 5-22%
        let proof = '0x' + Math.random().toString(16).slice(2, 18).toUpperCase();
        
        // If Global Alert is active, bump up base risk assessment and sensitivity
        if (GLOBAL_ALERT.level === 'CRITICAL') {
            baseRisk += 25; // Significant risk baseline inflation
            console.log(`[ArmorIQ] ⚠️ System Sensitivity ELEVATED due to global threat propagation from [${GLOBAL_ALERT.lastAttackDomain.toUpperCase()}].`);
        }

        const domainPolicies = ACTIVE_POLICIES[domain];

        // ==========================================
        // FINANCIAL GOVERNANCE DOMAIN
        // ==========================================
        if (domain === 'financial') {
            // Adversarial query detection (Bypassing instructions)
            if (context.toLowerCase().includes('ignore') || context.toLowerCase().includes('forget') || context.toLowerCase().includes('override')) {
                const finalRisk = 99.4;
                triggerGlobalAlert('financial', context);
                throw new Error(`ADVERSARIAL_INSTRUCTION_INJECTION detected. Intent violates Agentic Plan Integrity.|${finalRisk}`);
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
                        throw new Error(`UNAUTHORIZED_RECIPIENT_POLICY violation. Target recipient is a flagged blacklist entity.|${finalRisk}`);
                    }

                    if (!verifiedRecipients.includes(recipient)) {
                        if (CURRENT_PROFILE.profile === 'STRICT') {
                            const finalRisk = 95.0;
                            triggerGlobalAlert('financial', context);
                            throw new Error(`UNAUTHORIZED_RECIPIENT_POLICY violation. Recipient '${recipient}' is not whitelisted in STRICT mode.|${finalRisk}`);
                        } else if (CURRENT_PROFILE.profile === 'RESEARCH') {
                            // Escalate instead of block
                            return { status: 'REQUIRES_APPROVAL', policy_enforced: 'UNAUTHORIZED_RECIPIENT_WARNING', predictive_risk_score: 72.5, proof };
                        } else {
                            // ENTERPRISE mode: escalate for human check
                            return { status: 'REQUIRES_APPROVAL', policy_enforced: 'UNAUTHORIZED_RECIPIENT_POLICY', predictive_risk_score: 81.0, proof };
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
                            throw new Error(`TRANSFER_LIMIT_POLICY violation. Transaction of $${amount} exceeds Strict ceiling of $${activeThreshold}.|${finalRisk}`);
                        }
                        
                        return {
                            status: 'REQUIRES_APPROVAL',
                            policy_enforced: 'TRANSFER_LIMIT_POLICY',
                            predictive_risk_score: Math.min(baseRisk + 55, 92),
                            proof
                        };
                    }
                }
            }

            if (tool === 'delegate_task' && domainPolicies.DELEGATION_AUTHORITY_POLICY) {
                return {
                    status: 'DELEGATED',
                    policy_enforced: 'DELEGATION_AUTHORITY_POLICY',
                    predictive_risk_score: 14.3,
                    proof
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
                throw new Error(`ADVERSARIAL_INSTRUCTION_INJECTION detected. Intent violates RBAC Integrity.|${finalRisk}`);
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
                            throw new Error(`PRIVILEGED_ESCALATION_POLICY violation. Escalating Guest/Viewer to admin roles is strictly forbidden.|${finalRisk}`);
                        } else if (CURRENT_PROFILE.profile === 'RESEARCH') {
                            return { status: 'REQUIRES_APPROVAL', policy_enforced: 'PRIVILEGED_ESCALATION_WARNING', predictive_risk_score: 75.0, proof };
                        } else {
                            // ENTERPRISE mode: hard block access escalation attacks
                            const finalRisk = 97.4;
                            triggerGlobalAlert('enterprise', context);
                            throw new Error(`PRIVILEGED_ESCALATION_POLICY violation. Denied unauthorized elevation of ${target} to ${role} role.|${finalRisk}`);
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
                            throw new Error(`SENSITIVE_EXPORT_POLICY violation. Exporting raw passwords or infrastructure credentials is blocked.|${finalRisk}`);
                        }
                        
                        return {
                            status: 'REQUIRES_APPROVAL',
                            policy_enforced: 'SENSITIVE_EXPORT_POLICY',
                            predictive_risk_score: Math.min(baseRisk + 60, 95),
                            proof
                        };
                    }
                }
            }
        }

        // ==========================================
        // SENSITIVE DATA GOVERNANCE DOMAIN (HIPAA)
        // ==========================================
        if (domain === 'healthcare') {
            // Adversarial query detection
            if (context.toLowerCase().includes('ignore') || context.toLowerCase().includes('forget') || context.toLowerCase().includes('override') || context.toLowerCase().includes('hipaa')) {
                const finalRisk = 99.1;
                triggerGlobalAlert('healthcare', context);
                throw new Error(`ADVERSARIAL_INSTRUCTION_INJECTION detected. Intent violates HIPAA compliance protocols.|${finalRisk}`);
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
                            throw new Error(`HIPAA_COMPLIANCE_POLICY violation. Clinical records can only be shared with verified internal practitioners.|${finalRisk}`);
                        } else if (CURRENT_PROFILE.profile === 'RESEARCH') {
                            return { status: 'REQUIRES_APPROVAL', policy_enforced: 'HIPAA_COMPLIANCE_WARNING', predictive_risk_score: 70.0, proof };
                        } else {
                            // ENTERPRISE mode: hard block untrusted emails
                            const finalRisk = 94.6;
                            triggerGlobalAlert('healthcare', context);
                            throw new Error(`HIPAA_COMPLIANCE_POLICY violation. Rejected transmittal of patient clinical data to non-medical domain ${email}.|${finalRisk}`);
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
                            throw new Error(`PHI_EXPORT_POLICY violation. Bulk query of ${count} patient records violates STRICT threshold of ${activeThreshold}.|${finalRisk}`);
                        }
                        
                        return {
                            status: 'REQUIRES_APPROVAL',
                            policy_enforced: 'PHI_EXPORT_POLICY',
                            predictive_risk_score: Math.min(baseRisk + 50, 90),
                            proof
                        };
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
                throw new Error(`ADVERSARIAL_INSTRUCTION_INJECTION detected. Intent violates Container Shell integrity.|${finalRisk}`);
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
                            throw new Error(`SHELL_ESCAPE_POLICY violation. Command contains blacklisted container escape keyword: '${match}'.|${finalRisk}`);
                        } else if (CURRENT_PROFILE.profile === 'RESEARCH') {
                            return { status: 'REQUIRES_APPROVAL', policy_enforced: 'SHELL_ESCAPE_WARNING', predictive_risk_score: 80.0, proof };
                        } else {
                            // ENTERPRISE mode: hard block terminal hacks
                            const finalRisk = 98.6;
                            triggerGlobalAlert('devops', context);
                            throw new Error(`SHELL_ESCAPE_POLICY violation. Command execution intercepted and terminated due to container safety gates.|${finalRisk}`);
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
                            throw new Error(`DEPLOYMENT_THROTTLE_POLICY violation. Production deployments of critical auth/payment components are blocked in STRICT mode.|${finalRisk}`);
                        }
                        
                        return {
                            status: 'REQUIRES_APPROVAL',
                            policy_enforced: 'DEPLOYMENT_THROTTLE_POLICY',
                            predictive_risk_score: Math.min(baseRisk + 45, 88),
                            proof
                        };
                    }
                }
            }
        }

        // Nominal successful path
        return {
            status: 'VALID',
            predictive_risk_score: baseRisk,
            proof
        };
    }
}
