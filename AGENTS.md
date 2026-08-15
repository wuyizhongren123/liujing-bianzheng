# 六经辨证用药指导 - 项目说明

## 项目概述

基于《伤寒论》六经辨证体系的中医用药指导Web应用，提供太阳、阳明、少阳、太阴、少阴、厥阴六经辨证的证型分析与方剂推荐。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: Tailwind CSS 4
- **Database**: Supabase PostgreSQL
- **部署**: Vercel

## 目录结构

```
├── src/
│   ├── app/
│   │   ├── api/                    # API路由
│   │   │   ├── meridians/          # 六经数据接口
│   │   │   │   ├── route.ts        # GET /api/meridians
│   │   │   │   ├── [id]/syndromes/ # GET /api/meridians/[id]/syndromes
│   │   │   │   └── [id]/transmissions/ # GET /api/meridians/[id]/transmissions
│   │   │   ├── syndromes/          # 证型数据接口
│   │   │   │   └── [id]/prescriptions/ # GET /api/syndromes/[id]/prescriptions
│   │   │   ├── prescriptions/      # 方剂数据接口
│   │   │   │   └── route.ts        # GET /api/prescriptions
│   │   │   └── herbs/              # 药材数据接口
│   │   │       └── route.ts        # GET /api/herbs
│   │   ├── diagnosis/              # 辨证论治页面
│   │   ├── prescriptions/          # 方剂查询页面
│   │   ├── herbs/                  # 药材百科页面
│   │   └── page.tsx                # 首页
│   └── storage/database/           # 数据库相关
│       └── shared/schema.ts        # 数据库表结构定义
```

## 功能模块

### 1. 首页
- 展示书籍封面和作者信息（郭中仁）
- 六经概览卡片，快速导航到各经辨证
- 功能入口：辨证论治、方剂查询、药材百科

### 2. 辨证论治 (/diagnosis)
- 选择六经（太阳、阳明、少阳、太阴、少阴、厥阴）
- 查看经络详情（概述、病机、主要症状）
- **传变预警与截断**：显示当前经的传变方向、先兆症状、截断方法和合方推荐
- 选择证型，查看证型详情（症状、舌象、脉象、病机、治法）
- 获取推荐方剂（组成、用量、制法、用法、功效、主治、禁忌）

### 3. 方剂查询 (/prescriptions)
- 浏览所有方剂
- 支持搜索（名称、组成、功效、主治）

### 4. 药材百科 (/herbs)
- 浏览所有药材
- 支持搜索（名称、拼音、功效、主治）
- 支持按分类筛选

## API接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/meridians` | GET | 获取六经列表 |
| `/api/meridians/[id]/syndromes` | GET | 获取某经的证型列表 |
| `/api/meridians/[id]/transmissions` | GET | 获取某经的传变关系与截断方剂 |
| `/api/syndromes/[id]/prescriptions` | GET | 获取某证型的方剂列表 |
| `/api/prescriptions` | GET | 获取所有方剂 |
| `/api/herbs` | GET | 获取所有药材 |

## 数据库设计

### 表结构

1. **six_meridians** - 六经表
   - id, name, description, pathogenesis, main_symptoms, sort_order

2. **syndromes** - 证型表
   - id, meridian_id, name, description, symptoms, tongue_presentation, pulse_presentation, pathogenesis, treatment_principle, sort_order

3. **prescriptions** - 方剂表
   - id, syndrome_id, name, composition, dosage, preparation, usage, effects, indications, contraindications, notes, sort_order

4. **herbs** - 药材表
   - id, name, pinyin_name, category, properties, effects, indications, dosage, contraindications, notes

5. **prescription_herbs** - 方剂药材关联表
   - id, prescription_id, herb_id, dosage, preparation, sort_order

6. **meridian_transmissions** - 六经传变关系表
   - id, source_meridian_id, target_meridian_id, transmission_type, warning_symptoms, interception_principle, interception_method, herb_additions, combined_prescription, combined_prescription_desc, purpose, sort_order

7. **interception_prescriptions** - 截断方剂表
   - id, transmission_id, syndrome_id, name, base_prescription, additional_herbs, composition, effects, indications, usage_notes, interception_purpose, sort_order

### 初始数据

- 六经：太阳病、阳明病、少阳病、太阴病、少阴病、厥阴病
- 证型：16个证型（每经2-4个）
- 方剂：16个经典方剂（桂枝汤、麻黄汤、小柴胡汤、白虎汤等）
- 药材：20味常用中药
- 传变关系：8条传变路径（太阳→阳明、少阳→阳明、阳明→少阳、阳明→太阴、太阴→少阴、少阴→厥阴、厥阴→复发等）
- 截断方剂：11个截断合方（葛根汤加石膏知母、大柴胡汤、附子理中汤等）

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 启动
pnpm start
```

## 注意事项

1. 本应用仅供学习参考，实际用药请遵医嘱
2. 数据来源于《伤寒论》经典理论
3. 使用Supabase PostgreSQL存储数据，支持长期稳定运行
