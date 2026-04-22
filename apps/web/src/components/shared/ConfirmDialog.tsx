"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Info, HelpCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export type ConfirmType = "info" | "warning" | "danger" | "question"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  type?: ConfirmType
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "info",
  isLoading = false,
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (type) {
      case "danger":
        return <AlertCircle className="h-6 w-6 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />
      case "question":
        return <HelpCircle className="h-6 w-6 text-primary" />
      default:
        return <Info className="h-6 w-6 text-blue-500" />
    }
  }

  const getConfirmButtonStyles = () => {
    switch (type) {
      case "danger":
        return "bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold"
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-white font-bold"
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-full flex items-center justify-center shrink-0",
              type === "danger" ? "bg-destructive/10" : 
              type === "warning" ? "bg-amber-500/10" : 
              "bg-primary/10"
            )}>
              {getIcon()}
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
          
          <DialogFooter className="gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                onCancel?.()
              }}
              className="px-6 h-11 font-bold border-border/60 hover:bg-muted transition-all"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={() => {
                onConfirm()
              }}
              className={cn("px-8 h-11 shadow-lg transition-all", getConfirmButtonStyles())}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </span>
              ) : (
                confirmText
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
