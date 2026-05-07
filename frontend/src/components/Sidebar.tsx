import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/upload', label: 'Upload New Tender' },
  { path: '/queue', label: 'Review Queue' },
  { path: '/report', label: 'Reports' }
]

export default function Sidebar() {
  const [aiStatus, setAiStatus] = useState<{ initialized: boolean; provider: string } | null>(null)

  useEffect(() => {
    fetch('/api/v1/config/ai')
      .then(res => res.json())
      .then(data => setAiStatus(data))
      .catch(() => setAiStatus(null))
  }, [])

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">CertiGuard</h1>
            <p className="text-xs text-slate-400 mt-1">AI Auditor for Procurement</p>
          </div>
          {aiStatus?.initialized && (
            <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-green-400 font-medium">AI</span>
            </div>
          )}
        </div>
        {aiStatus?.initialized && aiStatus.provider && (
          <p className="text-xs text-slate-500 mt-2">Powered by {aiStatus.provider.toUpperCase()}</p>
        )}
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg transition ${
                    isActive ? 'bg-blue-600' : 'hover:bg-slate-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">Tender Evaluation System</p>
      </div>
    </aside>
  )
}