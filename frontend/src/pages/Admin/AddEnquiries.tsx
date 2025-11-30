// src/pages/AddEnquiries.tsx
import React, { useState } from 'react';
import { FileText, User, Calendar } from 'lucide-react';
import { apiRequest } from '../../config/api'; // <- uses your existing apiRequest helper
import CustomAlert from '../../Components/CustomAlert';

// Data Configuration File
const formConfig = {
  title: "Add New Enquiry",
  subtitle: "Fill in the details to create a new enquiry",
  sections: [
    {
      id: "personal",
      title: "Personal Information",
      icon: "user",
      fields: [
        {
          name: "fullName",
          label: "Full Name",
          type: "text",
          placeholder: "Enter full name",
          required: true,
          gridCols: "md:col-span-1"
        },
        {
          name: "contactNumber",
          label: "Contact Number",
          type: "tel",
          placeholder: "Enter contact number",
          required: true,
          gridCols: "md:col-span-1"
        }
      ]
    },
    {
      id: "enquiry",
      title: "Enquiry Details",
      icon: "file",
      fields: [
        {
          name: "category",
          label: "Category",
          type: "select",
          placeholder: "Select category",
          required: true,
          options: [
            { value: "", label: "Select category" },
            { value: "discussion", label: "Discussion Enquiry" },
            { value: "payment", label: "Payment Issue" },
            { value: "complaint", label: "Complaint" },
            { value: "other", label: "other" }
          ],
          gridCols: "md:col-span-1"
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          placeholder: "Open",
          required: true,
          options: [
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
          ],
          gridCols: "md:col-span-1"
        },
        {
          name: "followUpDate",
          label: "Follow-up Date",
          type: "date",
          placeholder: "mm/dd/yyyy",
          required: true,
          gridCols: "md:col-span-2"
        },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          placeholder: "Enter any additional remarks or notes...",
          required: false,
          rows: 5,
          gridCols: "md:col-span-2"
        }
      ]
    }
  ],
  note: {
    text: "The system will check for duplicate enquiries based on name, contact, follow-up date, status, and category before saving.",
    icon: "info"
  },
  buttons: [
    { type: "cancel", label: "Cancel", icon: "x" },
    { type: "reset", label: "Reset", icon: "rotate" },
    { type: "submit", label: "Save Enquiry", icon: "save" }
  ]
};

// Reusable Components
const SectionHeader = ({ title, icon }: any) => {
  const IconComponent = icon === 'user' ? User : FileText;

  return (
    <div className="flex items-center gap-3 mb-6">
      <IconComponent className="w-5 h-5 text-[var(--secondary-100)]" />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  );
};

const InputField = ({ label, name, type, placeholder, required, value, onChange, error }: any) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-[var(--tertiary-500)]">
        {label} {required && <span className="text-[var(--tertiary-100)]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="bg-[var(--primary-200)] text-[var(--tertiary-500)] px-4 py-3 rounded-lg border border-transparent focus:border-[var(--secondary-100)] focus:outline-none transition-colors placeholder:text-[var(--primary-300)]"
      />
      {error && <span className="text-xs text-[var(--tertiary-100)]">{error}</span>}
    </div>
  );
};

const SelectField = ({ label, name, options, required, value, onChange, error }: any) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-[var(--tertiary-500)]">
        {label} {required && <span className="text-[var(--tertiary-100)]">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="bg-[var(--primary-200)] text-[var(--tertiary-500)] px-4 py-3 rounded-lg border border-transparent focus:border-[var(--secondary-100)] focus:outline-none transition-colors appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%238C9BB0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center'
        }}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-[var(--tertiary-100)]">{error}</span>}
    </div>
  );
};

const DateField = ({ label, name, placeholder, required, value, onChange, error }: any) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-[var(--tertiary-500)]">
        {label} {required && <span className="text-[var(--tertiary-100)]">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="date"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="bg-[var(--primary-200)] text-[var(--tertiary-500)] px-4 py-3 rounded-lg border border-transparent focus:border-[var(--secondary-100)] focus:outline-none transition-colors w-full placeholder:text-[var(--primary-300)]"
        />
        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--primary-300)] pointer-events-none" />
      </div>
      {error && <span className="text-xs text-[var(--tertiary-100)]">{error}</span>}
    </div>
  );
};

const TextAreaField = ({ label, name, placeholder, required, rows, value, onChange, error }: any) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm text-[var(--tertiary-500)]">
        {label} {required && <span className="text-[var(--tertiary-100)]">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className="bg-[var(--primary-200)] text-[var(--tertiary-500)] px-4 py-3 rounded-lg border border-transparent focus:border-[var(--secondary-100)] focus:outline-none transition-colors resize-none placeholder:text-[var(--primary-300)]"
      />
      {error && <span className="text-xs text-[var(--tertiary-100)]">{error}</span>}
    </div>
  );
};

const InfoNote = ({ text }: any) => {
  return (
    <div className="bg-[var(--tertiary-400-30)] border border-[var(--tertiary-400)] border-opacity-30 rounded-lg p-4 flex gap-3">
      <div className="flex-shrink-0">
        <div className="w-5 h-5 rounded-full bg-[var(--tertiary-400)] flex items-center justify-center">
          <span className="text-white text-xs font-bold">i</span>
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-[var(--tertiary-500)]">
          <span className="font-semibold text-white">Note:</span> {text}
        </p>
      </div>
    </div>
  );
};

