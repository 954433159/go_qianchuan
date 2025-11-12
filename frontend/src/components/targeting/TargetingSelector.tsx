import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import InterestSelector from './InterestSelector'
import ActionSelector from './ActionSelector'

export interface TargetingValue {
  interests?: string[]
  actions?: string[]
}

interface TargetingSelectorProps {
  advertiserId: number
  value: TargetingValue
  onChange: (value: TargetingValue) => void
}

export default function TargetingSelector({
  advertiserId,
  value = {},
  onChange,
}: TargetingSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>('interest')

  const handleInterestChange = (interests: string[]) => {
    onChange({
      ...value,
      interests,
    })
  }

  const handleActionChange = (actions: string[]) => {
    onChange({
      ...value,
      actions,
    })
  }

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interest">
            兴趣定向
            {value.interests && value.interests.length > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {value.interests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="action">
            行为定向
            {value.actions && value.actions.length > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {value.actions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interest" className="mt-4">
          <InterestSelector
            advertiserId={advertiserId}
            value={value.interests || []}
            onChange={handleInterestChange}
          />
        </TabsContent>

        <TabsContent value="action" className="mt-4">
          <ActionSelector
            advertiserId={advertiserId}
            value={value.actions || []}
            onChange={handleActionChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
