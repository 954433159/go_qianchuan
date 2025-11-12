files = [
    'live-data.html', 'audiences.html', 'aweme-accounts.html', 'creative-get-detail.html',
    'creatives.html', 'dashboard.html', 'live-rooms.html',
    'material-delete.html', 'media-library.html', 'product-center.html',
    'products.html', 'promotions.html', 'report-live-product-detail.html',
    'suixintui-roi-suggestions.html', 'tools-targeting.html',
    'uni-promotion-material-delete.html'
]

for f in files:
    # 读备份
    with open(f'{f}.backup', 'r', encoding='utf-8') as file:
        content = file.read()
    
    # 统计aside数量
    aside_count = content.count('<aside')
    if aside_count < 2:
        print(f"✓ {f}: 只有1个侧边栏")
        continue
    
    # 策略：删除第二个 <div class="flex"> 到它匹配的 </div>
    # 步骤1：找到第一个</aside>后的位置
    first_aside_pos = content.find('</aside>')
    if first_aside_pos == -1:
        continue
    
    # 步骤2：从该位置后找 <div class="flex">
    search_from = first_aside_pos + 8
    flex_start_pos = content.find('<div class="flex">', search_from)
    
    if flex_start_pos == -1:
        print(f"✗ {f}: 未找到第二个flex")
        continue
    
    # 步骤3：找匹配的</div> - 用栈计数
    depth = 1
    pos = flex_start_pos + len('<div class="flex">')
    
    while pos < len(content) and depth > 0:
        if content[pos:pos+5] == '<div ':
            depth += 1
        elif content[pos:pos+4] == '<div':
            depth += 1
        elif content[pos:pos+6] == '</div>':
            depth -= 1
            if depth == 0:
                flex_end_pos = pos + 6
                break
        pos += 1
    
    if depth != 0:
        print(f"✗ {f}: 无法匹配flex结束")
        continue
    
    # 步骤4：删除这整个块，直接拼接
    new_content = content[:flex_start_pos] + content[flex_end_pos:]
    
    # 写回
    with open(f, 'w', encoding='utf-8') as file:
        file.write(new_content)
    
    removed_size = flex_end_pos - flex_start_pos
    print(f"✓ {f}: 删除了 {removed_size} 字符")

print("\n✅ 批量修复完成！")
