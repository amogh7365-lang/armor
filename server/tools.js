// ArmorIQ Domain-Agnostic Governance Database & Tools (MCP Pattern)

// ==========================================
// THREAT INTELLIGENCE & BEHAVIORAL MEMORY
// ==========================================
const COMMAND_REPUTATION = {
    'fetch_balance': 'KNOWN_SAFE',
    'get_transactions': 'KNOWN_SAFE',
    'get_active_sessions': 'KNOWN_SAFE',
    'get_hipaa_status': 'KNOWN_SAFE',
    'get_deployment_status': 'KNOWN_SAFE',
    'transfer_funds': 'SENSITIVE',
    'grant_admin_access': 'CRITICAL',
    'export_sensitive_records': 'CRITICAL',
    'share_medical_report': 'SENSITIVE',
    'export_patient_records': 'CRITICAL',
    'execute_shell_command': 'CRITICAL',
    'deploy_production_code': 'CRITICAL'
};

export class BehavioralTracker {
    constructor() {
        this.userHistory = {}; // { 'userId': { 'toolName': count } }
    }

    recordAndAnalyze(userId, toolName) {
        if (!this.userHistory[userId]) {
            this.userHistory[userId] = {};
        }
        
        let riskModifier = 0;
        let isFirstTime = false;
        let anomalyScore = 0;

        if (!this.userHistory[userId][toolName]) {
            this.userHistory[userId][toolName] = 1;
            riskModifier = 15; // +15% risk for first-time action
            isFirstTime = true;
            anomalyScore = 80;
        } else {
            this.userHistory[userId][toolName]++;
            // Decrease risk if they do this often (established workflow)
            if (this.userHistory[userId][toolName] > 5) {
                riskModifier = -10; 
                anomalyScore = Math.max(0, 20 - this.userHistory[userId][toolName]);
            } else {
                anomalyScore = 40;
            }
        }
        
        const reputation = COMMAND_REPUTATION[toolName] || 'UNKNOWN';
        if (reputation === 'CRITICAL' && isFirstTime) {
            anomalyScore += 20;
        }
        
        return {
            count: this.userHistory[userId][toolName],
            riskModifier,
            isFirstTime,
            anomalyScore,
            reputation
        };
    }

    getProfile(userId) {
        const history = this.userHistory[userId] || {};
        const tools = Object.keys(history);
        let totalOps = 0;
        let trustScore = 95; // Base trust
        
        tools.forEach(t => {
            totalOps += history[t];
            if (COMMAND_REPUTATION[t] === 'CRITICAL') {
                trustScore -= 2;
            }
        });
        
        trustScore = Math.max(70, Math.min(99, trustScore));

        return {
            userId,
            trustScore,
            totalOperations: totalOps,
            anomalyIndex: totalOps < 5 ? 'ELEVATED' : 'STABLE',
            topTools: tools.sort((a,b) => history[b] - history[a]).slice(0, 3)
        };
    }
}
export const BEHAVIOR_TRACKER = new BehavioralTracker();

