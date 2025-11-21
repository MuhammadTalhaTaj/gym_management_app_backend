import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";


interface ToastAlertProps {
  text: string;
  open: boolean;
  onClose: () => void;
  severity?: "success" | "error" | "warning" | "info";
}

export default function ToastAlert({ text, open, onClose, severity = "success" }: ToastAlertProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}   // auto close in 3 seconds
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }} // top-right like a toast
    >
      <Alert severity={severity} onClose={onClose} sx={{ width: "100%" }}>
        {text}
      </Alert>
    </Snackbar>
  );
}
