// src/pages/Plan.tsx  (or wherever your Plan.tsx lives)
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Search, Filter, Calendar, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../config/api'; // <- adjust path if needed

// Types
interface Plan {
  _id: string;
  name: string;
  durationType: string;
  duration: number;
  amount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  message: string;
  data: Plan[];
}

interface DeleteResponse {
  message: string;
}

// API Service (uses apiRequest)
const planService = {
  getAllPlans: async (adminId: string): Promise<Plan[]> => {
    // returns data.data (where server returns { message, data: Plan[] })
    const res = await apiRequest<ApiResponse>({
      method: 'GET',
      endpoint: `/plan/getPlans/${adminId}`,
    });
    // defensive: if server returned data property or items
    return res?.data ?? [];
  },

  deletePlan: async (planId: string, userId: string, currentUser: string): Promise<DeleteResponse> => {
    const res = await apiRequest<DeleteResponse>({
      method: 'DELETE',
      endpoint: `/plan/deletePlan`,
      body: { userId, currentUser, planId },
    });
    return res;
  },
};

// (---- the rest of your components are unchanged ----)

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--secondary-100)]"></div>
  </div>
);

const EmptyState: React.FC<{ onAddPlan: () => void }> = ({ onAddPlan }) => (
  <div className="text-center py-16">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-200)] mb-4">
      <Calendar className="w-8 h-8 text-[var(--tertiary-500)]" />
    </div>
    <h3 className="text-xl font-semibold text-[var(--tertiary-500)] mb-2">No Plans Found</h3>
    <p className="text-[var(--tertiary-500)] mb-6">Get started by creating your first plan</p>
    <button
      onClick={onAddPlan}
      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--secondary-100)] text-[var(--primary-100)] rounded-lg hover:bg-[var(--secondary-200)] transition-colors font-medium"
    >
      <Plus className="w-5 h-5" />
      Create First Plan
    </button>
  </div>
);

const ErrorAlert: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div className="mb-6 p-4 bg-[var(--tertiary-100)] bg-opacity-10 border border-[var(--tertiary-100)] rounded-lg flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-[var(--tertiary-100)] flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="text-[var(--tertiary-100)] text-sm">{message}</p>
    </div>
    <button onClick={onDismiss} className="text-[var(--tertiary-100)] hover:text-[var(--tertiary-500)]">
      ×
    </button>
  </div>
);

const SuccessAlert: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => (
  <div className="mb-6 p-4 bg-[var(--tertiary-300)] bg-opacity-10 border border-[var(--tertiary-300)] rounded-lg flex items-start gap-3">
    <div className="w-5 h-5 rounded-full bg-[var(--tertiary-300)] flex items-center justify-center flex-shrink-0 mt-0.5">
      <span className="text-white text-xs">✓</span>
    </div>
    <div className="flex-1">
      <p className="text-[var(--tertiary-300)] text-sm">{message}</p>
    </div>
    <button onClick={onDismiss} className="text-[var(--tertiary-300)] hover:text-[var(--tertiary-500)]">
      ×
    </button>
  </div>
);

const SearchBar: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
}> = ({ searchTerm, onSearchChange }) => (
  <div className="relative flex-1 max-w-md">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--tertiary-500)] w-5 h-5" />
    <input
      type="text"
      placeholder="Search plans..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 bg-[var(--primary-200)] border border-[var(--primary-300)] rounded-lg text-[var(--tertiary-500)] placeholder-[var(--tertiary-500)] focus:outline-none focus:border-[var(--secondary-100)] transition-colors"
    />
  </div>
);

