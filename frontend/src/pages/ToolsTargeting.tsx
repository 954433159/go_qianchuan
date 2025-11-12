import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import AudienceEstimator from '@/components/targeting/workbench/AudienceEstimator'
import AnalysisResult from '@/components/targeting/workbench/AnalysisResult'
import DemographicsBreakdown from '@/components/targeting/workbench/DemographicsBreakdown'
import HeatmapPlaceholder from '@/components/targeting/workbench/HeatmapPlaceholder'
import InterestLibrary from '@/components/targeting/workbench/InterestLibrary'
import BehaviorTraits from '@/components/targeting/workbench/BehaviorTraits'
import AudiencePackManager from '@/components/targeting/workbench/AudiencePackManager'
import SavedAudiencesPanel from '@/components/targeting/SavedAudiencesPanel'
import RelatedToolsPanel from '@/components/targeting/RelatedToolsPanel'
import { useToast } from '@/hooks/useToast'

export default function ToolsTargeting() {
  const [activeTab, setActiveTab] = useState('audience')
  const [showResults, setShowResults] = useState(false)
  const { success } = useToast()

  const handleAnalyze = () => {
    setShowResults(true)
    success('已生成受众分析结果')
  }

  const handleSaveAudience = () => {
    success('当前定向配置已保存为人群包')
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="定向工具" 
        description="帮助您精准定位目标受众,提升广告投放效果"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="audience">受众分析</TabsTrigger>
          <TabsTrigger value="region">地域热力图</TabsTrigger>
          <TabsTrigger value="interest">兴趣标签库</TabsTrigger>
          <TabsTrigger value="behavior">行为特征</TabsTrigger>
          <TabsTrigger value="audience-pack">人群包管理</TabsTrigger>
        </TabsList>

        {/* Audience Analysis Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - 2 cols */}
            <div className="lg:col-span-2 space-y-6">
              <AudienceEstimator onAnalyze={handleAnalyze} />
              
              {showResults && (
                <>
                  <AnalysisResult />
                  <DemographicsBreakdown />
                </>
              )}
            </div>

            {/* Right Panel - 1 col */}
            <div className="space-y-6">
              <RelatedToolsPanel />
              <SavedAudiencesPanel onSave={handleSaveAudience} />
            </div>
          </div>
        </TabsContent>

        {/* Region Heatmap Tab */}
        <TabsContent value="region" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <HeatmapPlaceholder />
            </div>
            <div className="space-y-6">
              <RelatedToolsPanel />
              <SavedAudiencesPanel onSave={handleSaveAudience} />
            </div>
          </div>
        </TabsContent>

        {/* Interest Library Tab */}
        <TabsContent value="interest" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <InterestLibrary />
            </div>
            <div className="space-y-6">
              <RelatedToolsPanel />
              <SavedAudiencesPanel onSave={handleSaveAudience} />
            </div>
          </div>
        </TabsContent>

        {/* Behavior Traits Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BehaviorTraits />
            </div>
            <div className="space-y-6">
              <RelatedToolsPanel />
              <SavedAudiencesPanel onSave={handleSaveAudience} />
            </div>
          </div>
        </TabsContent>

        {/* Audience Pack Manager Tab */}
        <TabsContent value="audience-pack" className="space-y-6">
          <AudiencePackManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
