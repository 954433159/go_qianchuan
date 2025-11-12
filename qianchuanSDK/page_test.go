package qianchuanSDK

import "testing"

func TestPageInfo(t *testing.T) {
	tests := []struct {
		name        string
		page        PageInfo
		expectPage  uint64
		expectSize  uint64
		expectTotal uint64
	}{
		{
			name: "基础分页信息",
			page: PageInfo{
				Page:        1,
				PageSize:    20,
				TotalNumber: 100,
				TotalPage:   5,
			},
			expectPage:  1,
			expectSize:  20,
			expectTotal: 100,
		},
		{
			name: "大数据量分页",
			page: PageInfo{
				Page:        10,
				PageSize:    100,
				TotalNumber: 10000,
				TotalPage:   100,
			},
			expectPage:  10,
			expectSize:  100,
			expectTotal: 10000,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.page.Page != tt.expectPage {
				t.Errorf("Page字段错误: 期望%d, 实际%d", tt.expectPage, tt.page.Page)
			}

			if tt.page.PageSize != tt.expectSize {
				t.Errorf("PageSize字段错误: 期望%d, 实际%d", tt.expectSize, tt.page.PageSize)
			}

			if tt.page.TotalNumber != tt.expectTotal {
				t.Errorf("TotalNumber字段错误: 期望%d, 实际%d", tt.expectTotal, tt.page.TotalNumber)
			}
		})
	}
}
