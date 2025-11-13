import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem } from '@/components/ui/Form'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion'
import TargetingSelector, { TargetingValue } from '@/components/targeting/TargetingSelector'
import RegionSelector from '@/components/targeting/RegionSelector'
import DeviceBrandSelector from '@/components/targeting/DeviceBrandSelector'
import PlatformNetworkCarrierSelector from '@/components/targeting/PlatformNetworkCarrierSelector'
import { AdFormValues } from './types'

interface AdAdvancedTargetingSectionProps {
  form: UseFormReturn<AdFormValues>
  advertiserId: number
  targeting: TargetingValue
  onTargetingChange: (value: TargetingValue) => void
}

export default function AdAdvancedTargetingSection({
  form,
  advertiserId,
  targeting,
  onTargetingChange,
}: AdAdvancedTargetingSectionProps) {
  return (
    <Accordion type="single" collapsible className="border rounded-lg">
      {/* 兴趣行为定向 */}
      <AccordionItem value="targeting" className="border-0">
        <AccordionTrigger className="px-4">
          兴趣行为定向 (可选)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <TargetingSelector
            advertiserId={advertiserId}
            value={targeting}
            onChange={(value) => {
              onTargetingChange(value)
              form.setValue('interest_tags', value.interests || [])
              form.setValue('action_tags', value.actions || [])
            }}
          />
        </AccordionContent>
      </AccordionItem>

      {/* 地域定向 */}
      <AccordionItem value="region" className="border-0">
        <AccordionTrigger className="px-4">
          地域定向 (可选)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <FormField
            control={form.control}
            name="regions"
            render={({ field }) => (
              <FormItem>
                <RegionSelector
                  advertiserId={advertiserId}
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>

      {/* 设备定向 */}
      <AccordionItem value="device" className="border-0">
        <AccordionTrigger className="px-4">
          设备定向 (可选)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <FormField
            control={form.control}
            name="device_brands"
            render={({ field }) => (
              <FormItem>
                <DeviceBrandSelector
                  advertiserId={advertiserId}
                  value={field.value || []}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>

      {/* 平台/网络/运营商定向 */}
      <AccordionItem value="platform" className="border-0">
        <AccordionTrigger className="px-4">
          平台/网络/运营商定向 (可选)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <PlatformNetworkCarrierSelector
            platforms={form.watch('platforms') || []}
            networks={form.watch('networks') || []}
            carriers={form.watch('carriers') || []}
            onPlatformsChange={(value) => form.setValue('platforms', value)}
            onNetworksChange={(value) => form.setValue('networks', value)}
            onCarriersChange={(value) => form.setValue('carriers', value)}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
