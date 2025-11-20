import AdminDashboard from './pages/Admin/AdminDashboard'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminSidebar from './Components/AdminSidebar';
import Members from './pages/Admin/Members';
import AddMember from './pages/Admin/AddMember';
import Finance from './pages/Admin/Finance';
import Signup from './pages/Admin/Signup';
import Login from './pages/Admin/Login';
import AddEnquiries from './pages/Admin/AddEnquiries';
import AddPlan from './pages/Admin/AddPlan';
import MemberDetail from './pages/Admin/MemberDetail';
import AddExpense from './pages/Admin/AddExpense';
import ProtectedRoute from './Components/ProtectedRoute';
import Expense from './pages/Admin/Expense';
import AddPayment from './pages/Admin/AddPayment';
import { AuthProvider } from './context/AuthContext';
import Enquiries from './pages/Admin/Enquiries';
// import Payment from './pages/Admin/MemberPayments';
import MemberPayments from './pages/Admin/MemberPayments';
import StaffSignup from './pages/Admin/StaffSignup';


function App() {
  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/staff/signup" element={<StaffSignup />} />

        {/* Protected Admin Area */}
        <Route
          path="/*"
          element={
              <AuthProvider>
            <ProtectedRoute>
              <div className='adminMain'>
                <AdminSidebar />
                <Routes> 
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/members/:id" element={<MemberDetail />} />
                  <Route path="/addmember" element={<AddMember />} />
                  <Route path="/member/:memberId/payments" element={<MemberPayments />} />
                  <Route path="/addpayment" element={<AddPayment />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/addplan" element={<AddPlan />} />
                  <Route path="/addexpense" element={<AddExpense />} />
                  <Route path="/staff" element={<h2>Staff Page</h2>} />
                  <Route path="/expense" element={<Expense /> } />
                  <Route path="/enquiries" element={ <Enquiries /> } />
                  <Route path="/addenquiries" element={<AddEnquiries />} />
                </Routes>
              </div>
            </ProtectedRoute>
            </AuthProvider>
          }
        />

      </Routes>
    </Router>
  )
}

export default App;
