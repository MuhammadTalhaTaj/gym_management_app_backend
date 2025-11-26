import AdminHeader from '../../Components/AdminHeader'
import '../../assets/styles/AdminDashboard.css'
import AdminDashboardStats from '../../Components/AdminDashboardStats'
import IncomeExpenseChart from '../../Components/IncomeExpenseChart'
import QuickAction from '../../Components/QuickAction'
 import AdminMemberTable from '../../Components/AdminMemberTable'
import { useDashboardData } from '../../hooks/useDashboardData'


function AdminDashboard() {

  const {data} = useDashboardData()
  
  return (
    <div>
        <div className="adminDashboardWrapper">
        <AdminHeader />
        <AdminDashboardStats data={data} /> 
        <div className='lg:flex justify-center' style={{alignItems :"center"}}>
        <IncomeExpenseChart data={data} />
        <QuickAction />
        </div>
        <AdminMemberTable data={data} />
        </div>
    </div>
  )
}

export default AdminDashboard