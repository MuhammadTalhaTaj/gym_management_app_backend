import { faCashRegister, faEnvelopeOpenText, faUser, faUserPlus, 
    faCreditCard, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../assets/styles/QuickAction.css'
import { useNavigate } from "react-router-dom";

function QuickAction() {
  const navigate = useNavigate();

  return (
    <div className='quickAction'>
        <h2>Quick Actions</h2>
        <ul>
            <li>
                <a onClick={() => navigate("/addmember")}>
                    <FontAwesomeIcon className='actionUsersIcon' icon={faUserPlus} />
                    Add New Member
                </a>
            </li>

            <li>
                <a onClick={() => navigate("/addexpense")}>
                    <FontAwesomeIcon className='actionRegisterIcon' icon={faCashRegister} />
                    Add Expense
                </a>
            </li>

            <li>
                <a onClick={() => navigate("/staff")}>
                    <FontAwesomeIcon className='actionUserIcon' icon={faUser} />
                    Manage Staff
                </a>
            </li>

            <li>
                <a onClick={() => navigate("/enquiries")}>
                    <FontAwesomeIcon className='actionEnvelopeIcon' icon={faEnvelopeOpenText} />
                    View Enquiries
                </a>
            </li>

            <li>
                <a onClick={() => navigate("/addpayment")}>
                    <FontAwesomeIcon className='actionCreditIcon' icon={faCreditCard} />
                    Add Payment
                </a>
            </li>

            <li>
                <a onClick={() => navigate("/Finance")}>
                    <FontAwesomeIcon className='actionReceiptIcon' icon={faReceipt} />
                    View Finance
                </a>
            </li>
        </ul>
    </div>
  )
}

export default QuickAction
