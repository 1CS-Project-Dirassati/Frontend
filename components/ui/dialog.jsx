"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js";
import { useSelector } from "react-redux";

import apiCall from "../utils/apiCall"

import { cn } from "@/lib/utils"

const stripePromise = loadStripe("pk_test_51P2fsNCTNOiewRNODTiUb0TDBIGC1NaXNg2Go8IU72GTtnk63efHLef8gAm0eveEaHOlIUaElwYClMtBCkPTuQ0000u0knkOh8");

function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}) {
  return (
    (<DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
        className
      )}
      {...props} />)
  );
}

function DialogContent({
  className,
  children,
  ...props
}) {
  const token = useSelector((state) => state.auth.accessToken);

  const handlePayment = async () => {
    if (!token) {
      alert("You are not authenticated. Please log in.");
      return;
    }

    try {
      const response = await apiCall(
        "/payment/create-checkout-session",
        "POST",
        { fee_id: 1 }, // Replace with the actual fee_id
        token
      );

      if (response.sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${response.sessionId}`;
      } else {
        alert("Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("An error occurred while creating the checkout session. Please try again.");
    }
  };

  return (
    (<DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}>
        <div className="space-y-4">
          {/* Montant Section */}
          <div>
            <label className="text-sm text-slate-600 mb-1 block">
              Montant
            </label>
            <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-700">
              50.00 USD
            </div>
          </div>

          {/* Pay Button */}
          <div className="mt-4">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              type="button"
              onClick={handlePayment}>
              Paye Maintenant
            </button>
          </div>
        </div>
        <DialogPrimitive.Close
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>)
  );
}

function DialogHeader({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props} />)
  );
}

function DialogFooter({
  className,
  ...props
}) {
  return (
    (<div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props} />)
  );
}

function DialogTitle({
  className,
  ...props
}) {
  return (
    (<DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props} />)
  );
}

function DialogDescription({
  className,
  ...props
}) {
  return (
    (<DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />)
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
