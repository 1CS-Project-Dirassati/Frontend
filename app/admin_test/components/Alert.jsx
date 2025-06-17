"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback(({ type, message }) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 3000);
  }, []);

  const dismissAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            type={alert.type}
            message={alert.message}
            onDismiss={() => dismissAlert(alert.id)}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

function Alert({ type, message, onDismiss }) {
  const isSuccess = type === "success";
  return (
    <Card
      className={cn(
        "flex items-center p-4 shadow-lg animate-slide-in-right",
        isSuccess
          ? "border-[#0771CB] bg-[#F5F5F5] text-text"
          : "border-[#EA5455] bg-[#F5F5F5] text-text"
      )}
      style={{ minWidth: "200px", maxWidth: "300px" }}
    >
      {isSuccess ? (
        <Check className="w-5 h-5 mr-2 text-[#0771CB]" />
      ) : (
        <X className="w-5 h-5 mr-2 text-[#EA5455]" />
      )}
      <span className="flex-1 text-sm">{message}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDismiss}
        className="ml-2 text-text-muted hover:text-text"
      >
        <X className="w-4 h-4" />
      </Button>
    </Card>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
