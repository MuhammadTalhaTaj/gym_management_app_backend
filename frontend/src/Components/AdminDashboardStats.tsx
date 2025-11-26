import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDollarSign, faFileInvoiceDollar, faHourglassHalf, faUserPlus } from '@fortawesome/free-solid-svg-icons'
// import { useDashboardData } from '../hooks/useDashboardData'
import '../assets/styles/AdminDashboardStats.css'
import { useEffect, useState } from 'react'

function AdminDashboardStats({ data }: { data: any }) {
  // const { data } = useDashboardData()
  const [revenue, setRevenue] = useState(
    Number(localStorage.getItem("revenue")) ?? 0
  );
  const [admissions, setAdmissions] = useState(
    Number(localStorage.getItem("admissions")) ?? 0
  );
  const [expiring, setExpiring] = useState(
    Number(localStorage.getItem("expiring")) ?? 0
  );
  const [due, setDue] = useState(
    Number(localStorage.getItem("due")) ?? 0
  );

  useEffect(() => {
    if (data) {
      setRevenue(data.revenueThisMonth)
      setAdmissions(data.totalAdmissionsThisMonth)
      setDue(data.netDueAmount)
      setExpiring(data.expiringSubscriptions)

      // Save to local storage
      localStorage.setItem("revenue", data.revenueThisMonth);
      localStorage.setItem("admissions", data.totalAdmissionsThisMonth);
      localStorage.setItem("expiring", data.expiringSubscriptions);
      localStorage.setItem("due", data.netDueAmount);
    }
  }, [data])

  return (
    <div className='adminDashboardStats'>
      <div className="adminStatsCard adminStatsCard1">
        <FontAwesomeIcon className='adminStatsDollar' icon={faDollarSign} />
        <div className="adminStatsCard11">
          <p className='text-[var(--primary-300)]'>Today's Earning</p>
          <p className="text-2xl font-bold text-white">
            {typeof revenue === 'number'
              ? `$${revenue.toLocaleString()}`
              : revenue}
          </p>
        </div>
      </div>

      <div className="adminStatsCard adminStatsCard2">
        <FontAwesomeIcon className='adminStatsPlus' icon={faUserPlus} />
        <div className="adminStatsCard11">
          <p className='text-[var(--primary-300)]'>New Admissions</p>
          <p className="text-2xl font-bold text-white">{admissions}</p>
        </div>
      </div>

      <div className="adminStatsCard adminStatsCard3">
        <FontAwesomeIcon className='adminStatsHalf' icon={faHourglassHalf} />
        <div className="adminStatsCard11">
          <p className='text-[var(--primary-300)]'>
            Subscriptions Expiring
          </p>
          <p className="text-2xl font-bold text-white">{expiring}</p>
        </div>
      </div>

      <div className="adminStatsCard adminStatsCard4">
        <FontAwesomeIcon className='adminStatsInvoice' icon={faFileInvoiceDollar} />
        <div className="adminStatsCard11">
          <p className='text-[var(--primary-300)]'>Total Due Amount</p>
          <p className="text-2xl font-bold text-white">
            {typeof due === 'number'
              ? `$${due.toLocaleString()}`
              : due}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardStats
