/* eslint-disable react-hooks/purity */
export default function HRDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">HR Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of hiring activities and performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Active Jobs", value: 12 },
          { label: "New Applications", value: 38 },
          { label: "Interviews", value: 9 },
          { label: "Candidates", value: 142 },
          { label: "Hires (Month)", value: 3 },
          { label: "Pending Referrals", value: 7 },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-card border rounded-xl p-4"
          >
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Middle section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Pipeline */}
        <div className="bg-card border rounded-xl p-4 lg:col-span-2">
          <h2 className="font-semibold mb-4">Candidate Pipeline</h2>
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            {["Applied", "Screening", "Interview", "Offer", "Hired"].map(
              (stage) => (
                <div key={stage}>
                  <p className="font-medium">{stage}</p>
                  <p className="text-lg font-bold text-primary mt-1">
                    
                    {Math.floor(Math.random() * 30)}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-card border rounded-xl p-4">
          <h2 className="font-semibold mb-4">Upcoming Interviews</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <p className="font-medium">Ankit Sharma</p>
              <p className="text-muted-foreground">
                React Developer – Today 11:00 AM
              </p>
            </li>
            <li>
              <p className="font-medium">Neha Verma</p>
              <p className="text-muted-foreground">
                QA Engineer – Tomorrow 2:30 PM
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            "Post New Job",
            "View Candidates",
            "Manage Referrals",
            "View Reports",
          ].map((action) => (
            <button
              key={action}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
