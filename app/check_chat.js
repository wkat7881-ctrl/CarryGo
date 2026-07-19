import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envStr = fs.readFileSync('.env', 'utf8')
const env = {}
envStr.split('\n').forEach(line => {
  const [k, v] = line.split('=')
  if(k) env[k] = v
})

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

async function run() {
  const CURRENT_USER_ID = '22222222-2222-2222-2222-222222222222'
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      post:posts(*),
      user_one:users!conversations_user_one_id_fkey(*),
      user_two:users!conversations_user_two_id_fkey(*),
      messages:messages(text, created_at, sender_id, type)
    `)
    .or(`user_one_id.eq.${CURRENT_USER_ID},user_two_id.eq.${CURRENT_USER_ID}`)
    .order('created_at', { ascending: false })

  console.log("Error?", error)
  console.log("Data length:", data?.length)
  if (data && data.length > 0) {
    console.log("Latest 2 convs:", JSON.stringify(data.slice(0,2), null, 2))
  }
}
run()
