-- ============================================
-- Migration: 创建 notifications 表
-- ============================================
-- 为什么需要：
--   schema.sql 中已定义此表，但从未在 Supabase 数据库执行。
--   项目中 5 个文件、15 处代码依赖此表：
--     - Layout.jsx          查询未读通知数（红点统计）
--     - InboxPage.jsx       通知列表 + 标记已读
--     - ChatPage.jsx        INSERT 新消息通知 + UPDATE 已读
--     - RatingModal.jsx     INSERT 评价通知
--   全部操作返回 404，通知功能完全失效。
--
-- 修改哪些表：
--   新建 public.notifications 表 + 2 个索引 + 3 条 RLS policy。
--
-- 是否影响已有数据：
--   否。CREATE TABLE IF NOT EXISTS，新建空表。不删除/修改已有数据。
--
-- 是否可以重复执行：
--   是。全部使用 IF NOT EXISTS / DROP POLICY IF EXISTS，完全幂等。
-- ============================================

-- 1. 建表
CREATE TABLE IF NOT EXISTS public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type        text NOT NULL CHECK (type IN ('new_message', 'new_rating')),
  content     text NOT NULL,
  related_id  text,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- 2. 索引：加速查询某用户的未读通知
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, is_read)
  WHERE is_read = false;

-- 3. 索引：加速按时间排序的通知列表
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications(created_at DESC);

-- 4. 启用 RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. SELECT：用户只能看自己的通知
DROP POLICY IF EXISTS "Users can read their own notifications" ON public.notifications;
CREATE POLICY "Users can read their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 6. INSERT：至少需要登录（通知是发送者为接收者创建的）
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 7. UPDATE：用户只能标记自己的通知为已读
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