const Button = ({ type, label, icon, onClick }: any) => {
  const variants: any = {
    cancel: 'bg-transparent border border-[var(--tertiary-500)] text-[var(--tertiary-500)] hover:bg-[var(--primary-200)]',
    reset: 'bg-[var(--primary-200)] text-[var(--tertiary-500)] hover:bg-opacity-80',
    submit: 'bg-gradient-to-r from-[var(--secondary-100)] to-[var(--tertiary-200)] text-white hover:opacity-90'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${variants[type]}`}
    >
      {icon === 'x' && <span className="text-lg">✕</span>}
      {icon === 'rotate' && <span className="text-lg">↻</span>}
      {icon === 'save' && <span className="text-lg">💾</span>}
      {label}
    </button>
  );
};

// Main Component
const AddEnquiries = () => {
  const [formData, setFormData] = useState<any>({
    fullName: '',
    contactNumber: '',
    category: '',
    status: 'open',
    followUpDate: '',
    remarks: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // CustomAlert state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const showToast = (text: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastText(text);
    setToastSeverity(severity);
    setToastOpen(true);
  };
  const handleToastClose = () => setToastOpen(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      contactNumber: '',
      category: '',
      status: 'open',
      followUpDate: '',
      remarks: ''
    });
    setErrors({});
  };

  const handleSubmit = async () => {
    // prevent double submit
    if (loading) return;

    // client-side validation (unchanged)
    const newErrors: any = {};

    formConfig.sections.forEach((section) => {
      section.fields.forEach((field: any) => {
        if (field.required && !formData[field.name]) {
          newErrors[field.name] = `${field.label} is required`;
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // friendly toast for laymen
      showToast('Please complete all required fields highlighted on the form.', 'warning');
      return;
    }

    // safe read of localStorage user and role
    let user: any = {};
    try {
      const raw = localStorage.getItem("user");
      user = raw ? JSON.parse(raw) : {};
    } catch {
      user = {};
    }
    const currentUser = localStorage.getItem("role");

    // Build payload including extra fields your app uses
    const payload: any = {
      name: formData.fullName,
      contact: formData.contactNumber,
      remark: formData.remarks,
      followUp: formData.followUpDate,
      category: formData.category,
      status: formData.status,
      currentUser,
      creatorId: user?.id,
      adminId: currentUser === "Admin" ? user?.id : user?.createdBy
    };

    setLoading(true);
    try {
      console.log("Payload: ", payload);

      // call backend endpoint exactly as you specified
      const res = await apiRequest({
        method: 'POST',
        endpoint: '/enquiry/addEnquiry',
        body: payload
      });

      // backend responds with { message: "...", data: newEnquiry }
      console.log('Add enquiry response:', res);

      // Friendly success message for non-tech users
      const friendly = res?.message && typeof res.message === 'string'
        ? res.message
        : 'Enquiry saved. We will follow up as scheduled.';

      showToast(friendly, 'success');

      // reset form after success
      handleReset();
    } catch (err: any) {
      console.error('Error:', err);

      // map likely backend errors to friendly text
      const status = err?.response?.status ?? err?.status ?? null;
      const backendMsg = (err?.response?.data?.message || err?.message || '').toString();

      if (status === 400) {
        if (backendMsg.includes('duplicate') || backendMsg.toLowerCase().includes('already')) {
          // duplicate enquiry
          showToast('This enquiry appears to be a duplicate. Please check the details.', 'error');
        } else if (backendMsg.includes('Provide required fields')) {
          showToast('Some required information is missing. Please check the form and try again.', 'error');
        } else {
          showToast('We could not save the enquiry. Please check your entries and try again.', 'error');
        }
      } else if (status === 401) {
        showToast('You are not allowed to perform this action. Please contact your administrator.', 'error');
      } else if (status === 404) {
        showToast('We could not find the required resource. Please try again or contact support.', 'error');
      } else if (status === 500) {
        // server error
        showToast('Something went wrong on our side. Please try again in a few minutes.', 'error');
      } else if (backendMsg.toLowerCase().includes('network') || backendMsg.toLowerCase().includes('fetch')) {
        showToast('Cannot reach the server. Please check your internet connection.', 'error');
      } else {
        // fallback generic message
        showToast('Unable to save the enquiry. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      handleReset();
    }
  };

  const renderField = (field: any) => {
    const commonProps = {
      ...field,
      value: formData[field.name],
      onChange: handleChange,
      error: errors[field.name]
    };

    switch (field.type) {
      case 'select':
        return <SelectField key={field.name} {...commonProps} />;
      case 'date':
        return <DateField key={field.name} {...commonProps} />;
      case 'textarea':
        return <TextAreaField key={field.name} {...commonProps} />;
      default:
        return <InputField key={field.name} {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--primary-200)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {formConfig.title}
          </h1>
          <p className="text-[var(--tertiary-500)]">
            {formConfig.subtitle}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--primary-100)] rounded-xl overflow-hidden shadow-2xl">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[var(--secondary-100)] to-[var(--tertiary-200)] p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Enquiry Information</h2>
                <p className="text-sm text-white text-opacity-90">
                  All fields marked with <span className="text-white font-bold">*</span> are required
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8 space-y-8">
            {formConfig.sections.map((section) => (
              <div key={section.id}>
                <SectionHeader title={section.title} icon={section.icon} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.fields.map((field: any) => (
                    <div key={field.name} className={field.gridCols}>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Info Note */}
            <InfoNote text={formConfig.note.text} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
              <Button
                type="cancel"
                label="Cancel"
                icon="x"
                onClick={handleCancel}
              />
              <Button
                type="reset"
                label="Reset"
                icon="rotate"
                onClick={handleReset}
              />
              <Button
                type="submit"
                label={loading ? 'Saving...' : 'Save Enquiry'}
                icon="save"
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CustomAlert: user-facing friendly messages */}
      <CustomAlert
        text={toastText}
        severity={toastSeverity}
        open={toastOpen}
        onClose={handleToastClose}
      />
    </div>
  );
};

export default AddEnquiries;