const FilterDropdown: React.FC<{
  selectedFilter: string;
  onFilterChange: (value: string) => void;
}> = ({ selectedFilter, onFilterChange }) => (
  <div className="relative">
    <select
      value={selectedFilter}
      onChange={(e) => onFilterChange(e.target.value)}
      className="appearance-none pl-10 pr-10 py-2.5 bg-[var(--primary-200)] border border-[var(--primary-300)] rounded-lg text-[var(--tertiary-500)] focus:outline-none focus:border-[var(--secondary-100)] transition-colors cursor-pointer"
    >
      <option value="all">All Types</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
      <option value="weekly">Weekly</option>
      <option value="daily">Daily</option>
    </select>
    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--tertiary-500)] w-5 h-5 pointer-events-none" />
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-[var(--tertiary-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

const PlanCard: React.FC<{
  plan: Plan;
  onDelete: (planId: string) => void;
  userRole: string;
}> = ({ plan, onDelete, userRole }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(plan._id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDurationText = () => {
    return `${plan.duration} ${plan.durationType}${plan.duration > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-[var(--primary-200)] border border-[var(--primary-300)] rounded-xl p-6 hover:border-[var(--secondary-100)] transition-all hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-[var(--tertiary-500)] mb-1">{plan.name}</h3>
          <p className="text-sm text-[var(--tertiary-500)] opacity-70">
            Created on {formatDate(plan.createdAt)}
          </p>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 text-[var(--tertiary-100)] hover:bg-[var(--tertiary-100)] hover:bg-opacity-10 rounded-lg transition-colors"
          title="Delete plan"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-[var(--tertiary-500)]">
          <Clock className="w-5 h-5 text-[var(--tertiary-400)]" />
          <span className="capitalize">{getDurationText()}</span>
        </div>
        <div className="flex items-center gap-3 text-[var(--tertiary-500)]">
          <DollarSign className="w-5 h-5 text-[var(--tertiary-300)]" />
          <span className="text-lg font-semibold text-[var(--secondary-100)]">
            ${plan.amount.toLocaleString()}
          </span>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--primary-200)] rounded-xl p-6 max-w-md w-full border border-[var(--primary-300)]">
            <h3 className="text-xl font-semibold text-[var(--tertiary-500)] mb-3">Confirm Delete</h3>
            <p className="text-[var(--tertiary-500)] mb-6">
              Are you sure you want to delete the plan "{plan.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-[var(--primary-300)] text-[var(--tertiary-500)] rounded-lg hover:bg-opacity-80 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-[var(--tertiary-100)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Plan: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Get user info from localStorage
  const userId = localStorage.getItem('userId') || '';
  const userRole = localStorage.getItem('role') || '';

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterPlans();
  }, [plans, searchTerm, selectedFilter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await planService.getAllPlans(userId);
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    let filtered = [...plans];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((plan) =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply duration type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(
        (plan) => plan.durationType.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    setFilteredPlans(filtered);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      setError(null);
      await planService.deletePlan(planId, userId, userRole);
      setSuccess('Plan deleted successfully');
      setPlans(plans.filter((plan) => plan._id !== planId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      // apiRequest throws {status, message, data} - handle that shape too
      setError(err?.message || (err instanceof Error ? err.message : 'Failed to delete plan'));
    }
  };

  const handleAddPlan = () => {
    // Navigate to add plan page or open modal
    console.log('Add plan clicked');
  };

  return (
    <div className="min-h-screen w-full bg-[var(--primary-100)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--tertiary-500)] mb-2">
            Membership Plans
          </h1>
          <p className="text-[var(--tertiary-500)] opacity-80">
            Manage your gym membership plans
          </p>
        </div>

        {/* Alerts */}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          <div className="flex gap-3">
            <FilterDropdown selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
            <button
              onClick={handleAddPlan}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--secondary-100)] text-[var(--primary-100)] rounded-lg hover:bg-[var(--secondary-200)] transition-colors font-medium whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Plan</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredPlans.length === 0 ? (
          plans.length === 0 ? (
            <EmptyState onAddPlan={handleAddPlan} />
          ) : (
            <div className="text-center py-12">
              <p className="text-[var(--tertiary-500)] text-lg">
                No plans found matching your search criteria
              </p>
            </div>
          )
        ) : (
          <>
            <div className="mb-4 text-[var(--tertiary-500)]">
              Showing {filteredPlans.length} of {plans.length} plans
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onDelete={handleDeletePlan}
                  userRole={userRole}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Plan;
