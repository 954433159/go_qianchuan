# 🚀 新功能快速使用指南

本指南帮助您快速上手本次更新的新功能和组件。

---

## 📦 新增组件使用

### 1. DataTable - 增强表格

**特性**: 排序、搜索、分页、多选

```tsx
import { DataTable } from '@/components/ui'
import type { ColumnDef } from '@/components/ui'

// 定义列
const columns: ColumnDef<User>[] = [
  {
    key: 'id',
    label: 'ID',
    dataIndex: 'id',
    sortable: true,
    width: '100px',
  },
  {
    key: 'name',
    label: '姓名',
    dataIndex: 'name',
    sortable: true,
  },
  {
    key: 'actions',
    label: '操作',
    render: (_, record) => (
      <Button onClick={() => handleEdit(record)}>编辑</Button>
    ),
  },
]

// 使用
<DataTable
  columns={columns}
  data={users}
  loading={loading}
  selectable
  searchable
  onSelectionChange={setSelectedUsers}
  rowKey="id"
/>
```

---

### 2. FilterPanel - 筛选面板

**特性**: 多字段筛选、可折叠、一键重置

```tsx
import { FilterPanel } from '@/components/ui'
import type { FilterField } from '@/components/ui'

const filterFields: FilterField[] = [
  {
    key: 'name',
    label: '用户名',
    type: 'text',
    placeholder: '请输入用户名',
  },
  {
    key: 'status',
    label: '状态',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' },
    ],
  },
  {
    key: 'age',
    label: '年龄',
    type: 'number',
  },
  {
    key: 'createTime',
    label: '创建时间',
    type: 'dateRange',
  },
]

<FilterPanel
  fields={filterFields}
  values={filterValues}
  onChange={setFilterValues}
  onApply={fetchData}
  onReset={() => {
    setFilterValues({})
    fetchData()
  }}
/>
```

---

### 3. Drawer - 抽屉组件

**特性**: 4个方向、5种尺寸、ESC关闭

```tsx
import { Drawer } from '@/components/ui'

const [open, setOpen] = useState(false)

<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="用户详情"
  size="lg"
  placement="right"
  footer={
    <div className="flex gap-2">
      <Button onClick={() => setOpen(false)}>取消</Button>
      <Button onClick={handleSave}>保存</Button>
    </div>
  }
>
  <div className="space-y-4">
    {/* 内容 */}
  </div>
</Drawer>
```

---

### 4. TagInput - 标签输入

**特性**: 自动补全、键盘操作、最大数量限制

```tsx
import { TagInput } from '@/components/ui'

const [tags, setTags] = useState<string[]>([])
const suggestions = ['React', 'Vue', 'Angular', 'Svelte']

<TagInput
  value={tags}
  onChange={setTags}
  placeholder="输入标签后按 Enter"
  maxTags={10}
  suggestions={suggestions}
/>
```

---

### 5. Tag - 标签组件

**特性**: 多种样式、可关闭、可点击

```tsx
import { Tag } from '@/components/ui'

<Tag
  label="React"
  variant="success"
  size="md"
  closable
  onClose={handleRemove}
  onClick={handleClick}
  selected={isSelected}
/>

// 变体: default | success | warning | error | info
// 尺寸: sm | md | lg
```

---

## 🎯 页面功能使用

### 1. ToolsTargeting - 定向工具

**新增**: 人群包管理Tab

```
路径: /tools/targeting
功能:
- 创建人群包
- 编辑人群包
- 复制人群包
- 删除人群包
- 应用人群包

操作步骤:
1. 点击"人群包管理" Tab
2. 点击"新建人群包"按钮
3. 输入名称和描述
4. 点击"创建"
```

---

### 2. Advertisers - 广告主管理

**新增**: 筛选、批量操作、详情抽屉

```
路径: /advertisers
功能:
- 高级筛选 (名称、状态、余额、时间)
- 批量导出
- 查看详情 (侧边抽屉)
- 表格排序
- 全局搜索

操作步骤:
1. 点击"筛选"按钮展开筛选面板
2. 设置筛选条件
3. 点击"应用筛选"
4. 勾选多个广告主
5. 点击"批量导出"
6. 点击"查看"按钮打开详情抽屉
```

---

### 3. Creatives - 创意管理

**新增**: 类型Tab、筛选、预览、批量操作

```
路径: /creatives
功能:
- 按类型筛选 (全部/视频/图片)
- 高级筛选 (标题、类型、状态、时间)
- 创意预览
- 批量下载
- 批量删除
- 表格排序
- 全局搜索

操作步骤:
1. 选择类型Tab (全部/视频/图片)
2. 点击"筛选"展开筛选面板
3. 设置筛选条件并应用
4. 勾选多个创意
5. 点击"批量下载"或"批量删除"
6. 点击"预览"查看创意详情
```

---

## 🔑 组件API参考