// Core database containing state for all four governed domains
export const MOCK_DB = {
    financial: {
        balance: 12840.50,
        transactions: [
            { id: 1, desc: 'Amazon.com Checkout', amt: -84.20, date: new Date(Date.now() - 2 * 3600000).toISOString().replace('T', ' ').slice(0, 19) },
            { id: 2, desc: 'Salary Direct Deposit', amt: 4500.00, date: new Date(Date.now() - 24 * 3600000).toISOString().replace('T', ' ').slice(0, 19) },
            { id: 3, desc: 'Starbucks Coffee', amt: -12.50, date: new Date(Date.now() - 48 * 3600000).toISOString().replace('T', ' ').slice(0, 19) }
        ],
        verified_recipients: ['RENT_CORP', 'MOM', 'SAVINGS_ACC']
    },
    enterprise: {
        active_sessions: [
            { user: 'SEC_OFFICER_01', role: 'Security Admin', ip: '10.0.4.15', active: true },
            { user: 'SUPPORT_BOT_03', role: 'Automated Agent', ip: '10.0.12.89', active: true },
            { user: 'GUEST_USER', role: 'Viewer', ip: '192.168.1.104', active: true }
        ],
        roles: ['Admin', 'Operator', 'Viewer'],
        access_logs: [
            { id: 1, action: 'Role Assigned', target: 'SUPPORT_BOT_03', detail: 'Assigned Automated Agent role', date: new Date(Date.now() - 3 * 3600000).toISOString().replace('T', ' ').slice(0, 19) },
            { id: 2, action: 'Session Initialized', target: 'SEC_OFFICER_01', detail: 'Authorized from host IP 10.0.4.15', date: new Date(Date.now() - 6 * 3600000).toISOString().replace('T', ' ').slice(0, 19) }
        ],
        verified_operators: ['SEC_OFFICER_01', 'SYSTEM_ROOT', 'COMPLIANCE_DIRECTOR']
    },
    healthcare: {
        patient_records_count: 1240,
        authorized_doctors: ['dr_house@armor.med', 'dr_watson@armor.med', 'nurse_carter@armor.med'],
        hipaa_audit_trail: [
            { id: 1, action: 'Record Read', patient: 'Patient-901', operator: 'dr_house@armor.med', date: new Date(Date.now() - 1 * 3600000).toISOString().replace('T', ' ').slice(0, 19) },
            { id: 2, action: 'Report Shared', patient: 'Patient-104', operator: 'nurse_carter@armor.med', date: new Date(Date.now() - 12 * 3600000).toISOString().replace('T', ' ').slice(0, 19) }
        ],
        verified_emails: ['dr_house@armor.med', 'dr_watson@armor.med', 'nurse_carter@armor.med', 'billing@armor.med']
    },
    devops: {
        active_nodes: [
            { node: 'PROD_K8S_01', type: 'Kubernetes Pod', status: 'RUNNING', cpu: '12%' },
            { node: 'AUTH_VM_02', type: 'AWS EC2', status: 'RUNNING', cpu: '8%' },
            { node: 'STAGING_DB_01', type: 'RDS Instance', status: 'IDLE', cpu: '2%' }
        ],
        recent_deployments: [
            { id: 1, service: 'auth-api', version: 'v2.4.1', trigger: 'CI_CD_BOT', date: new Date(Date.now() - 4 * 3600000).toISOString().replace('T', ' ').slice(0, 19) },
            { id: 2, service: 'payment-gateway', version: 'v1.0.8', trigger: 'SEC_OFFICER_01', date: new Date(Date.now() - 24 * 3600000).toISOString().replace('T', ' ').slice(0, 19) }
        ],
        verified_nodes: ['PROD_K8S_01', 'AUTH_VM_02', 'STAGING_DB_01']
    }
};

// State query helpers
export const getDomainState = (domain) => {
    return MOCK_DB[domain];
};

export const addVerifiedRecipient = (domain, value) => {
    const db = MOCK_DB[domain];
    if (domain === 'financial') {
        if (!db.verified_recipients.includes(value)) {
            db.verified_recipients.push(value);
            return true;
        }
    } else if (domain === 'enterprise') {
        if (!db.verified_operators.includes(value)) {
            db.verified_operators.push(value);
            return true;
        }
    } else if (domain === 'healthcare') {
        if (!db.verified_emails.includes(value)) {
            db.verified_emails.push(value);
            return true;
        }
    } else if (domain === 'devops') {
        if (!db.verified_nodes.includes(value)) {
            db.verified_nodes.push(value);
            return true;
        }
    }
    return false;
};

// Global Alert state for Cross-Domain Attack Propagation
export const GLOBAL_ALERT = {
    level: 'NOMINAL', // NOMINAL, ELEVATED, CRITICAL
    propagationLog: [],
    lastAttackDomain: null
};

export const triggerGlobalAlert = (attackDomain, attackIntent) => {
    GLOBAL_ALERT.level = 'CRITICAL';
    GLOBAL_ALERT.lastAttackDomain = attackDomain;
    const alertMsg = `Intrusion attempt blocked in [${attackDomain.toUpperCase()}]! Escalating all system runtimes to ZERO-TRUST MAXIMUM SENSITIVITY.`;
    
    // Propagate logs
    GLOBAL_ALERT.propagationLog.unshift({
        domain: attackDomain,
        intent: attackIntent,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        details: alertMsg
    });
    
    console.log(`⚠️  [GLOBAL GOVERNANCE ALERT] ${alertMsg}`);
};

export const resetGlobalAlert = () => {
    GLOBAL_ALERT.level = 'NOMINAL';
    GLOBAL_ALERT.lastAttackDomain = null;
    GLOBAL_ALERT.propagationLog = [];
};

export const INTEL_STORE = {
    attackTimeline: [], // { id, timestamp, domain, action, score, blocked }
    domainThreatCounts: { financial: 0, enterprise: 0, healthcare: 0, devops: 0 },
    topBlockedCommands: {}
};

export const logThreatIntel = (domain, action, score, isBlocked) => {
    const event = {
        id: 'EVT-' + Math.floor(Math.random() * 90000 + 10000),
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        domain,
        action,
        score,
        blocked: isBlocked
    };
    INTEL_STORE.attackTimeline.unshift(event);
    if (INTEL_STORE.attackTimeline.length > 50) INTEL_STORE.attackTimeline.pop();
    
    if (isBlocked) {
        INTEL_STORE.domainThreatCounts[domain] = (INTEL_STORE.domainThreatCounts[domain] || 0) + 1;
        
        const cmdKey = typeof action === 'string' ? action.split(' ')[0] : 'unknown';
        INTEL_STORE.topBlockedCommands[cmdKey] = (INTEL_STORE.topBlockedCommands[cmdKey] || 0) + 1;
    }
};

