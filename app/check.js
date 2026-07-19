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
  const { data: convs } = await supabase.from('conversations').select('*, user_one:users!conversations_user_one_id_fkey(name), user_two:users!conversations_user_two_id_fkey(name)').order('created_at', { ascending: false }).limit(3)
  console.log("Conversations:", JSON.stringify(convs, null, 2))
  
  const { data: trades } = await supabase.from('trades').select('*').order('created_at', { ascending: false }).limit(3)
  console.log("Trades:", JSON.stringify(trades, null, 2))
}
run()
