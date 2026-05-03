import json
import re
import os

def fix_topic_json(input_file='topic.json', output_file='topic1.json'):
    # 1. 檢查檔案是否存在
    if not os.path.exists(input_file):
        print(f"錯誤：找不到檔案 {input_file}")
        return

    try:
        # 2. 讀取原始 JSON
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 處理資料（相容單一物件或列表）
        items = data if isinstance(data, list) else [data]

        for item in items:
            # 3. 檢查 'choic' 是否為字串格式 (壞掉的格式)
            if 'choic' in item and isinstance(item['choic'], str):
                # 使用分號分割
                raw_choices = re.split(r';', item['choic'])
                
                # 清理每個選項：去除前後空白，並確保非空字串
                cleaned_choices = [c.strip() for c in raw_choices if c.strip()]
                
                # 將結果存回為列表
                item['choic'] = cleaned_choices

        # 4. 儲存結果
        # indent=4 會自動縮排，並在列表元素間加上逗點
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        
        print(f"✅ 修正成功！已儲存至：{output_file}")
        print("💡 每個選項現在已轉換為獨立字串，並由 JSON 標準逗點隔開。")

    except json.JSONDecodeError:
        print(f"❌ 錯誤：{input_file} 的 JSON 格式不正確 (例如缺少括號)")
    except Exception as e:
        print(f"❌ 發生錯誤：{e}")

if __name__ == "__main__":
    fix_topic_json()