import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ConfirmActionProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export function ConfirmAction({ 
  onConfirm, 
  title = "Are you absolutely sure?", 
  description = "This action cannot be undone.", 
  children,
  asChild = true 
}: ConfirmActionProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild={asChild}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => {
            e.stopPropagation(); // prevent other click events from firing if nested
            onConfirm();
          }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
