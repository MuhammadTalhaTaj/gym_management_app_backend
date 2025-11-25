// src/pages/Enquiries.tsx
import { useState, useEffect } from 'react';
import { Search, Eye, Edit2, Trash2, ChevronLeft } from 'lucide-react';
import { apiRequest } from '../../config/api';
import { NavLink } from 'react-router-dom';

interface Avatar {
  initials: any;
  name: String;
}
// Stat Card Component (unchanged)
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

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles: Record<'Open' | 'Closed', string> = {
    Open: 'bg-[var(--tertiary-300-30)] text-[var(--tertiary-300)]',
    Closed: 'bg-[var(--primary-300)] bg-opacity-30 text-[var(--tertiary-500)]'
  };
  const cls = styles[status as 'Open' | 'Closed'] || styles.Open;
  return <span className={`px-3 py-1 rounded text-xs font-medium ${cls}`}>{status}</span>;
};

// Avatar
const Avatar = ({ initials, name }: Avatar) => {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
  const firstChar = (name && name.length > 0) ? (String(name)[0]) : 'A';
  const colorIndex = firstChar.charCodeAt(0) % colors.length;
  return <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-sm font-semibold`}>{initials}</div>;
};

// Action Button
const ActionButton = ({ icon: Icon, onClick, className = '' }: any) => (
  <button onClick={onClick} className={`p-2 rounded hover:bg-[var(--primary-300)] hover:bg-opacity-20 transition-colors ${className}`}>
    <Icon className="w-4 h-4" />
  </button>
);

// Table Row (now receives edit/delete handlers)
const TableRow = ({ enquiry, onViewRemark, onEdit, onDelete }: any) => (
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
    <td className="py-4 px-4"><StatusBadge status={String(enquiry.status).charAt(0).toUpperCase() + String(enquiry.status).slice(1)} /></td>
    <td className="py-4 px-4 text-[var(--tertiary-500)] text-sm">{enquiry.followUp}</td>
    <td className="py-4 px-4 text-[var(--tertiary-500)] text-sm">{enquiry.created}</td>
    <td className="py-4 px-4">
      <div className="flex items-center gap-1">
        <ActionButton icon={Eye} className="text-[var(--tertiary-400)]" onClick={() => onViewRemark(enquiry)} />
        <ActionButton icon={Edit2} className="text-[var(--secondary-100)]" onClick={() => onEdit(enquiry)} />
        <ActionButton icon={Trash2} className="text-[var(--tertiary-100)]" onClick={() => onDelete(enquiry)} />
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
  const currentUserRole = localStorage.getItem("role"); // must be "Admin" or "Staff"

  // update modal state (for edit)
  const [updateModal, setUpdateModal] = useState<{ visible: boolean; enquiry?: any; status: string; submitting: boolean }>({
    visible: false,
    enquiry: undefined,
    status: 'open',
    submitting: false
  });

  // Fetch enquiries from API
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await apiRequest({
          method: 'GET',
          endpoint: '/enquiry/getEnquiries/' + userId,
        });
        const enquiries = res.enquiries || [];

        // normalize dates/display text if needed (keep same UI)
        // Total enquiries
        const totalEnquiries = enquiries.length;

        // Count by status (case-insensitive)
        const openStatus = enquiries.filter((e: any) => String(e.status).toLowerCase() === "open").length;

        const paymentCategory = enquiries.filter((e: any) => String(e.category).toLowerCase() === "payment").length;

        const complaints = enquiries.filter((e: any) => String(e.category).toLowerCase() === "complaint").length;

        // Update state
        setStats([
          { id: 1, icon: '📧', label: 'Total Enquiries', value: totalEnquiries },
          { id: 2, icon: '📂', label: 'Open Status', value: openStatus },
          { id: 3, icon: '💳', label: 'Payment Category', value: paymentCategory },
          { id: 4, icon: '⚠️', label: 'Complaints', value: complaints }
        ]);

        // ensure each enquiry has id/_id and created/followUp formatted for display (don't change originals)
        const mapped = enquiries.map((e: any) => ({
          ...e,
          id: e._id ?? e.id,
          created: e.createdAt ? new Date(e.createdAt).toLocaleDateString() : (e.created || ''),
          followUp: e.followUp ? new Date(e.followUp).toLocaleDateString() : (e.followUp || '')
        }));

        setEnquiries(mapped);

      } catch (err) {
        console.log(err);
        setEnquiries([]);
      }
    };

    fetchEnquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectRow = (id: any) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const handleViewRemark = (enquiry: any) => {
    setRemarkModal({ visible: true, remark: enquiry.remark, name: enquiry.name });
  };

  // Delete handler
  const handleDelete = async (enquiry: any) => {
    const ok = window.confirm(`Delete enquiry from ${enquiry.name}? This action cannot be undone.`);
    if (!ok) return;

    const id = userId;
    const enquiryId = enquiry._id ?? enquiry.id ?? enquiry.enquiryId ?? enquiryId;

    if (!id || !enquiryId) {
      alert('Missing user id or enquiry id.');
      return;
    }

    try {
      // call backend: expects { id, enquiryId, currentUser }
      await apiRequest({
        method: 'DELETE',
        endpoint: '/enquiry/deleteEnquiry',
        body: { id, enquiryId, currentUser: currentUserRole }
      });

      // remove locally
      const after = enquiries.filter(e => (e._id ?? e.id) !== (enquiry._id ?? enquiry.id));
      setEnquiries(after);

      // update stats quickly (recompute)
      const totalEnquiries = after.length;
      const openStatus = after.filter((e: any) => String(e.status).toLowerCase() === "open").length;
      const paymentCategory = after.filter((e: any) => String(e.category).toLowerCase() === "payment").length;
      const complaints = after.filter((e: any) => String(e.category).toLowerCase() === "complaint").length;
      setStats([
        { id: 1, icon: '📧', label: 'Total Enquiries', value: totalEnquiries },
        { id: 2, icon: '📂', label: 'Open Status', value: openStatus },
        { id: 3, icon: '💳', label: 'Payment Category', value: paymentCategory },
        { id: 4, icon: '⚠️', label: 'Complaints', value: complaints }
      ]);
    } catch (err: any) {
      // show simple error
      console.error('Delete failed', err);
      alert(err.message || 'Failed to delete enquiry.');
    }
  };

  // Open update modal
  const handleEdit = (enquiry: any) => {
    setUpdateModal({
      visible: true,
      enquiry,
      status: String(enquiry.status || 'open').toLowerCase(),
      submitting: false
    });
  };

  // Update submit
  const submitUpdate = async () => {
    if (!updateModal.enquiry) return;
    const enquiryId = updateModal.enquiry._id ?? updateModal.enquiry.id;
    if (!enquiryId) {
      alert('Missing enquiry id.');
      return;
    }
    const userIdLocal = userId;
    if (!userIdLocal) {
      alert('Missing user id.');
      return;
    }

    setUpdateModal(prev => ({ ...prev, submitting: true }));
    try {
      // backend expects { userId, currentUser, enquiryId, status }
      const body = {
        userId: userIdLocal,
        currentUser: currentUserRole,
        enquiryId,
        status: String(updateModal.status).toLowerCase()
      };

      const res = await apiRequest({
        method: 'PATCH',
        endpoint: '/enquiry/updateEnquiry',
        body
      });

      // update local list - backend returns updated enquiry in res.enquiry
      const updated = res?.enquiry;
      setEnquiries(prev => prev.map(e => {
        const eid = e._id ?? e.id;
        const updatedId = updated ? (updated._id ?? updated.id) : enquiryId;
        if (String(eid) === String(updatedId)) {
          // keep existing objects but update status and updatedAt fields
          return {
            ...e,
            status: updated?.status ?? updateModal.status,
            updatedAt: updated?.updatedAt ?? e.updatedAt
          };
        }
        return e;
      }));

      // recompute stats
      const after = enquiries.map(e => {
        const eid = e._id ?? e.id;
        if (String(eid) === String(enquiryId)) {
          return { ...e, status: String(updateModal.status).toLowerCase() };
        }
        return e;
      });
      const totalEnquiries = after.length;
      const openStatus = after.filter((e: any) => String(e.status).toLowerCase() === "open").length;
      const paymentCategory = after.filter((e: any) => String(e.category).toLowerCase() === "payment").length;
      const complaints = after.filter((e: any) => String(e.category).toLowerCase() === "complaint").length;
      setStats([
        { id: 1, icon: '📧', label: 'Total Enquiries', value: totalEnquiries },
        { id: 2, icon: '📂', label: 'Open Status', value: openStatus },
        { id: 3, icon: '💳', label: 'Payment Category', value: paymentCategory },
        { id: 4, icon: '⚠️', label: 'Complaints', value: complaints }
      ]);

      setUpdateModal({ visible: false, enquiry: undefined, status: 'open', submitting: false });
    } catch (err: any) {
      console.error('Update failed', err);
      alert(err.message || 'Failed to update enquiry.');
      setUpdateModal(prev => ({ ...prev, submitting: false }));
    }
  };

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch =
      (enquiry.name && enquiry.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (enquiry.email && enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All Status' ||
      (enquiry.status && String(enquiry.status).toLowerCase() === statusFilter.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All Categories' ||
      (enquiry.category && String(enquiry.category).toLowerCase() === categoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen w-full bg-[var(--primary-200)] p-4 md:p-6 lg:p-8">
      <div className="enquiriesHeader flex justify-between mb-4 mt-1.5">
        <h1 className='text-2xl text-[var(--primary-300)]'>Enquiries</h1>
        <NavLink to={'/addenquiries'} className='text-[var(--secondary-100)] rounded-lg p-2 bg-[var(--secondary-200)]'>Add Enquiries</NavLink>
      </div>
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
                    onEdit={handleEdit}
                    onDelete={handleDelete}
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
                      <StatusBadge status={String(enquiry.status).charAt(0).toUpperCase() + String(enquiry.status).slice(1)} />
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
                    <ActionButton icon={Edit2} className="text-[var(--secondary-100)]" onClick={() => handleEdit(enquiry)} />
                    <ActionButton icon={Trash2} className="text-[var(--tertiary-100)]" onClick={() => handleDelete(enquiry)} />
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

      {/* Update Modal (Edit) - color scheme same as other modals */}
      {updateModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--primary-200)] p-6 rounded-lg max-w-md w-full">
            <h2 className="text-white font-bold mb-4">Update Enquiry</h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Name</label>
                <div className="text-white p-2 rounded bg-[var(--primary-100)] border border-[var(--primary-300)]">{updateModal.enquiry?.name}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Status</label>
                <select
                  value={updateModal.status}
                  onChange={(e) => setUpdateModal(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[var(--primary-300)] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white cursor-pointer"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* You mentioned only status update is required on backend - keep form minimal */}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setUpdateModal({ visible: false, enquiry: undefined, status: 'open', submitting: false })}
                  className="px-4 py-2 rounded bg-transparent border border-[var(--primary-300)] text-white hover:bg-[var(--primary-300)] hover:bg-opacity-20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitUpdate}
                  disabled={updateModal.submitting}
                  className="px-4 py-2 rounded bg-[var(--primary-100)] text-white hover:bg-[var(--primary-300)] hover:bg-opacity-20 transition-colors"
                >
                  {updateModal.submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
