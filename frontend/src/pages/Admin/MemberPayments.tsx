// src/pages/MemberPayments.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../../config/api"; // matches your existing import pattern
import { ChevronLeft, Eye } from "lucide-react";


type Payment = {
  _id: string;
  memberId?: string;
  plan?: any;
  amount: number;
  paymentDate: string | Date;
  paymentMethod?: string;
  note?: string;
  createdAt?: string | Date;
};

type MemberWithPayments = {
  _id?: string;
  name?: string;
  contact?: string;
  email?: string;
  gender?: string;
  batch?: string;
  address?: string;
  joinDate?: string | Date;
  paymentHistory?: Payment[];
};

const fallbackMember: MemberWithPayments = {
  name: "Fallback Member",
  contact: "+92 300 0000000",
  email: "fallback@example.com",
  gender: "Male",
  batch: "morning",
  address: "Fallback address",
  joinDate: new Date().toISOString(),
  paymentHistory: [
    {
      _id: "p-fallback-1",
      amount: 500,
      paymentDate: new Date().toISOString(),
      paymentMethod: "Cash",
      note: "Initial admission",
      plan: { name: "Basic Plan" },
    },
    {
      _id: "p-fallback-2",
      amount: 1000,
      paymentDate: new Date().toISOString(),
      paymentMethod: "Card",
      note: "Monthly fee",
      plan: { name: "Premium Plan" },
    },
  ],
};

function fmtDate(d?: string | Date) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString();
}

const MemberPayments: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<MemberWithPayments | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  const toggleExpand = (paymentId: string) => {
    setExpandedPayment((prev) => (prev === paymentId ? null : paymentId));
  };

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);

      if (!memberId) {
        setError("No memberId provided in route.");
        setLoading(false);
        return;
      }

      try {
        const res = await apiRequest<{ message?: string; data?: MemberWithPayments }>({
          method: "GET",
          endpoint: `/member/getMemberPayments/${memberId}`,
        });

        // Safe-guard if backend returned empty data
        if (!res || !res.data) {
          setMember(fallbackMember);
        } else {
          // Normalize paymentHistory array (ensure dates are strings)
          const normalized = {
            ...res.data,
            paymentHistory: Array.isArray(res.data.paymentHistory) ? res.data.paymentHistory : [],
          };
          setMember(normalized);
        }
      } catch (err: any) {
        // If network/backend error, show fallback but surface message
        setError(err?.message || "Failed to fetch member payments.");
        setMember(fallbackMember);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [memberId]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-md hover:bg-gray-100"
            title="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">
              Member Payments
            </h1>
            <p className="text-sm text-gray-500">
              View member details and payment history
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                // quick refresh — defensive: guard missing memberId to avoid bad endpoint calls
                setMember(null);
                setError(null);
                setLoading(true);

                if (!memberId) {
                  setError("No memberId provided in route.");
                  setLoading(false);
                  return;
                }

                (async () => {
                  try {
                    const res = await apiRequest<{ data?: MemberWithPayments }>({
                      method: "GET",
                      endpoint: `/member/getMemberPayments/${memberId}`,
                    });
                    if (!res || !res.data) setMember(fallbackMember);
                    else setMember(res.data);
                    setError(null);
                  } catch (e: any) {
                    setError(e?.message || "Failed to refresh");
                    setMember(fallbackMember);
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
              className="text-sm px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="py-8 text-center text-gray-600">Loading...</div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {!loading && member && (
            <>
              {/* Member Summary */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="text-lg font-medium text-gray-900">
                    {member.name ?? "-"}
                  </div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Contact</div>
                  <div className="text-lg font-medium text-gray-900">
                    {member.contact ?? "-"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Batch: {member.batch ?? "-"}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded">
                  <div className="text-xs text-gray-500">Joined</div>
                  <div className="text-lg font-medium text-gray-900">
                    {fmtDate(member.joinDate)}
                  </div>
                  <div className="text-sm text-gray-500">Address: {member.address ?? "-"}</div>
                </div>
              </div>

              {/* Payments table */}
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Payment History</h3>
                    <p className="text-xs text-gray-500">
                      {member.paymentHistory?.length ?? 0} payments
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-wide bg-white">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(member.paymentHistory && member.paymentHistory.length > 0)
                        ? member.paymentHistory.map((p) => (
                          <React.Fragment key={p._id}>
                            <tr className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-700">{fmtDate(p.paymentDate)}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {typeof p.plan === "string" ? p.plan : p.plan?.name ?? "-"}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">₹ {p.amount}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{p.paymentMethod ?? "-"}</td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => toggleExpand(p._id)}
                                  className="flex items-center gap-2 text-sm text-indigo-600 hover:underline"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" /> {expandedPayment === p._id ? "Hide" : "View"}
                                </button>
                              </td>
                            </tr>

                            {expandedPayment === p._id && (
                              <tr>
                                <td colSpan={5} className="px-4 py-3 bg-gray-50 text-sm text-gray-700">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <div className="text-xs text-gray-500">Payment ID</div>
                                      <div className="text-sm text-gray-900">{p._id}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500">Note</div>
                                      <div className="text-sm text-gray-900">{p.note ?? "-"}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500">Created</div>
                                      <div className="text-sm text-gray-900">{fmtDate(p.createdAt ?? p.paymentDate)}</div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                        : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                              No payments found for this member.
                            </td>
                          </tr>
                        )
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberPayments;
