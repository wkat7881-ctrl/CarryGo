# Supabase 数据库 — Migration 工作流

## 目录结构

```
supabase/
  migrations/          ← 所有数据库变更记录
    20260712_add_messages_update_policy.sql
    20260712_create_notifications.sql
  README.md            ← 本文件

supabase-schema.sql    ← ⚠️ 旧版参考文件，仅用于查看完整 schema
                         不要直接修改！所有变更通过 migration 管理。
```

## ⚠️ 当前状态

本项目目前**没有安装 Supabase CLI**，无法使用 `supabase migration` 命令。

当前数据库同步方式：

### 手动执行（当前方式）

1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 → **SQL Editor**
3. 打开对应 migration 文件，复制全部 SQL
4. 粘贴到 SQL Editor → 点击 **Run**

### 升级到 CLI（推荐）

```bash
# 1. 安装 Supabase CLI
brew install supabase/tap/supabase

# 2. 在项目目录初始化
cd carrygo/
supabase init

# 3. 链接远程项目
supabase link --project-ref <your-project-ref-id>

# 4. 执行所有未应用的 migration
supabase db push
```

之后只需 `supabase db push` 一条命令即可同步所有 migration。

## Migration 文件命名规范

```
YYYYMMDD_descriptive_name.sql
```

示例：
- `20260712_add_messages_update_policy.sql`
- `20260712_create_notifications.sql`
- `20260713_add_post_tags_column.sql`

## 修改数据库的规则

**禁止：**
- ❌ 在 Supabase Dashboard → Table Editor 中直接修改表
- ❌ 在 SQL Editor 中手动写入不在 migration 中的 SQL
- ❌ 修改 `supabase-schema.sql` 而不创建对应 migration

**必须：**
- ✅ 所有数据库变更先写入 `supabase/migrations/` 目录
- ✅ 文件名使用日期前缀，保证执行顺序
- ✅ 每段 SQL 可重复执行（幂等）
- ✅ 创建新 migration 后执行它

## 如何创建新 Migration

1. 在 `supabase/migrations/` 下创建新 `.sql` 文件，命名遵循格式
2. SQL 中所有 DDL 使用 `IF EXISTS` / `IF NOT EXISTS`
3. RLS policy 使用 `DROP POLICY IF EXISTS ...; CREATE POLICY ...`
4. 文件顶部添加注释说明：
   - 为什么需要这段 SQL
   - 修改了哪些表
   - 是否影响已有数据
   - 是否可以重复执行（幂等）
5. 通过 SQL Editor 或 `supabase db push` 执行

## 验证 Migration 状态

执行后在 Supabase Dashboard → **Table Editor** 中确认：
- 新表/字段是否存在
- RLS Policies 是否正确
- 索引是否创建
