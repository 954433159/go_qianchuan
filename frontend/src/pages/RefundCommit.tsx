import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { commitRefundSeq } from '@/api/finance'
import { toast } from '@/components/ui/Toast'

interface LocationState {
  refundSeq: string
  agentId: string
  amount: string
  reason?: string
}

export default function RefundCommit() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  
  const [loading, setLoading] = useState(false)
  const [committed, setCommitted] = useState(false)
  const [refundSeq, setRefundSeq] = useState(state?.refundSeq || '')
  const [agentId, setAgentId] = useState(state?.agentId || '')

  useEffect(() => {
    if (!state?.refundSeq) {
      toast.warning('请先创建退款交易号')
      navigate('/finance/refund/create')
    }
  }, [state, navigate])

  const handleCommit = async () => {
    if (!refundSeq || !agentId) {
      toast.error('缺少必要参数')
      return
    }

    setLoading(true)
    try {
      await commitRefundSeq({
        agent_id: Number(agentId),
        refund_seq: refundSeq
      })

      setCommitted(true)
      toast.success('退款提交成功')

      // 3秒后跳转到财务流水页面
      setTimeout(() => {
        navigate('/finance/transactions')
      }, 3000)
    } catch (error) {
      toast.error('退款提交失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getReasonLabel = (reason?: string) => {
    const reasons: Record<string, string> = {
      'OVERPAYMENT': '多付款项',
      'SERVICE_CANCEL': '服务取消',
      'ACCOUNT_CLOSE': '账户关闭',
      'ERROR_TRANSFER': '转账错误',
      'OTHER': '其他原因'
    }
    return reason ? reasons[reason] || reason : '未指定'
  }

  if (committed) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="✅ 退款成功"
          description="退款已成功提交并处理"
        />
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">退款成功！</h3>
              <p className="text-green-700 mb-6">资金已成功退回代理商账户</p>
              
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto mb-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">退款流水号：</span>
                    <span className="font-mono font-semibold">{refundSeq}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">退款金额：</span>
                    <span className="font-bold text-green-600">¥ {state?.amount}</span>
                  </div>
                  {state?.reason && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">退款原因：</span>
                      <span>{getReasonLabel(state.reason)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">退款时间：</span>
                    <span>{new Date().toLocaleString('zh-CN')}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">3秒后自动跳转到财务流水页面...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="🔄 提交退款交易号"
        description="确认并提交退款交易，完成资金退回"
      >
        <button 
          onClick={() => navigate(-1)}
          className="qc-btn qc-btn-secondary"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回
        </button>
      </PageHeader>

      {/* 交易信息确认 */}
      <Card>
        <CardHeader>
          <CardTitle>📋 退款信息确认</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">退款交易号</div>
                <div className="font-mono font-semibold text-gray-900">{refundSeq}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">代理商账户ID</div>
                <div className="font-semibold text-gray-900">{agentId}</div>
              </div>
            </div>
            
            {state?.reason && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">退款原因</div>
                <div className="font-semibold text-gray-900">{getReasonLabel(state.reason)}</div>
              </div>
            )}
            
            {state?.amount && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">退款金额</div>
                  <div className="text-4xl font-bold text-orange-600">¥ {state.amount}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 重要提示 */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ 提交前请确认</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>请仔细核对退款交易号和金额信息</li>
                <li>提交后将立即执行退款，资金实时退回</li>
                <li>退款完成后无法撤销，请谨慎操作</li>
                <li>退款金额将从广告主账户扣除并退回代理商账户</li>
                <li>如有疑问，请联系客服或财务人员</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => navigate('/finance/refund/create')}
              className="qc-btn qc-btn-secondary"
            >
              取消退款
            </button>
            <button 
              onClick={handleCommit}
              disabled={loading}
              className="qc-btn qc-btn-primary"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              {loading ? '提交中...' : '确认提交退款'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 流程说明 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">💡 退款流程</h3>
              <div className="flex items-center space-x-4 text-sm text-blue-800">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-2">✓</div>
                  <span>创建交易号</span>
                </div>
                <div className="flex-1 h-0.5 bg-blue-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-2">2</div>
                  <span className="font-semibold">提交确认</span>
                </div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold mr-2">3</div>
                  <span className="text-gray-600">退款完成</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

