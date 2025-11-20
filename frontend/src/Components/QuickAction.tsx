import { faCashRegister, faEnvelopeOpenText, faUser, faUserPlus, 
    // faUsers, 
    faCreditCard, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../assets/styles/QuickAction.css'

function QuickAction() {
  return (
    <div className='quickAction'>
        <h2>Quick Actions</h2>
        <ul>
            <li><a href="">
                <FontAwesomeIcon className='actionUsersIcon' icon={faUserPlus} />Add New Member
                </a></li>
            <li><a href="">
                <FontAwesomeIcon className='actionRegisterIcon' icon={faCashRegister} />Add Income/Expense
                </a></li>
            <li><a href="">
                <FontAwesomeIcon className='actionUserIcon' icon={faUser} />Manage Staff
                </a></li>
            <li><a href="">
                <FontAwesomeIcon className='actionEnvelopeIcon' icon={faEnvelopeOpenText} />View Enquiries
                </a></li>
            <li><a href="">
                <FontAwesomeIcon className='actionCreditIcon' icon={faCreditCard} />Manage Payment
                </a></li>
            <li><a href="">
                <FontAwesomeIcon className='actionReceiptIcon' icon={faReceipt} />View Payment
                </a></li>
        </ul>
    </div>
  )
}

export default QuickAction
