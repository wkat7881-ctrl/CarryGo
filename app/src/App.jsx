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

// Initialize demo trust data
ensureDemoTrustData()

export default function App() {
  return (
    <ToastProvider>
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
