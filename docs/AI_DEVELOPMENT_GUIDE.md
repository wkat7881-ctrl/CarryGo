# AI Development Guide — CarryGo

> 本文档面向 AI 编码助手（Claude、Cursor、Copilot 等）。
> 所有 AI 在修改本项目前必须遵守以下规则。

---

## 项目概述

**CarryGo** — 跨境包裹帮带平台。面向海外华人和旅行者，连接"可帮带"与"求帮带"需求。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19 + Vite 8 |
| 路由 | react-router-dom v7 |
| 样式 | TailwindCSS v4 |
| 图标 | lucide-react |
| 后端/数据库 | Supabase (PostgreSQL + RLS + Realtime) |
| 认证 | Supabase Auth (Google OAuth + Email) |

## 项目结构

```
carrygo/
  src/
    components/       # 可复用组件
      Layout.jsx       # 全局布局（Header + 底部导航 + 红点）
      Avatar.jsx       # 头像组件
      CityInput.jsx    # 城市搜索输入
      RatingModal.jsx  # 评价弹窗
    pages/
      FeedPage.jsx      # 首页（搜索 + 帖子卡片列表）
      PostDetailPage.jsx # 帖子详情
      NewPostPage.jsx   # 发帖
      EditPostPage.jsx  # 编辑帖子
      ChatPage.jsx      # 聊天对话页
      InboxPage.jsx     # 消息列表（会话 + 通知）
      ProfilePage.jsx   # 个人主页
      AuthPage.jsx      # 登录/注册
    context/
      AuthContext.jsx   # 用户认证上下文
    lib/
      supabase.js       # Supabase 客户端初始化
    index.css           # 全局样式（设计系统）
  supabase/
    migrations/         # ★ 数据库变更记录（核心）
    README.md           # 数据库工作流说明
  docs/
    AI_DEVELOPMENT_GUIDE.md  # 本文件
  supabase-schema.sql   # ⚠️ 旧版 schema 参考（不要直接修改！）
```

---

## ★ 数据库修改规则（最重要）

### 严禁行为

- ❌ **不要**直接修改数据库（Supabase Dashboard → Table Editor）
- ❌ **不要**在 SQL Editor 中执行不在此仓库中的 SQL
- ❌ **不要**直接修改 `supabase-schema.sql`（它是旧版参考文件）
- ❌ **不要**在不知道数据库实际状态的情况下推测表结构

### 必须遵守

- ✅ 所有数据库变更**必须先创建 migration 文件**：`supabase/migrations/YYYYMMDD_description.sql`
- ✅ 每个 migration **必须幂等**（可重复执行）：
  - DDL 使用 `IF EXISTS` / `IF NOT EXISTS`
  - RLS policy 使用 `DROP POLICY IF EXISTS ...; CREATE POLICY ...`
- ✅ 文件顶部**必须包含注释**说明原因、影响范围、幂等性
- ✅ 修改数据库前**先读 `supabase-schema.sql`** 了解完整 schema 定义
- ✅ **区分 schema 定义和数据库实际状态**：`supabase-schema.sql` 中的定义不一定已在数据库执行

### Migration 命名格式

```
YYYYMMDD_descriptive_name.sql
```

### 执行 Migration

当前无 Supabase CLI，通过 **Supabase Dashboard → SQL Editor → Run** 手动执行。

详见 [`supabase/README.md`](../supabase/README.md)。

---

## 设计系统

### 颜色

| Token | 值 | 用途 |
|-------|-----|------|
| `primary-600` | `#6D5EF5` | 品牌紫、主按钮、链接 |
| `muted-700` | `#2D2D3A` | 主文字 |
| `muted-600` | `#6B6B7B` | 次要文字 |
| `muted-500` | `#9999AA` | 辅助文字 |
| `muted-200` | `#EBEBF0` | 边框 |
| `muted-100` | `#F4F4F8` | 浅灰背景 |
| `muted-50` | `#F8F8FC` | 页面背景 |

### 间距

- 基于 **8px grid**
- 常用值：`4(0.5)` `8(1)` `12(1.5)` `16(2)` `20(2.5)` `24(3)` `32(4)`

### 圆角

- 卡片：`rounded-2xl`（16px）
- 按钮/输入框：`rounded-xl`（12px）
- 弹窗：`rounded-2xl`

---

## 编码约定

### 组件
- 使用函数组件 + Hooks
- 状态管理：React Context（AuthContext）
- 路由参数：`useParams` / `useSearchParams`
- 不在组件中直接操作 DOM

### Supabase 调用
- 通过 `src/lib/supabase.js` 导出的 `supabase` 客户端
- 所有数据库操作需要处理 error 返回
- Realtime 订阅在 `useEffect` cleanup 中取消

### 样式
- 优先使用 Tailwind utility class
- 品牌色使用 CSS 变量或 inline style（如 `style={{ color: '#6D5EF5' }}`）
- 图标统一使用 `lucide-react`，不使用 emoji

### 路由
- 未登录用户重定向到 `/auth`
- 需认证的导航项在未登录时跳转 `/auth`

---

## 已知问题与陷阱

1. **`supabase-schema.sql` ≠ 数据库实际状态**
   - 该文件定义了完整 schema，但部分内容可能未在数据库执行
   - 遇到 404 错误时，先检查表是否真实存在

2. **RLS 静默拒绝**
   - Supabase RLS 拒绝操作时**不报错**，只返回空结果 / affected rows = 0
   - 调试时检查 RLS policy 是否存在、条件是否正确

3. **Realtime 只监听 INSERT**
   - 当前所有 Realtime 订阅只监听 `INSERT` 事件
   - `is_read` 的更新（UPDATE 事件）不会触发 UI 刷新
   - 需在路由切换时手动 re-fetch（已在 Layout.jsx 中实现）

4. **`profiles` 表是用户外键目标**
   - 所有业务表引用 `profiles(id)`，**不是** `auth.users(id)`
   - 保持一致性，不要创建直接引用 `auth.users` 的外键
