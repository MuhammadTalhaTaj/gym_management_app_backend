// src/pages/Admin/Signup.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin } from "lucide-react";
import { apiRequest } from "../../config/api";
import { formConfig } from "../../../Signup/FormConfig";

import FormInput from "../../../Signup/FormInput";
import PasswordInput from "../../../Signup/PasswordInput";
import TextArea from "../../../Signup/TextArea";
import Checkbox from "../../../Signup/Checkbox";
import Button from "../../../Signup/Button";
import Divider from "../../../Signup/Divider";
import GymIcon from "../../../Signup/GymIcon";
import SectionHeader from "../../../Signup/SectionHeader";

const initialForm = {
  adminName: "",
  email: "",
  contactNumber: "",
  password: "",
  gymName: "",
  gymAddress: "",
  agreeToTerms: false,
};

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ ...initialForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (formMessage) setFormMessage(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.adminName.trim()) newErrors.adminName = "Admin name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!formData.gymName.trim()) newErrors.gymName = "Gym name is required";
    if (!formData.gymAddress.trim()) newErrors.gymAddress = "Gym address is required";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setFormMessage(null);
    setErrors({});

    const payload = {
      name: formData.adminName,
      email: formData.email,
      contact: formData.contactNumber,
      password: formData.password,
      gymName: formData.gymName,
      gymLocation: formData.gymAddress,
    };

    try {
      const res = await apiRequest({
        method: "POST",
        endpoint: "/auth/signup",
        body: payload,
      });

      setFormMessage("Account created successfully.");
      setFormData({ ...initialForm });
      // show message briefly then navigate
      setTimeout(() => navigate("/Dashboard"), 1800);
      console.log("signup success:", res);
    } catch (err: any) {
      const msg = err?.message ?? err?.response?.data?.message ?? "Signup failed";
      const newErrors: Record<string, string> = {};
      if (typeof msg === "string") {
        const lower = msg.toLowerCase();
        if (lower.includes("email")) newErrors.email = msg;
        else if (lower.includes("contact") || lower.includes("phone")) newErrors.contactNumber = msg;
        else if (lower.includes("gym")) newErrors.gymName = msg;
        else setFormMessage(msg);
      } else {
        setFormMessage("Signup failed");
      }
      setErrors((prev) => ({ ...prev, ...newErrors }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--primary-200)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl">
        <div className="bg-[var(--primary-100)] rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
          <GymIcon />

          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2">
            {formConfig.title}
          </h1>
          <p className="text-[var(--primary-300)] text-center text-sm sm:text-base mb-8">
            {formConfig.subtitle}
          </p>

          {formMessage && (
            <div className="mb-4 text-center">
              <p className="text-sm text-white">{formMessage}</p>
            </div>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {formConfig.fields.map((field: any) => {
                if (field.type === "password") {
                  return (
                    <PasswordInput
                      key={field.id}
                      name={field.id}
                      label={field.label}
                      placeholder={field.placeholder}
                      value={formData[field.id as keyof typeof formData]}
                      onChange={handleChange}
                      required={field.required}
                      error={errors[field.id]}
                      gridCol={field.gridCol}
                    />
                  );
                }

                const IconComp = field.icon ?? undefined;

                return (
                  <FormInput
                    key={field.id}
                    name={field.id}
                    type={field.type}
                    label={field.label}
                    placeholder={field.placeholder}
                    icon={IconComp}
                    value={formData[field.id as keyof typeof formData]}
                    onChange={handleChange}
                    required={field.required}
                    error={errors[field.id]}
                    gridCol={field.gridCol}
                  />
                );
              })}
            </div>

            <Divider />

            <SectionHeader icon={MapPin} title="Gym Information" />

            <div className="space-y-5">
              {formConfig.gymFields.map((field: any) => {
                if (field.type === "textarea") {
                  return (
                    <TextArea
                      key={field.id}
                      name={field.id}
                      label={field.label}
                      placeholder={field.placeholder}
                      icon={MapPin}
                      value={formData[field.id as keyof typeof formData]}
                      onChange={handleChange}
                      required={field.required}
                      rows={field.rows}
                      error={errors[field.id]}
                    />
                  );
                }

                return (
                  <FormInput
                    key={field.id}
                    name={field.id}
                    type={field.type}
                    label={field.label}
                    placeholder={field.placeholder}
                    icon={() => (
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6.5 6.5v11" />
                        <path d="M17.5 6.5v11" />
                        <path d="M3 10v4" />
                        <path d="M21 10v4" />
                        <path d="M6.5 12h11" />
                        <path d="M3 12h3.5" />
                        <path d="M17.5 12H21" />
                      </svg>
                    )}
                    value={formData[field.id as keyof typeof formData]}
                    onChange={handleChange}
                    required={field.required}
                    error={errors[field.id]}
                  />
                );
              })}
            </div>

            <Checkbox
              label={formConfig.termsText}
              checked={formData.agreeToTerms}
              onChange={(e: any) =>
                handleChange({
                  target: { name: "agreeToTerms", type: "checkbox", checked: e.target.checked },
                })
              }
              error={errors.agreeToTerms}
            />

            <Button onClick={handleSubmit} icon={User} disabled={loading}>
              {loading ? "Creating account..." : formConfig.submitButton}
            </Button>

            <p className="text-center text-[var(--primary-300)] text-sm pt-4">
              {formConfig.signInText}{" "}
              <a
                href="#"
                className="text-[var(--secondary-100)] hover:underline font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                {formConfig.signInLink}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
