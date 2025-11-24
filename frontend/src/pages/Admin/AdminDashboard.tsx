import AdminHeader from '../../Components/AdminHeader'
import '../../assets/styles/AdminDashboard.css'
import AdminDashboardStats from '../../Components/AdminDashboardStats'
import IncomeExpenseChart from '../../Components/IncomeExpenseChart'
import QuickAction from '../../Components/QuickAction'
 import AdminMemberTable from '../../Components/AdminMemberTable'


function AdminDashboard() {
  
  return (
    <div>
        <div className="adminDashboardWrapper">
        <AdminHeader />
        <AdminDashboardStats /> 
        <div className='lg:flex justify-center' style={{alignItems :"center"}}>
        <IncomeExpenseChart />
        <QuickAction />
        </div>
        <AdminMemberTable />
        </div>
    </div>
  )
}

export default AdminDashboard