// src/components/Signup/formConfig.ts
export const formConfig = {
  title: "Create Your Gym Account",
  subtitle: "Set up your gym management system in minutes",

  fields: [
    {
      id: "adminName",
      label: "Admin Name",
      type: "text",
      placeholder: "Enter your full name",
      required: true,
      gridCol: "md:col-span-1"
    },
    {
      id: "email",
      label: "Email Address",
      type: "email",
      placeholder: "admin@example.com",
      required: true,
      gridCol: "md:col-span-1"
    },
    {
      id: "contactNumber",
      label: "Contact Number",
      type: "tel",
      placeholder: "+1 (555) 123-4567",
      required: true,
      gridCol: "md:col-span-1"
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a strong password",
      required: true,
      gridCol: "md:col-span-1"
    }
  ],

  gymFields: [
    {
      id: "gymName",
      label: "Gym Name",
      type: "text",
      placeholder: "Enter your gym name",
      required: true
    },
    {
      id: "gymAddress",
      label: "Gym Address",
      type: "textarea",
      placeholder: "Enter complete gym address",
      required: true,
      rows: 4
    }
  ],

  termsText: "I agree to the Terms of Service and Privacy Policy",
  submitButton: "Create Account",
  signInText: "Already have an account?",
  signInLink: "Sign in here"
};
