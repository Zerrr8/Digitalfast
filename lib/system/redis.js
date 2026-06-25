import { Redis } from '@upstash/redis'

class RedisDB {
    constructor() {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            console.error('[Redis] UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN harus diisi di .env')
        }
        this.client = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN
        })
    }

    /**
     * Test connection to Redis
     */
    ping = async () => {
        try {
            const result = await this.client.ping()
            return result === 'PONG'
        } catch (e) {
            console.error('[Redis] Connection failed:', e.message)
            return false
        }
    }

    /**
     * Initialize default data (superuser)
     */
    create = async () => {
        try {
            const existingSuperuser = await this.client.get('superuser:yilziadmin')
            if (!existingSuperuser) {
                await this.client.set('superuser:yilziadmin', JSON.stringify({
                    username: 'yilziadmin',
                    password: 'root',
                    pin: 123321,
                    created_at: new Date().toISOString()
                }))
                console.log('[Redis] Default superuser created')
            }
        } catch (e) {
            console.error('[Redis] Init error:', e.message)
        }
    }
}

export default new RedisDB
