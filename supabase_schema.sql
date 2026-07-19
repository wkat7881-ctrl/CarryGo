-- 1. CLEANUP (Drop existing tables first — triggers will cascade drop automatically)
DROP TABLE IF EXISTS trust_tag_votes CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS auto_complete_trade();

-- 2. TABLES CREATION

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'provide' | 'seek'
  departure TEXT NOT NULL,
  arrival TEXT NOT NULL,
  date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  price_info TEXT,
  item_name TEXT,
  item_desc TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  carrier_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  shipper_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  item_weight NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
  carrier_completed BOOLEAN DEFAULT FALSE NOT NULL,
  shipper_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  user_one_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  user_two_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_conversation_per_post UNIQUE (post_id, user_one_id, user_two_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text', -- 'text' | 'system'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trust tag votes table
CREATE TABLE trust_tag_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tag_id TEXT NOT NULL, -- 'smooth_comm', 'fast_reply', 'careful_pack', 'on_time', 'recommend'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_vote UNIQUE (trade_id, voter_id, tag_id)
);

-- 3. TRIGGER FOR AUTO-COMPLETING TRADE
CREATE OR REPLACE FUNCTION auto_complete_trade()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.carrier_completed = TRUE AND NEW.shipper_completed = TRUE THEN
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_complete_trade
BEFORE UPDATE OF carrier_completed, shipper_completed ON trades
FOR EACH ROW
EXECUTE FUNCTION auto_complete_trade();

-- 4. SEEDING MOCK DATA (Fixed UUIDs for easy UI linking)

-- Seed Users
INSERT INTO users (id, name, avatar_url, bio) VALUES
  ('11111111-1111-1111-1111-111111111111', '张明', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', 'CarryGo 活跃会员，常往返中欧'),
  ('22222222-2222-2222-2222-222222222222', 'Linda', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', '极速回复，安全准时'),
  ('33333333-3333-3333-3333-333333333333', 'Alice', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', '偶尔帮带小物件'),
  ('44444444-4444-4444-4444-444444444444', '李华', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', '慕尼黑大学留学生'),
  ('55555555-5555-5555-5555-555555555555', '王芳', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop', '工作出差，随身帮带');

-- Seed Posts
INSERT INTO posts (id, user_id, type, departure, arrival, date, weight, price_info, item_name, item_desc, is_active) VALUES
  -- Provide Post (Linda)
  ('a1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'provide', '慕尼黑', '北京', '2024-08-18', 10, '¥50/kg', NULL, NULL, TRUE),
  -- Provide Post (Alice)
  ('a2222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'provide', '巴黎', '成都', '2024-08-20', 15, '¥60/kg', NULL, NULL, TRUE),
  -- Seek Post (张明)
  ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'seek', '柏林', '上海', '2024-08-22', 3, '报酬 ¥100', '爱他美奶粉（3罐）', '帮背3罐爱他美段奶粉，未开封，防爆包装好。', TRUE),
  -- Seek Post (李华)
  ('a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'seek', '伦敦', '广州', '2024-08-25', 1, '报酬 ¥50', '护肤品套装', '免税店购买的精华人套盒，体积很小。', TRUE);

-- Seed Demo Trust Tag Votes for 张明 (To simulate trust badges logic: unique voters >= 3)
INSERT INTO trades (id, post_id, carrier_id, shipper_id, item_name, item_weight, status, carrier_completed, shipper_completed) VALUES
  ('c1111111-1111-1111-1111-111111111111', NULL, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Aptamil', 3, 'completed', TRUE, TRUE),
  ('c2222222-2222-2222-2222-222222222222', NULL, '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'Documents', 0.5, 'completed', TRUE, TRUE),
  ('c3333333-3333-3333-3333-333333333333', NULL, '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Watch', 0.2, 'completed', TRUE, TRUE);

INSERT INTO trust_tag_votes (trade_id, voter_id, recipient_id, tag_id) VALUES
  -- Linda votes for 张明
  ('c1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'smooth_comm'),
  ('c1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'on_time'),
  ('c1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'careful_pack'),
  -- 李华 votes for 张明
  ('c2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'smooth_comm'),
  ('c2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'on_time'),
  -- 王芳 votes for 张明
  ('c3333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'smooth_comm'),
  ('c3333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'on_time');
