import { matrimonyApi } from '../../api/matrimonyApi'
import { AsyncState } from '../../components/AsyncState'
import { useAsyncData } from '../../hooks/useAsyncData'

export function AdminDashboardPage() {
  const { data, loading, error } = useAsyncData(async () => {
    const response = await matrimonyApi.getAdminDashboardStats()
    return response.data
  }, [])

  return (
    <section className="stack-wide">
      <h1>Dashboard</h1>
      <p className="info-text">Monitor account growth, profile readiness, and distribution signals at a glance.</p>

      <AsyncState loading={loading} error={error}>
        {data && (
          <>
            <div className="admin-kpi-strip">
              <article className="admin-kpi-tile">
                <span className="admin-kpi-label">User Activation</span>
                <strong className="admin-kpi-value">
                  {data.totalUsers > 0 ? `${Math.round((data.activeUsers / data.totalUsers) * 100)}%` : '0%'}
                </strong>
              </article>
              <article className="admin-kpi-tile">
                <span className="admin-kpi-label">Profile Verification</span>
                <strong className="admin-kpi-value">
                  {data.totalProfiles > 0 ? `${Math.round((data.verifiedProfiles / data.totalProfiles) * 100)}%` : '0%'}
                </strong>
              </article>
              <article className="admin-kpi-tile">
                <span className="admin-kpi-label">New Users (7 Days)</span>
                <strong className="admin-kpi-value">{data.newUsersThisWeek}</strong>
              </article>
            </div>

            <div className="stats-grid">
              <article className="stat-card">
                <h3>Total Users</h3>
                <p>{data.totalUsers}</p>
              </article>
              <article className="stat-card">
                <h3>Active Users</h3>
                <p>{data.activeUsers}</p>
              </article>
              <article className="stat-card">
                <h3>Total Profiles</h3>
                <p>{data.totalProfiles}</p>
              </article>
              <article className="stat-card">
                <h3>Verified Profiles</h3>
                <p>{data.verifiedProfiles}</p>
              </article>
              <article className="stat-card">
                <h3>New Users Today</h3>
                <p>{data.newUsersToday}</p>
              </article>
              <article className="stat-card">
                <h3>New This Week</h3>
                <p>{data.newUsersThisWeek}</p>
              </article>
              <article className="stat-card">
                <h3>New This Month</h3>
                <p>{data.newUsersThisMonth}</p>
              </article>
            </div>

            <article className="card stack">
              <h3>Profiles by Gender</h3>
              {Object.keys(data.profilesByGender).length === 0 ? (
                <p className="info-text">No gender distribution data available.</p>
              ) : (
                <div className="admin-gender-stats">
                  {Object.entries(data.profilesByGender).map(([gender, count]) => {
                    const total = Object.values(data.profilesByGender).reduce((sum, value) => sum + value, 0)
                    const ratio = total > 0 ? Math.round((count / total) * 100) : 0

                    return (
                      <div key={gender} className="admin-gender-row">
                        <div className="admin-gender-row-head">
                          <span>{gender}</span>
                          <strong>
                            {count} ({ratio}%)
                          </strong>
                        </div>
                        <div className="admin-gender-track" role="presentation">
                          <span className="admin-gender-fill" style={{ width: `${ratio}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </article>
          </>
        )}
      </AsyncState>
    </section>
  )
}
