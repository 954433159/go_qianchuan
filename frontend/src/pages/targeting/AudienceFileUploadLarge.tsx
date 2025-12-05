import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Button } from '@/components/ui'
import { Upload, FileText, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/useToast'

export default function AudienceFileUploadLarge() {
  const { success, error: showError } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      showError('请选择文件')
      return
    }
    setUploading(true)
    setTimeout(() => {
      success('人群包文件上传成功')
      setUploading(false)
      setFile(null)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="📤 人群包大文件上传"
        description="上传大规模人群包数据文件（支持CSV/TXT格式）"
        breadcrumbs={[
          { label: '首页', href: '/dashboard' },
          { label: '定向工具', href: '/tools/targeting' },
          { label: '人群包上传' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>文件上传</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800"
            >
              点击选择文件
            </label>
            <p className="text-sm text-gray-500 mt-2">支持 CSV、TXT 格式，单个文件不超过 100MB</p>
            {file && (
              <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>{file.name}</span>
              </div>
            )}
          </div>
          <Button onClick={handleUpload} disabled={!file || uploading} className="mt-4 w-full">
            {uploading ? '上传中...' : '开始上传'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>文件格式要求</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• 文件格式：CSV 或 TXT</p>
          <p>• 编码格式：UTF-8</p>
          <p>• 数据格式：每行一个用户ID（手机号、设备ID等）</p>
          <p>• 文件大小：不超过 100MB</p>
          <p>• 数据量：建议每个人群包不超过 500 万用户</p>
        </CardContent>
      </Card>
    </div>
  )
}