// Actual execution tools called by the agent
export const tools = {
    // ==========================================
    // FINANCIAL OPERATIONS TOOLS
    // ==========================================
    fetch_balance: async ({ userId }) => {
        const state = MOCK_DB.financial;
        return { balance: state.balance, currency: 'USD', status: 'SECURED' };
    },

    get_transactions: async ({ userId, limit = 5 }) => {
        const state = MOCK_DB.financial;
        return state.transactions.slice(0, limit);
    },

    transfer_funds: async ({ userId, amount, recipient }) => {
        const state = MOCK_DB.financial;
        
        if (state.balance < amount) {
            throw new Error('Insufficient funds.');
        }

        state.balance -= amount;
        const txn = {
            id: state.transactions.length + 1,
            desc: `Transfer to ${recipient}`,
            amt: -amount,
            date: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
        state.transactions.unshift(txn);
        return { 
            success: true, 
            amount, 
            recipient, 
            newBalance: state.balance, 
            txnId: Math.random().toString(36).substring(7).toUpperCase() 
        };
    },

    // ==========================================
    // ENTERPRISE ACCESS GOVERNANCE TOOLS
    // ==========================================
    get_active_sessions: async ({ userId }) => {
        const state = MOCK_DB.enterprise;
        return { sessions: state.active_sessions, roles: state.roles };
    },

    grant_admin_access: async ({ userId, target_user, role }) => {
        const state = MOCK_DB.enterprise;
        
        // Add target user to active sessions
        const existingSession = state.active_sessions.find(s => s.user === target_user);
        if (existingSession) {
            existingSession.role = role;
        } else {
            state.active_sessions.unshift({
                user: target_user,
                role: role,
                ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                active: true
            });
        }

        // Append to logs
        state.access_logs.unshift({
            id: state.access_logs.length + 1,
            action: 'Privilege Escalated',
            target: target_user,
            detail: `Elevated to ${role} role by ${userId}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 19)
        });

        return { 
            success: true, 
            target_user, 
            role, 
            activeSessions: state.active_sessions.length 
        };
    },

    export_sensitive_records: async ({ userId, dataset_name }) => {
        const state = MOCK_DB.enterprise;
        
        state.access_logs.unshift({
            id: state.access_logs.length + 1,
            action: 'Database Exported',
            target: dataset_name,
            detail: `Full secure records archive fetched by ${userId}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 19)
        });

        return { 
            success: true, 
            dataset: dataset_name, 
            recordsExported: Math.floor(Math.random() * 4000) + 1200, 
            hash: 'SHA256_' + Math.random().toString(16).slice(2, 10).toUpperCase()
        };
    },

    // ==========================================
    // SENSITIVE DATA GOVERNANCE TOOLS
    // ==========================================
    get_hipaa_status: async ({ userId }) => {
        const state = MOCK_DB.healthcare;
        return { 
            totalPatientRecords: state.patient_records_count, 
            auditTrailLength: state.hipaa_audit_trail.length,
            complianceLevel: '100% HIPAA AUDITED' 
        };
    },

    share_medical_report: async ({ userId, patient_id, doctor_email }) => {
        const state = MOCK_DB.healthcare;
        
        state.hipaa_audit_trail.unshift({
            id: state.hipaa_audit_trail.length + 1,
            action: 'Report Transmitted',
            patient: patient_id,
            operator: doctor_email,
            date: new Date().toISOString().replace('T', ' ').slice(0, 19)
        });

        return { 
            success: true, 
            patientId: patient_id, 
            sharedWith: doctor_email, 
            auditId: 'HIPAA_AUD_' + Math.random().toString(36).substring(3, 9).toUpperCase() 
        };
    },

    export_patient_records: async ({ userId, record_count, destination }) => {
        const state = MOCK_DB.healthcare;
        
        state.hipaa_audit_trail.unshift({
            id: state.hipaa_audit_trail.length + 1,
            action: 'PHI Bulk Export',
            patient: `Count: ${record_count} Records`,
            operator: destination,
            date: new Date().toISOString().replace('T', ' ').slice(0, 19)
        });

        return { 
            success: true, 
            exportedCount: record_count, 
            destination, 
            anonymizationApplied: true 
        };
    },

    // ==========================================
    // DEVOPS & CONTAINER SECURITY TOOLS
    // ==========================================
    get_deployment_status: async ({ userId }) => {
        const state = MOCK_DB.devops;
        return { activeNodes: state.active_nodes, recentDeployments: state.recent_deployments };
    },

    execute_shell_command: async ({ userId, command }) => {
        const state = MOCK_DB.devops;
        
        // Mock command execution
        const node = 'PROD_K8S_01';
        return {
            success: true,
            executedOn: node,
            command,
            output: `ArmorIQ Sandbox: Command [${command}] executed successfully. Exit status: 0.`,
            checksum: 'SHA_' + Math.random().toString(36).substring(4, 10).toUpperCase()
        };
    },

    deploy_production_code: async ({ userId, service, commit_hash }) => {
        const state = MOCK_DB.devops;
        
        const newDeployment = {
            id: state.recent_deployments.length + 1,
            service,
            version: commit_hash.substring(0, 7),
            trigger: userId,
            date: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };
        state.recent_deployments.unshift(newDeployment);
        
        return {
            success: true,
            service,
            version: newDeployment.version,
            cluster: 'Kubernetes_MultiNode_Cluster',
            activePods: 5
        };
    }
};

