// ArmorIQ Backend Server - Built with Trae IDE
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer } from 'ws';
import { processAgentRequest, approvePendingTransaction, rejectPendingTransaction } from './agent.js';
import { MOCK_DB, GLOBAL_ALERT, addVerifiedRecipient, resetGlobalAlert, INTEL_STORE, BEHAVIOR_TRACKER, trackExecutionChain, INTENT_DNA_STORE, CURRENT_INTENTS, AGENT_PASSPORT_STORE, ATTACK_TIME_MACHINE, FUTURE_ENGINE, CONSTITUTIONAL_COURT } from './tools.js';
import { ACTIVE_POLICIES, CURRENT_PROFILE } from './armoriq-mock.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// WebSocket Server for real-time notifications
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('[WebSocket] New client connected');
  clients.add(ws);
  
  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
    clients.delete(ws);
  });
});

// Broadcast message to all connected clients
export const broadcast = (message) => {
  clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
};

app.use(cors());
app.use(express.json());

// Serve static frontend files from the root folder
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..')));

// Explicit root route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

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

// SOC Threat Intelligence Endpoint
app.get('/api/intel', (req, res) => {
    try {
        const userId = req.query.userId || 'USR_001';
        const profileInfo = BEHAVIOR_TRACKER.getProfile(userId);
        
        res.json({
            attackTimeline: INTEL_STORE.attackTimeline,
            domainThreatCounts: INTEL_STORE.domainThreatCounts,
            topBlockedCommands: INTEL_STORE.topBlockedCommands,
            trustScore: profileInfo.trustScore,
            totalOperations: profileInfo.totalOperations,
            anomalyIndex: profileInfo.anomalyIndex
        });
    } catch (error) {
        console.error('Intel fetch error:', error);
        res.status(500).json({ error: 'Intel Query Error' });
    }
});

// Execution Chain Endpoint
app.get('/api/execution-chains/:userId', (req, res) => {
    try {
        const userId = req.params.userId || 'USR_001';
        const chain = INTEL_STORE.executionChains.get(userId) || [];
        
        res.json({
            userId,
            chain,
            cumulativeRisk: chain.reduce((sum, item) => sum + item.riskScore, 0),
            chainLength: chain.length
        });
    } catch (error) {
        console.error('Execution chain fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch execution chain' });
    }
});

// New API Endpoints for Advanced Features

// Get Intent DNA
app.get('/api/intent-dna/:intentId', (req, res) => {
    try {
        const intentId = req.params.intentId;
        if (!INTENT_DNA_STORE.has(intentId)) {
            return res.status(404).json({ error: 'Intent DNA not found' });
        }
        res.json(INTENT_DNA_STORE.get(intentId));
    } catch (error) {
        console.error('Intent DNA fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch Intent DNA' });
    }
});

// Get Agent Passport
app.get('/api/agent-passport/:agentId', (req, res) => {
    try {
        const agentId = req.params.agentId;
        if (!AGENT_PASSPORT_STORE.has(agentId)) {
            return res.status(404).json({ error: 'Agent Passport not found' });
        }
        res.json(AGENT_PASSPORT_STORE.get(agentId));
    } catch (error) {
        console.error('Agent Passport fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch Agent Passport' });
    }
});

// Get Attack Reconstructions
app.get('/api/attack-reconstructions', (req, res) => {
    try {
        res.json({ reconstructions: ATTACK_TIME_MACHINE.reconstructions });
    } catch (error) {
        console.error('Reconstructions fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch attack reconstructions' });
    }
});

// Get Intent DNA for User
app.get('/api/current-intent/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        const intentId = CURRENT_INTENTS.get(userId);
        if (!intentId) {
            return res.json({ intentId: null, intentDNA: null });
        }
        res.json({ intentId, intentDNA: INTENT_DNA_STORE.get(intentId) });
    } catch (error) {
        console.error('Current intent fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch current intent' });
    }
});

// Audit Log Export Endpoint (CSV)
app.get('/api/export/audit', (req, res) => {
    try {
        const exportData = INTEL_STORE.attackTimeline.map(event => ({
            id: event.id,
            timestamp: event.timestamp,
            domain: event.domain,
            action: event.action,
            riskScore: event.score,
            blocked: event.blocked ? 'Yes' : 'No'
        }));

        // Convert to CSV
        const headers = ['ID', 'Timestamp', 'Domain', 'Action', 'Risk Score', 'Blocked'];
        const csvRows = [
            headers.join(','),
            ...exportData.map(row => 
                [row.id, `"${row.timestamp}"`, row.domain, `"${row.action}"`, row.riskScore, row.blocked].join(',')
            )
        ];
        
        const csvContent = csvRows.join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=armoriq-audit-log.csv');
        res.send(csvContent);
    } catch (error) {
        console.error('Audit export error:', error);
        res.status(500).json({ error: 'Audit Export Failed' });
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BankBot Shield Server running on http://127.0.0.1:${PORT}`);
    console.log(`🔒 ArmorIQ Security Active`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🗺️ Threat Globe ready!`);
});
