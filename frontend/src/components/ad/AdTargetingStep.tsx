import { UseFormReturn } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { AdFormValues } from './types'

interface AdTargetingStepProps {
  form: UseFormReturn<AdFormValues>
}

export default function AdTargetingStep({ form }: AdTargetingStepProps) {
  return (
    <div className="space-y-4">
      {/* 性别定向 */}
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>性别定向 *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="NONE">不限</SelectItem>
                <SelectItem value="MALE">男</SelectItem>
                <SelectItem value="FEMALE">女</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
