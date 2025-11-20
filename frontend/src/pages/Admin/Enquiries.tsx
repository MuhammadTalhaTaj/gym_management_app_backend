// src/pages/Enquiries.tsx
import { useState, useEffect } from 'react';
import { Search, Eye, Edit2, Trash2, ChevronLeft } from 'lucide-react';
import { apiRequest } from '../../config/api';

interface Avatar {
  initials: any;
  name: String;
}
// Fallback data
const dashboardData = {
  stats: [
    { id: 1, icon: '📧', label: 'Total Enquiries', value: 248, change: '+12%', changePositive: true },
    { id: 2, icon: '📂', label: 'Open Status', value: 156, count: 156 },
    { id: 3, icon: '💳', label: 'Payment Category', value: 42, count: 42 },
    { id: 4, icon: '⚠️', label: 'Complaints', value: 18, count: 18 }
  ],
  enquiries: [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      contact: '+1 234 567 8900',
      category: 'Payment',
      status: 'Open',
      followUp: 'Jan 25, 2024',
      created: 'Jan 20, 2024',
      avatar: 'SJ',
      remark: 'Follow up on payment.'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'm.chen@email.com',
      contact: '+1 234 567 8901',
      category: 'Discussion',
      status: 'Open',
      followUp: 'Jan 26, 2024',
      created: 'Jan 19, 2024',
      avatar: 'MC',
      remark: 'Interested in new features.'
    }
  ]
};

// Stat Card Component
const StatCard = ({ icon, label, value, change, changePositive, count }: any) => (
  <div className="bg-[var(--primary-100)] rounded-lg p-6 relative overflow-hidden">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-lg bg-[var(--primary-300)] bg-opacity-20 flex items-center justify-center text-2xl">{icon}</div>
      {change && <span className={`text-sm font-medium ${changePositive ? 'text-[var(--tertiary-300)]' : 'text-[var(--tertiary-100)]'}`}>{change}</span>}
      {count && <span className="text-sm font-medium text-[var(--tertiary-400)]">{count}</span>}
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-[var(--tertiary-500)]">{label}</div>
  </div>
);

interface CategoryBadgeProps {
  category: 'Payment' | 'Discussion' | 'Complaint' | 'Other' | string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const styles: Record<'Payment' | 'Discussion' | 'Complaint' | 'Other', string> = {
    Payment: 'bg-[var(--secondary-200)] text-[var(--secondary-100)]',
    Discussion: 'bg-[var(--tertiary-400-30)] text-[var(--tertiary-400)]',
    Complaint: 'bg-[var(--tertiary-100-30)] text-[var(--tertiary-100)]',
    Other: 'bg-[var(--tertiary-200-30)] text-[var(--tertiary-200)]'
  };

  const cls = styles[category as keyof typeof styles] || styles.Other;

  return <span className={`px-3 py-1 rounded text-xs font-medium ${cls}`}>{category}</span>;
};

interface StatusBadgeProps {
  status: 'Open' | 'Closed' | string; // allow string for fallback
}

// Status Badge
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles: Record<'Open' | 'Closed', string> = {
    Open: 'bg-[var(--tertiary-300-30)] text-[var(--tertiary-300)]',
    Closed: 'bg-[var(--primary-300)] bg-opacity-30 text-[var(--tertiary-500)]'
  };
  // fallback to Open style if unknown
  const cls = styles[status as 'Open' | 'Closed'] || styles.Open;
  return <span className={`px-3 py-1 rounded text-xs font-medium ${cls}`}>{status}</span>;
};


