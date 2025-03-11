#!/bin/bash

# 設置顏色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# 設置 API 基礎 URL
API_BASE_URL="http://localhost:3000/api"

# 測試函數
test_api() {
  local endpoint=$1
  local data=$2
  local description=$3
  
  echo -e "${YELLOW}測試 $description (${endpoint})...${NC}"
  
  response=$(curl -s -X POST -H "Content-Type: application/json" -d "$data" "${API_BASE_URL}/${endpoint}")
  
  if echo "$response" | grep -q '"result":200'; then
    echo -e "${GREEN}✓ 成功: $description${NC}"
    return 0
  else
    echo -e "${RED}✗ 失敗: $description${NC}"
    echo "回應: $response"
    return 1
  fi
}

# 測試所有端點
echo -e "${YELLOW}===== 開始 API 測試 =====${NC}"

# 測試搜索端點
test_api "search" '{"query":"Ethereum"}' "搜索"

# 測試獲取項目詳情
test_api "get-item" '{"id":"12"}' "獲取項目詳情"

# 測試獲取 VC 詳情
test_api "get-vc" '{"vc_id":"237"}' "獲取 VC 詳情"

# 測試獲取人物詳情
test_api "get-people" '{"people_id":"11829"}' "獲取人物詳情"

# 測試批量獲取投資者信息
test_api "get-investor-batch" '{"ids":"237,140,195"}' "批量獲取投資者信息"

# 測試批量獲取融資輪次
test_api "get-fundraising-batch" '{"ids":"117,129,426"}' "批量獲取融資輪次"

# 測試同步更新（使用較小的時間範圍）
test_api "sync-update" '{"begin_time":"2023-01-01", "end_time":"2023-01-02"}' "同步更新（小範圍）"

# 測試批量同步更新
test_api "batch-sync-update" '{"start_date":"2023-01-01", "end_date":"2023-01-03", "batch_days":1}' "批量同步更新"

# 測試 Top 100 熱門項目
test_api "top-100" '{"days":30}' "Top 100 熱門項目"

# 測試 X 熱門人物
test_api "x-leading-figures" '{"page":1, "page_size":10, "rank_type":"heat"}' "X 熱門人物"

# 測試人物職位動態
test_api "job-changes" '{"page":1, "page_size":10}' "人物職位動態"

# 測試標籤地圖
test_api "tag-map" '{}' "標籤地圖"

# 測試基於生態系統獲取項目
test_api "projects-by-ecosystem" '{"ecosystem_ids":"1"}' "基於生態系統獲取項目"

# 測試基於標籤獲取項目
test_api "projects-by-tags" '{"tag_ids":"1"}' "基於標籤獲取項目"

echo -e "${YELLOW}===== API 測試完成 =====${NC}" 