-- ============================================
-- Migration: 重构为 Trust Badges 系统
-- ============================================
-- 为什么需要：
--   废弃旧的 ratings 表（含 post_id、comment、复杂 UNIQUE）。
--   新建 user_reviews 表（仅 reviewer、target、tags）。
--   新 RLS：只能评价和自己私聊过的人。
--
-- 修改哪些表：
--   1. 删除 public.ratings（旧评价）
--   2. 新建 public.user_reviews（新徽章）
--   3. 1 个索引 + 3 条 RLS policy
--
-- 是否影响已有数据：
--   是。ratings 表及其数据被永久删除。
--   旧评价逻辑与本系统不兼容，无法迁移。
--
-- 是否可以重复执行：
--   是。全部使用 IF EXISTS / IF NOT EXISTS，完全幂等。
-- ============================================

-- 1. 废弃旧评价表
DROP TABLE IF EXISTS public.ratings CASCADE;

-- 2. 新建 Trust Badges 评价表
CREATE TABLE IF NOT EXISTS public.user_reviews (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  target_id         uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  selected_tags     text[] DEFAULT '{}',
  satisfaction_level integer NOT NULL CHECK (satisfaction_level IN (1, 0, -1)),
  created_at        timestamptz DEFAULT now(),
  UNIQUE(reviewer_id, target_id)
);

-- 3. 索引：加速查询某用户收到的所有评价
CREATE INDEX IF NOT EXISTS idx_user_reviews_target
  ON public.user_reviews(target_id);

-- 4. 启用 RLS
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- 5. SELECT：所有人的评价公开可读
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.user_reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.user_reviews FOR SELECT
  USING (true);

-- 6. INSERT：必须登录 + 只能评价和自己私聊过的人
DROP POLICY IF EXISTS "Users can review people they chatted with" ON public.user_reviews;
CREATE POLICY "Users can review people they chatted with"
  ON public.user_reviews FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = reviewer_id
    AND reviewer_id != target_id
    AND EXISTS (
      SELECT 1 FROM public.messages
      WHERE (sender_id = auth.uid() AND receiver_id = target_id)
         OR (sender_id = target_id AND receiver_id = auth.uid())
    )
  );

-- 7. DELETE：评价者可以删除自己的评价
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.user_reviews;
CREATE POLICY "Users can delete their own reviews"
  ON public.user_reviews FOR DELETE
  USING (auth.uid() = reviewer_id);
