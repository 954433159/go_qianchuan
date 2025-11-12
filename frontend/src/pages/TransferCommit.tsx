import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, AlertCircle, ArrowLeft, DollarSign } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { commitTransferSeq } from '@/api/finance'
import { toast } from '@/components/ui/Toast'

interface LocationState {
  transferSeq: string
  agentId: string
  amount: string
}

export default function TransferCommit() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  
  const [loading, setLoading] = useState(false)
  const [committed, setCommitted] = useState(false)
  const [transferSeq, setTransferSeq] = useState(state?.transferSeq || '')
  const [agentId, setAgentId] = useState(state?.agentId || '')

  useEffect(() => {
    if (!state?.transferSeq) {
      toast.warning('请先创建转账交易号')
      navigate('/finance/transfer/create')
    }
  }, [state, navigate])

  const handleCommit = async () => {
    if (!transferSeq || !agentId) {
      toast.error('缺少必要参数')
      return
    }

    setLoading(true)
    try {
      await commitTransferSeq({
        agent_id: Number(agentId),
        transfer_seq: transferSeq
      })

      setCommitted(true)
      toast.success('转账提交成功')
      
      // 3秒后跳转到财务流水页面
      setTimeout(() => {
        navigate('/finance/transactions')
      }, 3000)
    } catch (error) {
      toast.error('转账提交失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (committed) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="✅ 转账成功"
          description="转账已成功提交并处理"
        />
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">转账成功！</h3>
              <p className="text-green-700 mb-6">资金已成功转入目标账户</p>
              
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto mb-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">交易流水号：</span>
                    <span className="font-mono font-semibold">{transferSeq}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">转账金额：</span>
                    <span className="font-bold text-green-600">¥ {state?.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">转账时间：</span>
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
        title="💰 提交转账交易号"
        description="确认并提交转账交易，完成资金划转"
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
          <CardTitle>📋 交易信息确认</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">转账交易号</div>
                <div className="font-mono font-semibold text-gray-900">{transferSeq}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">代理商账户ID</div>
                <div className="font-semibold text-gray-900">{agentId}</div>
              </div>
            </div>
            
            {state?.amount && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6 border border-red-200">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">转账金额</div>
                  <div className="text-4xl font-bold text-red-600">¥ {state.amount}</div>
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
                <li>请仔细核对转账交易号和金额信息</li>
                <li>提交后将立即执行转账，资金实时到账</li>
                <li>转账完成后无法撤销，请谨慎操作</li>
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
              onClick={() => navigate('/finance/transfer/create')}
              className="qc-btn qc-btn-secondary"
            >
              取消转账
            </button>
            <button 
              onClick={handleCommit}
              disabled={loading}
              className="qc-btn qc-btn-primary"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              {loading ? '提交中...' : '确认提交转账'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 流程说明 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">💡 转账流程</h3>
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
                  <span className="text-gray-600">转账完成</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