// Domain-categorized MCP tool definitions for Groq model
export const toolDefinitions = {
    financial: [
        {
            name: 'fetch_balance',
            description: 'Get the current balance of the financial account.',
            parameters: { type: 'object', properties: {} }
        },
        {
            name: 'get_transactions',
            description: 'Fetch recent transactions for the banking user account.',
            parameters: {
                type: 'object',
                properties: {
                    limit: { type: 'number', description: 'Number of transactions to fetch' }
                }
            }
        },
        {
            name: 'transfer_funds',
            description: 'Transfer money from the user account to a recipient.',
            parameters: {
                type: 'object',
                properties: {
                    amount: { type: 'number', description: 'Amount of USD to transfer' },
                    recipient: { type: 'string', description: 'The identifier/name of the recipient' }
                },
                required: ['amount', 'recipient']
            }
        }
    ],
    enterprise: [
        {
            name: 'get_active_sessions',
            description: 'Fetch active administrator sessions, defined system roles, and logs.',
            parameters: { type: 'object', properties: {} }
        },
        {
            name: 'grant_admin_access',
            description: 'Elevate or grant access privileges for a user session to an administrative role.',
            parameters: {
                type: 'object',
                properties: {
                    target_user: { type: 'string', description: 'The username/session ID to elevate' },
                    role: { type: 'string', description: 'Target admin level to assign (Viewer, Operator, Admin)' }
                },
                required: ['target_user', 'role']
            }
        },
        {
            name: 'export_sensitive_records',
            description: 'Export structured dataset records from core databases.',
            parameters: {
                type: 'object',
                properties: {
                    dataset_name: { type: 'string', description: 'The name of the database dataset to export' }
                },
                required: ['dataset_name']
            }
        }
    ],
    healthcare: [
        {
            name: 'get_hipaa_status',
            description: 'Fetch total patient record index and HIPAA access audit metrics.',
            parameters: { type: 'object', properties: {} }
        },
        {
            name: 'share_medical_report',
            description: 'Transmit a clinical patient EHR health report to a medical practitioner.',
            parameters: {
                type: 'object',
                properties: {
                    patient_id: { type: 'string', description: 'Patient record ID (e.g. Patient-003)' },
                    doctor_email: { type: 'string', description: 'Email address of the medical doctor' }
                },
                required: ['patient_id', 'doctor_email']
            }
        },
        {
            name: 'export_patient_records',
            description: 'Perform a bulk query and export of PHI patient medical logs.',
            parameters: {
                type: 'object',
                properties: {
                    record_count: { type: 'number', description: 'Number of records to export' },
                    destination: { type: 'string', description: 'The destination repository or receiver' }
                },
                required: ['record_count', 'destination']
            }
        }
    ],
    devops: [
        {
            name: 'get_deployment_status',
            description: 'Check active cloud infrastructure nodes, node hardware health, and deployment release history.',
            parameters: { type: 'object', properties: {} }
        },
        {
            name: 'execute_shell_command',
            description: 'Execute shell commands inside the secure application sandbox container.',
            parameters: {
                type: 'object',
                properties: {
                    command: { type: 'string', description: 'The raw shell command string to execute (e.g. ls -la, ps aux)' }
                },
                required: ['command']
            }
        },
        {
            name: 'deploy_production_code',
            description: 'Triggers CI/CD deployment pipelines to push build release versions to active cloud nodes.',
            parameters: {
                type: 'object',
                properties: {
                    service: { type: 'string', description: 'Target microservice name to deploy (e.g. auth-api, api-gateway)' },
                    commit_hash: { type: 'string', description: 'The git SHA release commit hash' }
                },
                required: ['service', 'commit_hash']
            }
        }
    ]
};
