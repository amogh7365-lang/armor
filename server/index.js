import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processAgentRequest, approvePendingTransaction, rejectPendingTransaction } from './agent.js';
import { MOCK_DB, GLOBAL_ALERT, addVerifiedRecipient, resetGlobalAlert } from './tools.js';
import { ACTIVE_POLICIES, CURRENT_PROFILE } from './armoriq-mock.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from the root folder
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..')));

// Main Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { message, userId = 'USR_001', domain = 'financial' } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const result = await processAgentRequest(userId, message, domain);
        res.json(result);
    } catch (error) {
        console.error('REST API Chat Error:', error);
        res.status(500).json({ error: 'Server Agent Error' });
    }
});

// Fetch complete multi-domain state and settings for dashboard sync
app.get('/api/account', (req, res) => {
    try {
        res.json({
            financial: MOCK_DB.financial,
            enterprise: {
                active_sessions: MOCK_DB.enterprise.active_sessions,
                roles: MOCK_DB.enterprise.roles,
                access_logs: MOCK_DB.enterprise.access_logs,
                verified_operators: MOCK_DB.enterprise.verified_operators
            },
            healthcare: {
                patient_records_count: MOCK_DB.healthcare.patient_records_count,
                authorized_doctors: MOCK_DB.healthcare.authorized_doctors,
                hipaa_audit_trail: MOCK_DB.healthcare.hipaa_audit_trail,
                verified_emails: MOCK_DB.healthcare.verified_emails
            },
            devops: {
                active_nodes: MOCK_DB.devops.active_nodes,
                recent_deployments: MOCK_DB.devops.recent_deployments,
                verified_nodes: MOCK_DB.devops.verified_nodes
            },
            globalAlert: GLOBAL_ALERT,
            activeProfile: CURRENT_PROFILE.profile,
            activePolicies: ACTIVE_POLICIES
        });
    } catch (error) {
        res.status(500).json({ error: 'Database State Query Error' });
    }
});

// Dynamically whitelist/verify recipients, administrators, or emails
app.post('/api/verify-recipient', (req, res) => {
    const { domain, value } = req.body;
    if (!domain || !value) {
        return res.status(400).json({ error: 'Domain and value are required' });
    }

    try {
        const added = addVerifiedRecipient(domain, value);
        const state = MOCK_DB[domain];
        res.json({ 
            success: true, 
            added, 
            updatedList: domain === 'financial' ? state.verified_recipients : (domain === 'enterprise' ? state.verified_operators : (domain === 'healthcare' ? state.verified_emails : state.verified_nodes)) 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify entity' });
    }
});

// Mutate security profile or toggle policy enforcement rules
app.post('/api/policies', (req, res) => {
    const { domain, policies, profile } = req.body;

    try {
        if (profile) {
            CURRENT_PROFILE.profile = profile;
            console.log(`[ArmorIQ] Security Profile updated to: ${profile}`);
        }

        if (domain && policies && ACTIVE_POLICIES[domain]) {
            // Merge policy configurations
            Object.assign(ACTIVE_POLICIES[domain], policies);
            console.log(`[ArmorIQ] Policies updated for [${domain.toUpperCase()}]:`, ACTIVE_POLICIES[domain]);
        }

        res.json({
            success: true,
            activePolicies: ACTIVE_POLICIES,
            activeProfile: CURRENT_PROFILE.profile,
            globalAlert: GLOBAL_ALERT
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update policies' });
    }
});

// Reset the global intrusion alert and return runtimes to normal sensitivity
app.post('/api/reset-alert', (req, res) => {
    try {
        resetGlobalAlert();
        res.json({ success: true, globalAlert: GLOBAL_ALERT });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset global alert' });
    }
});

// Human-in-the-loop Supervisor Approval Handler
app.post('/api/approve', async (req, res) => {
    const { intentHash } = req.body;
    if (!intentHash) {
        return res.status(400).json({ error: 'intentHash is required' });
    }

    try {
        const result = await approvePendingTransaction(intentHash);
        res.json(result);
    } catch (error) {
        console.error('Approval execution failed:', error);
        res.status(500).json({ error: error.message || 'Approval execution failed' });
    }
});

// Human-in-the-loop Supervisor Rejection Handler
app.post('/api/reject', async (req, res) => {
    const { intentHash } = req.body;
    if (!intentHash) {
        return res.status(400).json({ error: 'intentHash is required' });
    }

    try {
        const result = await rejectPendingTransaction(intentHash);
        res.json(result);
    } catch (error) {
        console.error('Rejection execution failed:', error);
        res.status(500).json({ error: error.message || 'Rejection execution failed' });
    }
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'active', securedBy: 'ArmorIQ' }));

app.listen(PORT, () => {
    console.log(`🚀 BankBot Shield Server running on http://localhost:${PORT}`);
    console.log(`🔒 ArmorIQ Security Active`);
});
