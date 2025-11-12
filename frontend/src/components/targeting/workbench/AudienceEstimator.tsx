import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { X, Plus } from 'lucide-react'

interface AudienceConfig {
  region: string
  gender: string[]
  ageMin: string
  ageMax: string
  interests: string[]
}

interface AudienceEstimatorProps {
  onAnalyze?: (config: AudienceConfig) => void
}

export default function AudienceEstimator({ onAnalyze }: AudienceEstimatorProps) {
  const [region, setRegion] = useState('全国')
  const [gender, setGender] = useState<string[]>(['不限'])
  const [ageMin, setAgeMin] = useState('18')
  const [ageMax, setAgeMax] = useState('50')
  const [interests, setInterests] = useState<string[]>(['美妆护肤'])

  const handleGenderToggle = (value: string) => {
    if (value === '不限') {
      setGender(['不限'])
    } else {
      const newGender = gender.filter(g => g !== '不限')
      if (newGender.includes(value)) {
        const filtered = newGender.filter(g => g !== value)
        setGender(filtered.length === 0 ? ['不限'] : filtered)
      } else {
        setGender([...newGender, value])
      }
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest))
  }

  const handleAnalyze = () => {
    onAnalyze?.({
      region,
      gender,
      ageMin,
      ageMax,
      interests,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>受众规模预估</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Region Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">地域选择</label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全国">全国</SelectItem>
              <SelectItem value="北京市">北京市</SelectItem>
              <SelectItem value="上海市">上海市</SelectItem>
              <SelectItem value="广东省">广东省</SelectItem>
              <SelectItem value="浙江省">浙江省</SelectItem>
              <SelectItem value="江苏省">江苏省</SelectItem>
              <SelectItem value="四川省">四川省</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">性别</label>
          <div className="grid grid-cols-3 gap-2">
            {['不限', '男', '女'].map((g) => (
              <label
                key={g}
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  gender.includes(g)
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'hover:bg-accent'
                }`}
              >
                <Checkbox
                  checked={gender.includes(g)}
                  onCheckedChange={() => handleGenderToggle(g)}
                  className="mr-2"
                />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium mb-2">年龄范围</label>
          <div className="flex gap-3 items-center">
            <Select value={ageMin} onValueChange={setAgeMin}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18">18岁</SelectItem>
                <SelectItem value="20">20岁</SelectItem>
                <SelectItem value="25">25岁</SelectItem>
                <SelectItem value="30">30岁</SelectItem>
                <SelectItem value="35">35岁</SelectItem>
                <SelectItem value="40">40岁</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">-</span>
            <Select value={ageMax} onValueChange={setAgeMax}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30岁</SelectItem>
                <SelectItem value="40">40岁</SelectItem>
                <SelectItem value="50">50岁</SelectItem>
                <SelectItem value="60">60岁</SelectItem>
                <SelectItem value="65">60岁以上</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interest Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">兴趣标签</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {interests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              // In production, this would open a dialog to select interests
              const newInterest = prompt('添加兴趣标签:')
              if (newInterest && !interests.includes(newInterest)) {
                setInterests([...interests, newInterest])
              }
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            添加标签
          </Button>
        </div>

        {/* Analyze Button */}
        <Button className="w-full" onClick={handleAnalyze}>
          开始分析
        </Button>
      </CardContent>
    </Card>
  )
}
