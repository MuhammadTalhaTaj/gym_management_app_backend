import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign, faFileInvoiceDollar, faHourglassHalf, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { useDashboardData } from '../hooks/useDashboardData'
import '../assets/styles/AdminDashboardStats.css'

function AdminDashboardStats() {
  const { data, loading, } = useDashboardData()

  console.log("Data: ",data)
  const displayRevenue =
    loading ? 'Loading...' : data?.revenueThisMonth ?? 0
  const displayAdmissions =
    loading ? '...' : data?.totalAdmissionsThisMonth ?? 0
  const displayExpiring =
    loading ? '...' : data?.expiringSubscriptions ?? 0
  const displayDue =
    loading ? '...' : data?.netDueAmount ?? 0

  return (
    <div className='adminDashboardStats'>
      <div className="adminStatsCard adminStatsCard1">
        <FontAwesomeIcon className='adminStatsDollar' icon={faDollarSign} />
        <div className="adminStatsCard11">
          <p className='text-[var(--primary-300)]'>Today's Earning</p>
          <p className="text-2xl font-bold text-white">
            {typeof displayRevenue === 'number'
              ? `$${displayRevenue.toLocaleString()}`
              : displayRevenue}
          </p>
        </div>
      </div>

      <div className="adminStatsCard adminStatsCard2">
        <FontAwesomeIcon className='adminStatsPlus' icon={faUserPlus} />
        <div className="adminStatsCard11">
          <p className='text-[var(--primary-300)]'>New Admissions</p>
          <p className="text-2xl font-bold text-white">{displayAdmissions}</p>
        </div>
      </div>

      <div className="adminStatsCard adminStatsCard3">
        <FontAwesomeIcon className='adminStatsHalf' icon={faHourglassHalf} />
        <div className="adminStatsCard11">
          <p className='text-[var(--primary-300)]'>
            Subscriptions Expiring
          </p>
          <p className="text-2xl font-bold text-white">{displayExpiring}</p>
        </div>
      </div>

      <div className="adminStatsCard adminStatsCard4">
        <FontAwesomeIcon className='adminStatsInvoice' icon={faFileInvoiceDollar} />
        <div className="adminStatsCard11">
          <p className='text-[var(--primary-300)]'>Total Due Amount</p>
          <p className="text-2xl font-bold text-white">
            {typeof displayDue === 'number'
              ? `$${displayDue.toLocaleString()}`
              : displayDue}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardStats
