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

      <AsyncState loading={loading} error={error}>
        {data && (
          <>
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
                <ul>
                  {Object.entries(data.profilesByGender).map(([gender, count]) => (
                    <li key={gender}>
                      {gender}: {count}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </>
        )}
      </AsyncState>
    </section>
  )
}
