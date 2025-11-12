import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, AlertCircle, Info, ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import PageHeader from '@/components/ui/PageHeader'
import { createTransferSeq } from '@/api/finance'
import { toast } from '@/components/ui/Toast'
import { useAdvertiserStore } from '@/store/advertiserStore'

export default function TransferCreate() {
  const navigate = useNavigate()
  const { currentAdvertiser } = useAdvertiserStore()
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  
  const [formData, setFormData] = useState({
    agentId: '',
    advertiserId: '',
    amount: '',
    bizType: 'TRANSFER',
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
      const result = await createTransferSeq({
        agent_id: Number(formData.agentId),
        advertiser_id: Number(formData.advertiserId),
        amount: Number(formData.amount),
        remark: formData.remark
      })
      
      toast.success('转账交易号创建成功')
      // 跳转到提交页面，传递交易号
      navigate('/finance/transfer/commit', {
        state: {
          transferSeq: result.transfer_seq,
          agentId: formData.agentId,
          amount: formData.amount
        }
      })
    } catch (error) {
      toast.error('创建转账交易号失败')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="💰 创建转账交易号（方舟）"
        description="为代理商账户创建转账交易号，用于资金划转"
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
              <h3 className="font-semibold text-blue-900 mb-2">转账流程说明</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>第一步：创建转账交易号（当前页面）</li>
                <li>第二步：提交转账交易号确认转账</li>
                <li>转账成功后资金将从代理商账户转入广告主账户</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 转账表单 */}
      <Card>
        <CardHeader>
          <CardTitle>📝 转账信息</CardTitle>
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
              <p className="mt-1 text-xs text-gray-500">发起转账的代理商账户唯一标识</p>
            </div>

            {/* 目标广告主账户ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标广告主账户ID <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.advertiserId}
                onChange={(e) => setFormData({...formData, advertiserId: e.target.value})}
                className="qc-input" 
                placeholder="请输入广告主账户ID" 
                required 
              />
              <p className="mt-1 text-xs text-gray-500">接收转账的广告主账户唯一标识</p>
            </div>

            {/* 转账金额 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                转账金额（元） <span className="text-red-500">*</span>
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
              <p className="mt-1 text-xs text-gray-500">单笔转账金额最低1元，最高不超过账户余额</p>
            </div>

            {/* 业务类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                业务类型 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`qc-card qc-card-interactive border-2 cursor-pointer ${
                  formData.bizType === 'TRANSFER' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input 
                    type="radio" 
                    name="bizType" 
                    value="TRANSFER" 
                    checked={formData.bizType === 'TRANSFER'}
                    onChange={(e) => setFormData({...formData, bizType: e.target.value})}
                    className="hidden" 
                  />
                  <div className="text-center py-3">
                    <div className="font-semibold text-gray-900 mb-1">📤 普通转账</div>
                    <p className="text-xs text-gray-600">代理商向广告主转账充值</p>
                  </div>
                </label>
                <label className={`qc-card qc-card-interactive border-2 cursor-pointer ${
                  formData.bizType === 'RETURN' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input 
                    type="radio" 
                    name="bizType" 
                    value="RETURN" 
                    checked={formData.bizType === 'RETURN'}
                    onChange={(e) => setFormData({...formData, bizType: e.target.value})}
                    className="hidden" 
                  />
                  <div className="text-center py-3">
                    <div className="font-semibold text-gray-900 mb-1">📥 返还转账</div>
                    <p className="text-xs text-gray-600">特殊资金返还场景</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 转账备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                转账备注 <span className="text-gray-400">(选填)</span>
              </label>
              <textarea 
                value={formData.remark}
                onChange={(e) => setFormData({...formData, remark: e.target.value})}
                className="qc-input" 
                rows={3} 
                placeholder="请输入转账备注，便于财务对账" 
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
                    <li>请仔细核对转账金额和目标账户ID，避免转账错误</li>
                    <li>创建交易号后请在24小时内完成提交，否则将自动失效</li>
                    <li>转账成功后资金将立即到账，无法撤销</li>
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
                我已阅读并同意 <a href="#" className="text-red-500 hover:underline">《代理商转账服务协议》</a>
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
                <DollarSign className="w-5 h-5 mr-2" />
                {loading ? '创建中...' : '创建交易号'}
              </button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* 余额显示 */}
      {currentAdvertiser && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">账户可用余额</div>
                <div className="text-2xl font-bold text-gray-900">
                  ¥ {currentAdvertiser.balance?.toLocaleString() || '0.00'}
                </div>
              </div>
              <DollarSign className="w-16 h-16 text-blue-300 opacity-50" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

