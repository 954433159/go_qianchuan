import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion'
import { Audience } from '@/api/tools'
import { AdFormValues } from './types'

interface AdAudienceSectionProps {
  form: UseFormReturn<AdFormValues>
  audiences: Audience[]
}

export default function AdAudienceSection({ form, audiences }: AdAudienceSectionProps) {
  return (
    <Accordion type="single" collapsible className="border rounded-lg">
      <AccordionItem value="audience" className="border-0">
        <AccordionTrigger className="px-4">
          人群包选择 (可选)
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <FormField
            control={form.control}
            name="audience_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>选择人群包</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择人群包（可选）" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {audiences.map((audience) => (
                      <SelectItem key={audience.id} value={audience.id.toString()}>
                        {audience.name} ({(audience.cover_num / 10000).toFixed(1)}万人)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
