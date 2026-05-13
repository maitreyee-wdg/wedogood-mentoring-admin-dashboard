import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Layout from "@/components/Layout"
import Requests from "@/pages/Requests"
import Mentees from "@/pages/Mentees"

function ComingSoon({ page }: { page: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="text-center">
        <p className="text-4xl mb-3">🚧</p>
        <p className="font-medium text-gray-600">{page}</p>
        <p className="text-sm mt-1">Coming soon</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/requests" replace />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/volunteers" element={<ComingSoon page="Volunteers" />} />
          <Route path="/mentees" element={<Mentees />} />
          <Route path="/health" element={<ComingSoon page="Health Dashboard" />} />
          <Route path="/bot-config" element={<ComingSoon page="Bot Configuration" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
