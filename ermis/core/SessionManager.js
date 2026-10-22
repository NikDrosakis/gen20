// /var/www/gs/public/ermis/core/SessionManager.js
const RedisService = require('./Redis'); // Το Redis.js κάνει export το instance

class SessionManager {
    constructor() {
        this.redis = RedisService; // Χρησιμοποίησε το instance απευθείας
        this.sessions = new Map();
        this.sessionTTL = 3600; // 1 hour
        console.log('✅ SessionManager initialized');
    }

    async createSession(clientId, userId, metadata = {}) {
        const sessionId = `session_${Date.now()}_${clientId}`;
        const session = {
            id: sessionId,
            clientId,
            userId: userId || 'anonymous',
            connectedAt: Date.now(),
            lastActivity: Date.now(),
            messages: [],
            status: 'active',
            ...metadata
        };

        await this.redis.set(`session:${sessionId}`, session);
        await this.redis.expire(`session:${sessionId}`, this.sessionTTL);
        this.sessions.set(sessionId, session);
        return session;
    }

    async getSession(sessionId) {
        // Check cache first
        if (this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId);
        }
        // Get from Redis
        const session = await this.redis.get(`session:${sessionId}`);
        if (session) {
            this.sessions.set(sessionId, session);
            return session;
        }
        return null;
    }

    async updateSession(sessionId, data) {
        const session = await this.getSession(sessionId);
        if (!session) return null;

        const updated = {
            ...session,
            ...data,
            lastActivity: Date.now()
        };

        await this.redis.set(`session:${sessionId}`, updated);
        await this.redis.expire(`session:${sessionId}`, this.sessionTTL);
        this.sessions.set(sessionId, updated);
        return updated;
    }

    async addMessage(sessionId, message) {
        const session = await this.getSession(sessionId);
        if (!session) return null;

        session.messages.push({
            ...message,
            timestamp: Date.now()
        });

        // Keep last 100 messages
        if (session.messages.length > 100) {
            session.messages = session.messages.slice(-100);
        }

        return this.updateSession(sessionId, { messages: session.messages });
    }

    async closeSession(sessionId) {
        const session = await this.getSession(sessionId);
        if (session) {
            session.status = 'closed';
            session.endedAt = Date.now();
            await this.redis.set(`session:${sessionId}`, session);
            await this.redis.expire(`session:${sessionId}`, 60); // 1 minute for cleanup
            this.sessions.delete(sessionId);
        }
        return session;
    }

    async getActiveSessions() {
        const keys = await this.redis.keys('session:*');
        const sessions = [];
        for (const key of keys) {
            const session = await this.redis.get(key);
            if (session && session.status === 'active') {
                sessions.push(session);
            }
        }
        return sessions;
    }

    async getStats() {
        const active = await this.getActiveSessions();
        const total = await this.redis.keys('session:*');
        return {
            active: active.length,
            total: total.length,
            users: [...new Set(active.map(s => s.userId))].length,
            messages: active.reduce((acc, s) => acc + (s.messages?.length || 0), 0)
        };
    }

    async cleanup() {
        const keys = await this.redis.keys('session:*');
        const now = Date.now();
        let cleaned = 0;

        for (const key of keys) {
            const session = await this.redis.get(key);
            if (session) {
                const shouldClean = session.status === 'closed' ||
                    (now - session.lastActivity > 3600000); // 1 hour inactive
                if (shouldClean) {
                    await this.redis.del(key);
                    this.sessions.delete(key);
                    cleaned++;
                }
            }
        }

        console.log(`🧹 Cleaned ${cleaned} expired sessions`);
        return cleaned;
    }
}

module.exports = SessionManager;