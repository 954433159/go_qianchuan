import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW Server for Node.js (used in tests)
 * 用于 Node.js 环境的 MSW Server (在测试中使用)
 */
export const server = setupServer(...handlers)
