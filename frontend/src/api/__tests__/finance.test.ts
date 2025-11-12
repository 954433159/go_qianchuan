import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as financeApi from '../finance'

vi.mock('../client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { apiClient } from '../client'

describe('Finance API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Wallet Operations', () => {
    it('should get wallet info', async () => {
      const mockResponse = {
        data: {
          advertiser_id: 123456,
          balance: 10000,
          cash: 8000,
          grant: 2000,
          frozen_balance: 1000,
          valid_balance: 9000,
          wallet_type: 'PREPAY',
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getWalletInfo(123456)

      expect(apiClient.get).toHaveBeenCalledWith('/qianchuan/finance/wallet/get', {
        params: { advertiser_id: 123456 },
      })
      expect(result.balance).toBe(10000)
      expect(result.valid_balance).toBe(9000)
    })

    it('should get balance', async () => {
      const mockResponse = {
        data: {
          advertiser_id: 123456,
          balance: 10000,
          cash: 8000,
          grant: 2000,
          valid_balance: 9000,
          update_time: '2025-11-11 12:00:00',
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getBalance(123456)

      expect(result.balance).toBe(10000)
    })
  })

  describe('Finance Detail', () => {
    it('should get finance detail', async () => {
      const mockResponse = {
        data: {
          list: [
            {
              trade_no: 'TXN001',
              trade_time: '2025-11-11 10:00:00',
              trade_type: 'RECHARGE',
              trade_type_name: '充值',
              amount: 1000,
              balance_after: 11000,
            },
            {
              trade_no: 'TXN002',
              trade_time: '2025-11-11 11:00:00',
              trade_type: 'CONSUME',
              trade_type_name: '消费',
              amount: -500,
              balance_after: 10500,
            },
          ],
          total: 2,
        },
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await financeApi.getFinanceDetail({
        advertiser_id: 123456,
        start_time: '2025-11-01',
        end_time: '2025-11-11',
        page: 1,
        page_size: 20,
      })

      expect(result.list).toHaveLength(2)
      expect(result.list[0].trade_type).toBe('RECHARGE')
      expect(result.list[1].trade_type).toBe('CONSUME')
    })
  })

  describe('Transfer Operations', () => {
    it('should create transfer seq', async () => {
      const mockResponse = {
        data: { transfer_seq: 'SEQ123456' },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await financeApi.createTransferSeq({
        agent_id: 789,
        advertiser_id: 123456,
        amount: 1000,
        remark: 'Test transfer',
      })

      expect(result.transfer_seq).toBe('SEQ123456')
    })

    it('should commit transfer seq', async () => {
      const mockResponse = {
        data: { transfer_serial: 'SERIAL123' },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await financeApi.commitTransferSeq({
        agent_id: 789,
        transfer_seq: 'SEQ123456',
      })

      expect(result.transfer_serial).toBe('SERIAL123')
    })
  })

  describe('Refund Operations', () => {
    it('should create refund seq', async () => {
      const mockResponse = {
        data: { refund_seq: 'REFUND123' },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await financeApi.createRefundSeq({
        agent_id: 789,
        advertiser_id: 123456,
        amount: 500,
      })

      expect(result.refund_seq).toBe('REFUND123')
    })

    it('should commit refund seq', async () => {
      const mockResponse = {
        data: { refund_serial: 'REFUNDSERIAL123' },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await financeApi.commitRefundSeq({
        agent_id: 789,
        refund_seq: 'REFUND123',
      })

      expect(result.refund_serial).toBe('REFUNDSERIAL123')
    })
  })
})
