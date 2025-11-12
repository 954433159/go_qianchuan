import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, AlertCircle, Info, ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { createRefundSeq } from '@/api/finance'
import { toast } from '@/components/ui/Toast'
import { useAdvertiserStore } from '@/store/advertiserStore'

export default function RefundCreate() {
  const navigate = useNavigate()
  const { currentAdvertiser } = useAdvertiserStore()
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  
  const [formData, setFormData] = useState({
    agentId: '',
    advertiserId: '',
    amount: '',
    reason: '',
    remark: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreed) {
      toast.warning('请先阅读并同意服务协议')
      return
    }

    setLoading(true)
    try {
      const result = await createRefundSeq({
        agent_id: Number(formData.agentId),
        advertiser_id: Number(formData.advertiserId),
        amount: Number(formData.amount),
        remark: formData.remark
      })

      toast.success('退款交易号创建成功')
      // 跳转到提交页面，传递交易号
      navigate('/finance/refund/commit', {
        state: {
          refundSeq: result.refund_seq,
          agentId: formData.agentId,
          amount: formData.amount,
          reason: formData.reason
        }
      })
    } catch (error) {
      toast.error('创建退款交易号失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const refundReasons = [
    { value: 'OVERPAYMENT', label: '多付款项' },
    { value: 'SERVICE_CANCEL', label: '服务取消' },
    { value: 'ACCOUNT_CLOSE', label: '账户关闭' },
    { value: 'ERROR_TRANSFER', label: '转账错误' },
    { value: 'OTHER', label: '其他原因' }
  ]

  return (
    <div className="space-y-6">
      <PageHeader 
        title="🔄 创建退款交易号（方舟）"
        description="为代理商账户创建退款交易号，用于资金退回"
      >
        <button 
          onClick={() => navigate(-1)}
          className="qc-btn qc-btn-secondary"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回
        </button>
      </PageHeader>

      {/* 流程说明 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">退款流程说明</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>第一步：创建退款交易号（当前页面）</li>
                <li>第二步：提交退款交易号确认退款</li>
                <li>退款成功后资金将从广告主账户退回代理商账户</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 退款表单 */}
      <Card>
        <CardHeader>
          <CardTitle>📝 退款信息</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 代理商账户ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                代理商账户ID <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.agentId}
                onChange={(e) => setFormData({...formData, agentId: e.target.value})}
                className="qc-input" 
                placeholder="请输入代理商账户ID" 
                required 
              />
              <p className="mt-1 text-xs text-gray-500">接收退款的代理商账户唯一标识</p>
            </div>

            {/* 广告主账户ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                广告主账户ID <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.advertiserId}
                onChange={(e) => setFormData({...formData, advertiserId: e.target.value})}
                className="qc-input" 
                placeholder="请输入广告主账户ID" 
                required 
              />
              <p className="mt-1 text-xs text-gray-500">发起退款的广告主账户唯一标识</p>
            </div>

            {/* 退款金额 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                退款金额（元） <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="qc-input pl-8" 
                  placeholder="0.00" 
                  step="0.01" 
                  min="0.01" 
                  required 
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">退款金额不能超过账户可用余额</p>
            </div>

            {/* 退款原因 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                退款原因 <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="qc-input"
                required
              >
                <option value="">请选择退款原因</option>
                {refundReasons.map(reason => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 退款备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                退款备注 <span className="text-gray-400">(选填)</span>
              </label>
              <textarea 
                value={formData.remark}
                onChange={(e) => setFormData({...formData, remark: e.target.value})}
                className="qc-input" 
                rows={3} 
                placeholder="请输入退款备注，说明退款详细原因" 
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">最多200个字符</p>
            </div>

            {/* 风险提示 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-1">⚠️ 重要提示</p>
                  <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                    <li>请仔细核对退款金额和账户ID，避免退款错误</li>
                    <li>创建交易号后请在24小时内完成提交，否则将自动失效</li>
                    <li>退款成功后资金将立即退回，无法撤销</li>
                    <li>退款金额不能超过账户可用余额</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 确认协议 */}
            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="agreeTerms" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-red-500 rounded focus:ring-red-500" 
              />
              <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700">
                我已阅读并同意 <a href="#" className="text-red-500 hover:underline">《代理商退款服务协议》</a>
              </label>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="qc-btn qc-btn-secondary"
              >
                取消
              </button>
              <button 
                type="submit" 
                disabled={loading || !agreed}
                className="qc-btn qc-btn-primary"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                {loading ? '创建中...' : '创建退款交易号'}
              </button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* 余额显示 */}
      {currentAdvertiser && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">账户可用余额</div>
                <div className="text-2xl font-bold text-gray-900">
                  ¥ {currentAdvertiser.balance?.toLocaleString() || '0.00'}
                </div>
                <p className="text-xs text-gray-500 mt-1">退款金额不能超过此余额</p>
              </div>
              <RotateCcw className="w-16 h-16 text-orange-300 opacity-50" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

