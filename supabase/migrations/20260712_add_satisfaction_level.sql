-- ============================================
-- Migration: user_reviews 新增 satisfaction_level
-- ============================================
-- 为什么需要：
--   引入"正面外显，负面内化 + 中评"机制。
--   好评 (1)  → 公开展示紫色徽章。
--   中评 (0)  → 仅后台留存，不对外展示。
--   差评 (-1) → 仅后台留存，用于风控封号，不对外展示。
--
-- 修改哪些表：
--   仅 public.user_reviews，新增 1 个字段 + 1 个 CHECK 约束。
--
-- 是否影响已有数据：
--   否。新增字段允许 NULL（已存在的行），新评价强制 NOT NULL。
--
-- 是否可以重复执行：
--   是。ADD COLUMN IF NOT EXISTS + DROP CONSTRAINT IF EXISTS，完全幂等。
-- ============================================

ALTER TABLE public.user_reviews
  ADD COLUMN IF NOT EXISTS satisfaction_level integer;

ALTER TABLE public.user_reviews
  DROP CONSTRAINT IF EXISTS chk_satisfaction_level;

ALTER TABLE public.user_reviews
  ADD CONSTRAINT chk_satisfaction_level
  CHECK (satisfaction_level IN (1, 0, -1));
