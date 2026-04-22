"use client"

import React from "react"
import { useToast, Toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info
} from "lucide-react"

export function Toaster() {
  const { toasts, toast: toastInstance } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-3 p-4 md:max-w-[420px] pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => toastInstance.dismiss(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [isExiting, setIsExiting] = React.useState(false)

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(onDismiss, 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success": return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "error": return <AlertCircle className="h-5 w-5 text-destructive" />
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getStyles = () => {
    switch (toast.type) {
      case "success": return "border-emerald-500/20 bg-emerald-500/5"
      case "error": return "border-destructive/20 bg-destructive/5"
      case "warning": return "border-amber-500/20 bg-amber-500/5"
      default: return "border-blue-500/20 bg-blue-500/5"
    }
  }

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-full",
        getStyles(),
        isExiting && "animate-out fade-out slide-out-to-right-full"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{getIcon()}</div>
        <div className="grid gap-1">
          {toast.title && <div className="text-sm font-bold tracking-tight">{toast.title}</div>}
          <div className="text-sm opacity-90 leading-relaxed font-medium">
            {toast.description}
          </div>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="group rounded-lg p-1.5 hover:bg-foreground/5 transition-colors"
      >
        <X size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  )
}
