import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import Toast from './components/layout/Toast'
import { ensureDemoTrustData } from './utils/trustBadges'

// Pages
import HomePage from './pages/HomePage'
import PostDetailPage from './pages/PostDetailPage'
import PostDetailRequestPage from './pages/PostDetailRequestPage'
import PublishPage from './pages/PublishPage'
import DigitalLuggagePage from './pages/DigitalLuggagePage'
import ItemStatusPage from './pages/ItemStatusPage'
import ChatPage from './pages/ChatPage'
import ChatDetailPage from './pages/ChatDetailPage'
import ChatDetailProposalPage from './pages/ChatDetailProposalPage'
import ApplySuccessPage from './pages/ApplySuccessPage'
import ProfilePage from './pages/ProfilePage'
import RequestOrderDetailPage from './pages/RequestOrderDetailPage'
import ReviewPage from './pages/ReviewPage'

import { useEffect } from 'react'
import { supabase } from './supabase/client'

// Initialize demo trust data
ensureDemoTrustData()

import UserSwitcher from './components/features/UserSwitcher'

export default function App() {
  useEffect(() => {
    async function checkConnection() {
      const url = import.meta.env.VITE_SUPABASE_URL
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY
      if (!url || !key) {
        console.warn("⚠️ Supabase: 环境变量 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY 未配置，请创建并填写 app/.env 文件。")
        return
      }
      try {
        const { data, error } = await supabase.from('users').select('id').limit(1)
        if (error) {
          console.error("❌ Supabase 连接失败，请检查数据库是否已成功运行 SQL 脚本！错误信息:", error.message)
        } else {
          console.log("⚡ Supabase 连接成功！已读取到 users 表。数据连接正常。")
        }
      } catch (err) {
        console.error("❌ Supabase 网络连接异常，请检查本地网络和代理配置：", err)
      }
    }
    checkConnection()
  }, [])

  return (
    <ToastProvider>
      <UserSwitcher />
      <BrowserRouter>
        {/* Mobile-first wrapper — centers the app on desktop */}
        <div className="min-h-dvh bg-[#EEEDF8] flex items-start justify-center">
          <div className="w-full max-w-[390px] min-h-dvh bg-surface shadow-2xl relative overflow-hidden">
            <Routes>
              <Route path="/"                    element={<HomePage />} />
              <Route path="/post/:id"            element={<PostDetailPage />} />
              <Route path="/request/:id"         element={<PostDetailRequestPage />} />
              <Route path="/publish"             element={<PublishPage />} />
              <Route path="/luggage"             element={<DigitalLuggagePage />} />
              <Route path="/luggage/item/:id"    element={<ItemStatusPage />} />
              <Route path="/chat"                element={<ChatPage />} />
              <Route path="/chat/:conversationId"      element={<ChatDetailPage />} />
              <Route path="/chat/proposal/:conversationId" element={<ChatDetailProposalPage />} />
              <Route path="/apply-success"       element={<ApplySuccessPage />} />
              <Route path="/profile"             element={<ProfilePage />} />
              <Route path="/profile/:userId"     element={<ProfilePage />} />
              <Route path="/orders/request/:id"  element={<RequestOrderDetailPage />} />
              <Route path="/review"              element={<ReviewPage />} />
            </Routes>

            <Toast />
          </div>
        </div>
      </BrowserRouter>
    </ToastProvider>
  )
}
