import xml.etree.ElementTree as ET
import json

# XML 파일 읽기
xml_file = 'CORPCODE.xml'  # XML 파일 경로를 입력하세요

tree = ET.parse(xml_file)
root = tree.getroot()

# JSON 변환
json_data = []
for list_elem in root.findall('list'):
    list_data = {}
    for child in list_elem:
        list_data[child.tag] = child.text.strip()  # .strip() to remove leading/trailing whitespaces
    json_data.append(list_data)

# 결과 출력 또는 저장
json_result = json.dumps(json_data, ensure_ascii=False, indent=4)

# 결과 출력
print(json_result)

# JSON 파일로 저장 (필요한 경우)
json_file = 'output.json'  # 저장할 JSON 파일 경로를 입력하세요
with open(json_file, 'w', encoding='utf-8') as f:
    f.write(json_result)