### DataTable Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| columns | `ColumnDef<T>[]` | - | 列定义 |
| data | `T[]` | - | 数据源 |
| loading | `boolean` | false | 加载状态 |
| selectable | `boolean` | false | 是否支持多选 |
| searchable | `boolean` | false | 是否支持搜索 |
| pagination | `boolean` | true | 是否分页 |
| pageSize | `number` | 10 | 每页条数 |
| rowKey | `keyof T \| function` | 'id' | 行唯一键 |
| onSelectionChange | `(rows: T[]) => void` | - | 选择变化回调 |

### FilterPanel Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| fields | `FilterField[]` | - | 字段配置 |
| values | `Record<string, any>` | - | 当前值 |
| onChange | `(values) => void` | - | 值变化回调 |
| onApply | `() => void` | - | 应用筛选回调 |
| onReset | `() => void` | - | 重置回调 |
| collapsed | `boolean` | false | 初始折叠状态 |

### Drawer Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| open | `boolean` | - | 是否打开 |
| onClose | `() => void` | - | 关闭回调 |
| title | `string` | - | 标题 |
| children | `ReactNode` | - | 内容 |
| footer | `ReactNode` | - | 底部 |
| placement | `'left' \| 'right' \| 'top' \| 'bottom'` | 'right' | 位置 |
| size | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | 'md' | 尺寸 |

### TagInput Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | `string[]` | - | 标签数组 |
| onChange | `(tags: string[]) => void` | - | 变化回调 |
| placeholder | `string` | '输入标签后按 Enter...' | 占位符 |
| maxTags | `number` | - | 最大标签数 |
| suggestions | `string[]` | [] | 建议列表 |
| disabled | `boolean` | false | 是否禁用 |

### Tag Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| label | `string` | - | 标签文本 |
| variant | `'default' \| 'success' \| 'warning' \| 'error' \| 'info'` | 'default' | 变体 |
| size | `'sm' \| 'md' \| 'lg'` | 'md' | 尺寸 |
| closable | `boolean` | false | 可关闭 |
| onClose | `() => void` | - | 关闭回调 |
| onClick | `() => void` | - | 点击回调 |
| selected | `boolean` | false | 选中状态 |

---

## 💡 使用技巧

### 1. DataTable 批量操作

```tsx
const [selectedRows, setSelectedRows] = useState([])

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.length === 0) return
  // 删除逻辑
  setSelectedRows([])
}

// 批量导出
const handleBatchExport = () => {
  if (selectedRows.length === 0) return
  // 导出逻辑
}

<DataTable
  data={data}
  columns={columns}
  selectable
  onSelectionChange={setSelectedRows}
/>

{selectedRows.length > 0 && (
  <div>
    <Button onClick={handleBatchDelete}>批量删除</Button>
    <Button onClick={handleBatchExport}>批量导出</Button>
  </div>
)}
```

### 2. FilterPanel 持久化

```tsx
// 从URL读取筛选条件
const [filterValues, setFilterValues] = useState(() => {
  const params = new URLSearchParams(window.location.search)
  return Object.fromEntries(params)
})

// 应用筛选时更新URL
const handleApply = () => {
  const params = new URLSearchParams(filterValues)
  window.history.pushState({}, '', `?${params}`)
  fetchData()
}
```

### 3. Drawer 嵌套使用

```tsx
const [drawer1Open, setDrawer1Open] = useState(false)
const [drawer2Open, setDrawer2Open] = useState(false)

<Drawer open={drawer1Open} onClose={() => setDrawer1Open(false)}>
  <Button onClick={() => setDrawer2Open(true)}>打开子抽屉</Button>
  
  <Drawer open={drawer2Open} onClose={() => setDrawer2Open(false)}>
    子抽屉内容
  </Drawer>
</Drawer>
```

---

## 🐛 常见问题

### Q1: DataTable 排序不生效？
A: 确保列定义中设置了 `sortable: true` 和 `dataIndex`

```tsx
{
  key: 'name',
  label: '姓名',
  dataIndex: 'name', // 必须设置
  sortable: true,
}
```

### Q2: FilterPanel 日期范围如何获取？
A: 日期范围类型会生成两个字段：`${key}_start` 和 `${key}_end`

```tsx
{
  key: 'createTime',
  type: 'dateRange',
}

// 使用
const startDate = filterValues.createTime_start
const endDate = filterValues.createTime_end
```

### Q3: Drawer 打开后页面滚动？
A: Drawer组件已自动处理滚动穿透，无需额外设置

### Q4: TagInput 如何限制输入？
A: 使用 `maxTags` 属性

```tsx
<TagInput
  value={tags}
  onChange={setTags}
  maxTags={5} // 最多5个标签
/>
```

---

## 📚 更多资源

- [完整实施报告](./IMPLEMENTATION_REPORT.md)
- [组件库文档](./docs/COMPONENT_LIBRARY_GUIDE.md)
- [API文档](./docs/API_INTEGRATION_STATUS.md)

---

## 📞 技术支持

如有问题，请查看:
1. 本地开发文档: `/frontend/docs/`
2. 在线文档: [待部署]
3. Issue追踪: GitHub Issues

---

**最后更新**: 2025-11-10
