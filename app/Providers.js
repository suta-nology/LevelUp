"use client";
import { AuthProvider } from "@/lib/AuthContext";
import { AppProvider }  from "@/context/AppContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </AuthProvider>
  );
}
