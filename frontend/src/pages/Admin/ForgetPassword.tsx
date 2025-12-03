import React, { useEffect, useState, ChangeEvent } from "react";
import { apiRequest } from "../../config/api";
import ToastAlert from "../../components/CustomAlert";

type FormState = {
  Id: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function ForgetPassword(): JSX.Element {
  const [form, setForm] = useState<FormState>({
    Id: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("success");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    try {
      const storedId = localStorage.getItem("userId");
      if (storedId) {
        setForm((s) => ({ ...s, Id: storedId }));
      } else {
        showToast("We couldn't find your account. Please log in.", "warning");
      }
    } catch (err) {
      console.warn("Unable to read localStorage", err);
      showToast("Couldn't access your session. Please refresh or log in again.", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const showToast = (
    text: string,
    severity: "success" | "error" | "warning" | "info" = "success"
  ) => {
    setToastText(text);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const validate = (): string | null => {
    if (!form.Id?.trim()) {
      return "We couldn't find your account. Please log in.";
    }
    if (!form.email.trim() || !form.password.trim()) {
      return "Please enter your email and a new password.";
    }
    if (form.password.length < 8) {
      return "Password must have at least 8 characters.";
    }
    if (form.password !== form.confirmPassword) {
      return "Passwords don't match — please check.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address (e.g. name@example.com).";
    }
    return null;
  };

  // Use an explicit async function for submit so errors are handled correctly
  const handleSubmit = async (): Promise<void> => {
    const err = validate();
    if (err) {
      showToast(err, "error");
      return;
    }
    setLoading(true);
    try {
      const body = {
        Id: form.Id.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      // CALL REAL API HELPER
      const res = await apiRequest<{ message?: string; data?: any }>({
        method: "PATCH",
        endpoint: "/admin/updatePassword",
        body,
      });

      showToast(res?.message || "Your password has been changed.", "success");
      setForm((s) => ({ ...s, password: "", confirmPassword: "" }));
    } catch (error: any) {
      // apiRequest throws object {status, message, data} in your implementation
      const message =
        error?.message ||
        (typeof error === "string" ? error : "Something went wrong. Please try again.");
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      // prevent default form submit behaviour from bubbling (if inside a form)
      e.preventDefault();
      void handleSubmit();
    }
  };

  const passwordStrength = () => {
    const password = form.password;
    if (password.length === 0) return 0;
    if (password.length < 8) return 1;
    let strength = 2;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const strength = passwordStrength();
  const strengthColors = ["#94A3B8", "#EC9A0E", "#F47117", "#11BF7F", "#3D8BF2"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "linear-gradient(135deg, #1E293B 0%, #364659 50%, #1E293B 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(61, 139, 242, 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "8%",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(17, 191, 127, 0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          animation: "float 10s ease-in-out infinite reverse",
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          position: "relative",
          zIndex: 1,
          animation: "slideIn 0.6s ease-out",
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg, rgba(54, 70, 89, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
            borderRadius: "24px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
            overflow: "hidden",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #3D8BF2 0%, #11BF7F 100%)",
              padding: "32px 32px 40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
                filter: "blur(30px)",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 15a2 2 0 100-4 2 2 0 000 4z" fill="white" />
                  <path d="M7 10V8a5 5 0 1110 0v2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <rect x="4" y="10" width="16" height="11" rx="2" stroke="white" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "white",
                    margin: 0,
                    letterSpacing: "-0.5px",
                  }}
                >
                  Reset Password
                </h1>
                <p style={{ margin: "6px 0 0 0", color: "rgba(255, 255, 255, 0.9)", fontSize: "14px" }}>
                  Secure your admin account
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: "32px" }}>
            <div onKeyPress={handleKeyPress}>
              {/* Email Field */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#94A3B8",
                    marginBottom: "8px",
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94A3B8",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="admin@example.com"
                    style={{
                      width: "100%",
                      padding: "14px 16px 14px 48px",
                      fontSize: "15px",
                      border: "2px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "12px",
                      background: "rgba(30, 41, 59, 0.5)",
                      color: "white",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3D8BF2")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(148, 163, 184, 0.2)")}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#94A3B8",
                    marginBottom: "8px",
                  }}
                >
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94A3B8",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={onChange}
                    placeholder="At least 8 characters"
                    style={{
                      width: "100%",
                      padding: "14px 48px 14px 48px",
                      fontSize: "15px",
                      border: "2px solid rgba(148, 163, 184, 0.2)",
                      borderRadius: "12px",
                      background: "rgba(30, 41, 59, 0.5)",
                      color: "white",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3D8BF2")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(148, 163, 184, 0.2)")}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "#94A3B8",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3l18 18M10.5 10.5A2 2 0 0113.5 13.5M9.9 4.24A9.12 9.12 0 0112 4c5 0 9 4 9 8a9.1 9.1 0 01-2.1 3.05M6.61 6.61A8.9 8.9 0 003 12c0 4 4 8 9 8a8.9 8.9 0 004.39-1.39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {form.password && (
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          style={{
                            flex: 1,
                            height: "4px",
                            borderRadius: "2px",
                            background: strength >= level ? strengthColors[strength] : "rgba(148, 163, 184, 0.2)",
                            transition: "all 0.3s ease",
                          }}
                        />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: strengthColors[strength], fontWeight: "600" }}>
                      {strengthLabels[strength]} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div style={{ marginBottom: "32px" }}>
                <label
                  htmlFor="confirmPassword"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#94A3B8",
                    marginBottom: "8px",
                  }}
                >
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94A3B8",
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={onChange}
                    placeholder="Re-enter your password"
                    style={{
                      width: "100%",
                      padding: "14px 48px 14px 48px",
                      fontSize: "15px",
                      border: `2px solid ${form.confirmPassword && form.password === form.confirmPassword ? "#11BF7F" : form.confirmPassword && form.password !== form.confirmPassword ? "#F24949" : "rgba(148, 163, 184, 0.2)"}`,
                      borderRadius: "12px",
                      background: "rgba(30, 41, 59, 0.5)",
                      color: "white",
                      outline: "none",
                      transition: "all 0.3s ease",
                      boxSizing: "border-box",
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      color: "#94A3B8",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3l18 18M10.5 10.5A2 2 0 0113.5 13.5M9.9 4.24A9.12 9.12 0 0112 4c5 0 9 4 9 8a9.1 9.1 0 01-2.1 3.05M6.61 6.61A8.9 8.9 0 003 12c0 4 4 8 9 8a8.9 8.9 0 004.39-1.39" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "12px",
                      color: "#F24949",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Passwords don't match
                  </p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "12px",
                      color: "#11BF7F",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={() => void handleSubmit()}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "white",
                  background: loading ? "#94A3B8" : "linear-gradient(135deg, #3D8BF2 0%, #11BF7F 100%)",
                  border: "none",
                  borderRadius: "12px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(61, 139, 242, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) =>
                  !loading &&
                  ((e.currentTarget.style.transform = "translateY(-2px)"),
                  (e.currentTarget.style.boxShadow = "0 6px 20px rgba(61, 139, 242, 0.4)"))
                }
                onMouseLeave={(e) =>
                  !loading &&
                  ((e.currentTarget.style.transform = "translateY(0)"),
                  (e.currentTarget.style.boxShadow = "0 4px 12px rgba(61, 139, 242, 0.3)"))
                }
              >
                {loading ? (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M7 11l5 5L22 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>Update Password</span>
                  </>
                )}
              </button>

              {/* Security Note (layman-friendly) */}
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background: "rgba(61, 139, 242, 0.1)",
                  borderLeft: "4px solid #3D8BF2",
                  borderRadius: "8px",
                }}
              >
                <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8", lineHeight: "1.6" }}>
                  <strong style={{ color: "#3D8BF2" }}>Note:</strong> We store your password safely so only you can sign in. The account ID is used behind the scenes and won't be shown.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastAlert text={toastText} open={toastOpen} onClose={() => setToastOpen(false)} severity={toastSeverity} />
    </div>
  );
}
