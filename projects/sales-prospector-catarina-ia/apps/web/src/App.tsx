import LeadList from '@/components/sales/LeadList'
import { KnowledgeBase } from '@/components/knowledge/KnowledgeBase'
import { Toaster } from 'sonner'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <LeadList />
        <KnowledgeBase />
      </div>
      <Toaster />
    </div>
  )
}

export default App
