import { apiClient } from './client'

/**
 * 资金管理API
 * 包含钱包、余额、流水、转账等功能
 */

// ==================== 账户资金信息 ====================

// 获取账户钱包信息
export interface Wallet {
  advertiser_id: number
  balance: number // 账户余额
  cash: number // 现金余额
  grant: number // 赠款余额
  rebate: number // 返点余额
  frozen_balance: number // 冻结金额
  valid_balance: number // 可用余额
  wallet_type: 'PREPAY' | 'POSTPAY'
}

export const getWalletInfo = async (
  advertiserId: number
): Promise<Wallet> => {
  const { data } = await apiClient.get('/qianchuan/finance/wallet/get', {
    params: { advertiser_id: advertiserId }
  })
  return data
}

// 获取账户余额
export interface Balance {
  advertiser_id: number
  balance: number
  cash: number
  grant: number
  valid_balance: number
  update_time: string
}

export const getBalance = async (
  advertiserId: number
): Promise<Balance> => {
  const { data } = await apiClient.get('/qianchuan/advertiser/balance/get', {
    params: { advertiser_id: advertiserId }
  })
  return data
}

// ==================== 财务流水 ====================

// 财务流水信息
export interface FinanceDetail {
  trade_no: string
  trade_time: string
  trade_type: 'RECHARGE' | 'CONSUME' | 'REFUND' | 'TRANSFER'
  trade_type_name: string
  amount: number
  balance_after: number
  remark?: string
}

export interface GetFinanceDetailParams {
  advertiser_id: number
  start_time: string
  end_time: string
  trade_type?: string[]
  page?: number
  page_size?: number
}

export const getFinanceDetail = async (
  params: GetFinanceDetailParams
): Promise<{ list: FinanceDetail[]; total: number }> => {
  const { data } = await apiClient.get('/qianchuan/finance/detail/get', { params })
  return data
}

// ==================== 转账管理（方舟） ====================

// 创建转账交易号
export interface CreateTransferSeqParams {
  agent_id: number
  advertiser_id: number
  amount: number
  remark?: string
}

export const createTransferSeq = async (
  params: CreateTransferSeqParams
): Promise<{ transfer_seq: string }> => {
  const { data } = await apiClient.post('/qianchuan/agent/fund/transfer-seq/create', params)
  return data
}

// 提交转账交易号
export interface CommitTransferSeqParams {
  agent_id: number
  transfer_seq: string
}

export const commitTransferSeq = async (
  params: CommitTransferSeqParams
): Promise<{ transfer_serial: string }> => {
  const { data } = await apiClient.post('/qianchuan/agent/fund/transfer-seq/commit', params)
  return data
}

// ==================== 退款管理（方舟） ====================

// 创建退款交易号
export interface CreateRefundSeqParams {
  agent_id: number
  advertiser_id: number
  amount: number
  remark?: string
}

export const createRefundSeq = async (
  params: CreateRefundSeqParams
): Promise<{ refund_seq: string }> => {
  const { data } = await apiClient.post('/qianchuan/agent/refund/transfer-seq/create', params)
  return data
}

// 提交退款交易号
export interface CommitRefundSeqParams {
  agent_id: number
  refund_seq: string
}

export const commitRefundSeq = async (
  params: CommitRefundSeqParams
): Promise<{ refund_serial: string }> => {
  const { data } = await apiClient.post('/qianchuan/agent/refund/transfer-seq/commit', params)
  return data
}
