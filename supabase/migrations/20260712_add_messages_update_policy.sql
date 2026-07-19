-- ============================================
-- Migration: 添加 messages 表 UPDATE RLS Policy
-- ============================================
-- 为什么需要：
--   messages 表已启用 RLS，但只定义了 SELECT / INSERT / DELETE
--   三种 policy，缺少 UPDATE policy。
--   当 ChatPage 打开聊天时执行：
--     UPDATE messages SET is_read = true
--     WHERE sender_id = '<对方>' AND receiver_id = '<我>'
--   RLS 因无匹配 policy 而静默拒绝 → is_read 永远为 false
--   → fetchUnreadCount() 永远 > 0 → 底部导航红点永久存在。
--
-- 修改哪些表：
--   仅 public.messages，添加一条 RLS policy（不修改表结构或数据）。
--
-- 是否影响已有数据：
--   否。只添加一条权限规则。已有数据行的 is_read 值不受影响。
--
-- 是否可以重复执行：
--   是。DROP POLICY IF EXISTS + CREATE POLICY，完全幂等。
-- ============================================

DROP POLICY IF EXISTS "Users can mark received messages as read" ON public.messages;

CREATE POLICY "Users can mark received messages as read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);