// Avatar
const Avatar = ({ initials, name }: Avatar) => {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
  const firstChar = (name && name.length > 0) ? name[0] : 'A';
  const colorIndex = firstChar.charCodeAt(0) % colors.length;
  return <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-sm font-semibold`}>{initials}</div>;
};

// Action Button
const ActionButton = ({ icon: Icon, onClick, className = '' }: any) => (
  <button onClick={onClick} className={`p-2 rounded hover:bg-[var(--primary-300)] hover:bg-opacity-20 transition-colors ${className}`}>
    <Icon className="w-4 h-4" />
  </button>
);

// Table Row
const TableRow = ({ enquiry, onViewRemark }: any) => (
  <tr className="border-b border-[var(--primary-300)] border-opacity-20 hover:bg-[var(--tertiary-400-30)] hover:bg-opacity-10 transition-colors">
    <td className="py-4 px-4">
      <div className="flex items-center gap-3">
        <Avatar initials={enquiry.avatar} name={enquiry.name} />
        <div>
          <div className="text-white font-medium text-sm">{enquiry.name}</div>
          <div className="text-[var(--tertiary-500)] text-xs">{enquiry.email}</div>
        </div>
      </div>
    </td>
    <td className="py-4 px-4 text-[var(--tertiary-500)] text-sm">{enquiry.contact}</td>
    <td className="py-4 px-4"><CategoryBadge category={enquiry.category} /></td>
    <td className="py-4 px-4"><StatusBadge status={enquiry.status} /></td>
    <td className="py-4 px-4 text-[var(--tertiary-500)] text-sm">{enquiry.followUp}</td>
    <td className="py-4 px-4 text-[var(--tertiary-500)] text-sm">{enquiry.created}</td>
    <td className="py-4 px-4">
      <div className="flex items-center gap-1">
        <ActionButton icon={Eye} className="text-[var(--tertiary-400)]" onClick={() => onViewRemark(enquiry)} />
        <ActionButton icon={Edit2} className="text-[var(--secondary-100)]" />
        <ActionButton icon={Trash2} className="text-[var(--tertiary-100)]" />
      </div>
    </td>
  </tr>
);

const Enquiries = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [remarkModal, setRemarkModal] = useState({ visible: false, remark: '', name: '' });
  const [stats, setStats] = useState([
    { id: 1, icon: '📧', label: 'Total Enquiries', value: 0 },
    { id: 2, icon: '📂', label: 'Open Status', value: 0 },
    { id: 3, icon: '💳', label: 'Payment Category', value: 0 },
    { id: 4, icon: '⚠️', label: 'Complaints', value: 0 }
  ]);
  const userId = localStorage.getItem("userId");
  // Fetch enquiries from API
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await apiRequest({
          method: 'GET',
          endpoint: '/enquiry/getEnquiries/' + userId,
        });
        console.log("Response: ", res)
        const enquiries = res.enquiries;

        // Total enquiries
        const totalEnquiries = enquiries.length;

        // Count by status
        const openStatus = enquiries.filter((e: any) => e.status === "open").length;

        const paymentCategory = enquiries.filter((e: any) => e.category === "payment").length;

        const complaints = enquiries.filter((e: any) => e.category === "complaint").length;

        // Update state
        setStats([
          { id: 1, icon: '📧', label: 'Total Enquiries', value: totalEnquiries },
          { id: 2, icon: '📂', label: 'Open Status', value: openStatus },
          { id: 3, icon: '💳', label: 'Payment Category', value: paymentCategory },
          { id: 4, icon: '⚠️', label: 'Complaints', value: complaints }
        ]);

        setEnquiries(enquiries);

      } catch (err) {
        console.log(err);
        setEnquiries([]);
      }
    };

    fetchEnquiries();
  }, []);


  const handleSelectRow = (id: any) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const handleViewRemark = (enquiry: any) => {
    setRemarkModal({ visible: true, remark: enquiry.remark, name: enquiry.name });
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enquiry.email && enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All Status' ||
      (enquiry.status && enquiry.status.toLowerCase() === statusFilter.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All Categories' ||
      (enquiry.category && enquiry.category.toLowerCase() === categoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });


  return (
    <div className="min-h-screen w-full bg-[var(--primary-200)] p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
        </div>

        <div className="bg-[var(--primary-100)] rounded-lg overflow-hidden">
          <div className="p-4 md:p-6 border-b border-[var(--primary-300)] border-opacity-20">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--tertiary-500)]" />
                <input
                  type="text"
                  placeholder="Search by name, email or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--primary-100)] text-white placeholder-[var(--tertiary-500)] pl-10 pr-4 py-3 rounded-lg border border-[var(--primary-300)] border-opacity-20 focus:outline-none focus:border-[var(--tertiary-400)] focus:border-opacity-50 transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[var(--primary-100)] text-white px-4 py-3 rounded-lg border border-[var(--primary-300)] border-opacity-20 focus:outline-none focus:border-[var(--tertiary-400)] focus:border-opacity-50 transition-colors">
                  <option>All Status</option>
                  <option>Open</option>
                  <option>Closed</option>
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-[var(--primary-100)] text-white px-4 py-3 rounded-lg border border-[var(--primary-300)] border-opacity-20 focus:outline-none focus:border-[var(--tertiary-400)] focus:border-opacity-50 transition-colors">
                  <option>All Categories</option>
                  <option>Payment</option>
                  <option>Discussion</option>
                  <option>Complaint</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--primary-300)] border-opacity-20">
                  <th className="py-4 px-4 text-left text-[var(--tertiary-500)] text-xs font-semibold uppercase tracking-wider">Name</th>
                  <th className="py-4 px-4 text-left text-[var(--tertiary-500)] text-xs font-semibold uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-4 text-left text-[var(--tertiary-500)] text-xs font-semibold uppercase tracking-wider">Category</th>
                  <th className="py-4 px-4 text-left text-[var(--tertiary-500)] text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-4 px-4 text-left text-[var(--tertiary-500)] text-xs font-semibold uppercase tracking-wider">Follow Up</th>
                  <th className="py-4 px-4 text-left text-[var(--tertiary-500)] text-xs font-semibold uppercase tracking-wider">Created</th>
                  <th className="py-4 px-4 text-left text-[var(--tertiary-500)] text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map(enquiry => (
                  <TableRow
                    key={enquiry.id}
                    enquiry={enquiry}
                    isSelected={selectedRows.includes(enquiry.id)}
                    onSelect={() => handleSelectRow(enquiry.id)}
                    onViewRemark={handleViewRemark}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {filteredEnquiries.map(enquiry => (
              <div key={enquiry.id} className="p-4 border-b border-[var(--primary-300)] border-opacity-20">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar initials={enquiry.avatar} name={enquiry.name} />
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm mb-1">{enquiry.name}</div>
                    <div className="text-[var(--tertiary-500)] text-xs mb-2">{enquiry.email}</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <CategoryBadge category={enquiry.category} />
                      <StatusBadge status={enquiry.status} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3 ml-11">
                  <div>
                    <span className="text-[var(--tertiary-500)]">Contact:</span>
                    <div className="text-white">{enquiry.contact}</div>
                  </div>
                  <div>
                    <span className="text-[var(--tertiary-500)]">Follow Up:</span>
                    <div className="text-white">{enquiry.followUp}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between ml-11">
                  <div className="text-[var(--tertiary-500)] text-xs">
                    Created: {enquiry.created}
                  </div>
                  <div className="flex items-center gap-1">
                    <ActionButton icon={Eye} className="text-[var(--tertiary-400)]" onClick={() => handleViewRemark(enquiry)} />
                    <ActionButton icon={Edit2} className="text-[var(--secondary-100)]" />
                    <ActionButton icon={Trash2} className="text-[var(--tertiary-100)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--primary-300)] border-opacity-20">
            <div className="text-[var(--tertiary-500)] text-sm">
              Showing 1 to {filteredEnquiries.length} of {enquiries.length} entries
            </div>
            <button className="bg-[var(--primary-100)] text-white p-2 rounded-lg hover:bg-[var(--primary-300)] hover:bg-opacity-20 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Remark Modal */}
      {remarkModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--primary-200)] p-6 rounded-lg max-w-md w-full">
            <h2 className="text-white font-bold mb-2">{remarkModal.name}'s Remark</h2>
            <p className="text-[var(--tertiary-500)] mb-4">{remarkModal.remark || 'No remark available.'}</p>
            <button
              className="bg-[var(--primary-100)] text-white px-4 py-2 rounded hover:bg-[var(--primary-300)] hover:bg-opacity-20 transition-colors"
              onClick={() => setRemarkModal({ visible: false, remark: '', name: '' })}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
