import AdminTournamentsClient from './TournamentsClient'

export default function AdminTournamentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">emoji_events</span>
          Tournament Management
        </h1>
        <p className="text-on-surface-variant mt-1">Create and manage competitive brackets for 4 or 8 players.</p>
      </div>
      <AdminTournamentsClient />
    </div>
  )
}
