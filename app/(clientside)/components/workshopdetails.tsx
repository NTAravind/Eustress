"use client";

import { useState } from "react";
import { Workshop, Registration } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import { RegisterForWorkshop, CancelRegistration } from "@/app/(clientside)/actions/workshops";
import { useRouter } from "next/navigation";
import { useWorkshopStore } from "@/lib/store";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface WorkshopDetailProps {
  workshop: Workshop & {
    _count: {
      Registration: number;
    };
  };
  isRegistered: boolean;
  userRegistration: Registration | null;
  userEmail: string | null;
}

// Styles
const BORDER_COLOR = "border-neutral-800";
const BG_BLACK = "bg-black";
const ACCENT_RED = "text-red-600";

export function WorkshopDetail({
  workshop,
  isRegistered,
  userRegistration,
  userEmail,
}: WorkshopDetailProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "pickup">("razorpay");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const { cart, updateQuantity, addToCart, removeFromCart } = useWorkshopStore();
  const cartItem = cart[workshop.id];
  const quantity = cartItem?.quantity || 1;

  const finalPrice = workshop.price - (workshop.price * workshop.discount) / 100;
  const hasDiscount = workshop.discount > 0;
  const occupancyPercentage =
    ((workshop.totalSeats - workshop.availableSeats) / workshop.totalSeats) * 100;
  const maxQuantity = Math.min(workshop.availableSeats, 10);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (!cartItem) {
      addToCart({
        workshopId: workshop.id,
        title: workshop.title,
        price: workshop.price,
        discount: workshop.discount,
        maxSeats: maxQuantity,
      });
    }
    updateQuantity(workshop.id, newQuantity);
  };

  // ... (Keep existing payment logic: handleRazorpayPayment, handlePickupPayment, handleRegister, handleCancel) ...
    const handleRazorpayPayment = async () => {
    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: workshop.id,
          quantity,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // Initialize Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: workshop.title,
        description: `${quantity} seat${quantity > 1 ? "s" : ""} for ${workshop.title}`,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                workshopId: workshop.id,
                quantity,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            removeFromCart(workshop.id);
            setDialogOpen(false);
            alert("Payment successful! Registration completed.");
            router.refresh();
          } catch (error) {
            console.error("Payment verification error:", error);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: userEmail?.split("@")[0] || "",
          email: userEmail || "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert(error instanceof Error ? error.message : "Failed to initiate payment");
      setLoading(false);
    }
  };

  const handlePickupPayment = async () => {
    setLoading(true);
    const result = await RegisterForWorkshop(workshop.id, "pickup", quantity);
    setLoading(false);

    if (result?.success) {
      removeFromCart(workshop.id);
      setDialogOpen(false);
      alert("Registration successful! Please pay at the venue.");
      router.refresh();
    } else {
      alert(result?.error || "Registration failed");
    }
  };

  const handleRegister = async () => {
    if (!userEmail) {
      router.push(`/login?callbackUrl=/workshops/${workshop.id}`);
      return;
    }

    if (paymentMethod === "razorpay") {
      await handleRazorpayPayment();
    } else {
      await handlePickupPayment();
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your registration?")) {
      return;
    }

    setLoading(true);
    const result = await CancelRegistration(workshop.id);
    setLoading(false);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Cancellation failed");
    }
  };


  return (
    <div className={`min-h-screen ${BG_BLACK} text-white font-sans pt-20`}>
      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      {/* Header Bar */}
      <div className={`border-b ${BORDER_COLOR} bg-neutral-950`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
           <Button 
             variant="ghost" 
             onClick={() => router.back()} 
             className="text-neutral-500 hover:text-white uppercase text-xs font-bold tracking-widest pl-0"
           >
             ← Back to Programs
           </Button>
           <span className="uppercase text-[10px] font-bold tracking-[0.2em] text-red-600">Workshop Module 01</span>
        </div>
      </div>

      <div className="container mx-auto border-l border-r border-neutral-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
          
          {/* LEFT COLUMN: VISUAL & INFO */}
          <div className={`lg:col-span-8 border-b lg:border-b-0 lg:border-r ${BORDER_COLOR} flex flex-col`}>
            {/* Hero Image Block */}
            <div className={`relative h-[400px] lg:h-[500px] w-full border-b ${BORDER_COLOR} group overflow-hidden`}>
              <Image
                src={workshop.thumbnail}
                alt={workshop.title}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              {/* Status Badge Overlay */}
              <div className="absolute top-6 right-6 flex gap-2">
                {!workshop.isOpen && (
                  <span className="bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    Closed
                  </span>
                )}
                {hasDiscount && (
                   <span className="bg-white text-black px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    Save {workshop.discount}%
                  </span>
                )}
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-8 left-8 right-8">
                 <h1 className="text-4xl lg:text-6xl font-black uppercase leading-none tracking-tighter mb-2">
                  {workshop.title}
                </h1>
              </div>
            </div>

            {/* Description Block */}
            <div className="p-8 lg:p-12 flex-grow bg-black">
               <h2 className="text-xl font-bold uppercase text-red-600 mb-6 tracking-widest">Briefing</h2>
               <p className="text-lg text-neutral-300 leading-relaxed max-w-3xl">
                 {workshop.description}
               </p>

               {/* Registration Status Alert */}
               {isRegistered && userRegistration && (
                <div className="mt-12 border border-green-900 bg-green-950/20 p-6 flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="text-green-500 font-bold uppercase tracking-wide mb-2">Registration Confirmed</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-green-400/80 font-mono">
                      <p>ID: <span className="text-white">{userRegistration.id.slice(-6)}</span></p>
                      <p>Seats: <span className="text-white">{userRegistration.seats}</span></p>
                      <p>Status: <span className="text-white">{userRegistration.paymentStatus}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ACTION & DETAILS */}
          <div className="lg:col-span-4 bg-neutral-950 flex flex-col">
            
            {/* Grid Details */}
            <div className={`grid grid-rows-4 border-b ${BORDER_COLOR}`}>
              {/* Date */}
              <div className={`p-6 border-b ${BORDER_COLOR} hover:bg-neutral-900 transition-colors group`}>
                 <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Date</span>
                 </div>
                 <p className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">{formatDate(workshop.date)}</p>
              </div>

              {/* Time */}
              <div className={`p-6 border-b ${BORDER_COLOR} hover:bg-neutral-900 transition-colors group`}>
                 <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Time</span>
                 </div>
                 <p className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">{workshop.time}</p>
              </div>

              {/* Location */}
              <div className={`p-6 border-b ${BORDER_COLOR} hover:bg-neutral-900 transition-colors group`}>
                 <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Location</span>
                 </div>
                 <p className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">{workshop.location}</p>
              </div>

               {/* Capacity */}
               <div className={`p-6 hover:bg-neutral-900 transition-colors`}>
                 <div className="flex items-center gap-3 mb-2">
                    <Users className="h-4 w-4 text-red-600" />
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Capacity</span>
                 </div>
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-xl font-bold text-white">{workshop.availableSeats} Left</span>
                   <span className="text-xs text-neutral-500">of {workshop.totalSeats}</span>
                 </div>
                 <div className="w-full bg-neutral-800 h-1">
                    <div className="bg-red-600 h-1 transition-all" style={{ width: `${occupancyPercentage}%` }} />
                 </div>
              </div>
            </div>

            {/* Dynamic Pricing & Action Area */}
            <div className="p-8 flex-grow flex flex-col justify-end">
               
               {!isRegistered && userEmail && workshop.availableSeats > 0 && workshop.isOpen && (
                  <div className="mb-8">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 block mb-4">Seat Selection</label>
                    <div className="flex items-center border border-neutral-800">
                      <button onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1} className="p-4 hover:bg-neutral-800 text-white disabled:opacity-30 transition-colors border-r border-neutral-800">
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="flex-1 text-center font-mono text-xl bg-black py-3">
                        {quantity}
                      </div>
                      <button onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= maxQuantity} className="p-4 hover:bg-neutral-800 text-white disabled:opacity-30 transition-colors border-l border-neutral-800">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
               )}

               <div className="mb-8">
                 <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tight">₹{(finalPrice * quantity).toLocaleString("en-IN")}</span>
                    {hasDiscount && (
                       <span className="text-lg text-neutral-500 line-through decoration-red-600">₹{(workshop.price * quantity).toLocaleString("en-IN")}</span>
                    )}
                 </div>
                 <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">Total including taxes</p>
               </div>

               {/* Action Buttons */}
               {!userEmail ? (
                <Button 
                  className="w-full rounded-none bg-white text-black hover:bg-red-600 hover:text-white uppercase font-bold py-6 tracking-wider transition-colors" 
                  onClick={handleRegister}
                >
                  Login to Secure Spot
                </Button>
              ) : isRegistered ? (
                  <Button
                    className="w-full rounded-none border border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent uppercase font-bold py-6 tracking-wider transition-colors"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel Booking
                  </Button>
              ) : (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full rounded-none bg-red-600 text-white hover:bg-white hover:text-black uppercase font-bold py-6 tracking-wider transition-colors disabled:bg-neutral-800"
                      disabled={workshop.availableSeats === 0 || !workshop.isOpen}
                    >
                      {workshop.availableSeats === 0 ? "Sold Out" : "Proceed to Payment"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-black border border-neutral-800 text-white sm:max-w-md p-0 gap-0">
                    <DialogHeader className="p-6 border-b border-neutral-800">
                      <DialogTitle className="uppercase font-black text-xl tracking-tight">Confirm Reservation</DialogTitle>
                      <DialogDescription className="text-neutral-400">
                        {workshop.title} — {quantity} Seat(s)
                      </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={(value) => setPaymentMethod(value as "razorpay" | "pickup")}
                        className="gap-4"
                      >
                        <div className={`flex items-center space-x-4 border ${paymentMethod === 'razorpay' ? 'border-red-600 bg-neutral-900' : 'border-neutral-800'} p-4 cursor-pointer transition-colors hover:bg-neutral-900`}>
                          <RadioGroupItem value="razorpay" id="razorpay" className="border-white text-red-600" />
                          <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                            <div className="font-bold uppercase text-sm">Pay Online</div>
                            <div className="text-xs text-neutral-500">Secure via Razorpay</div>
                          </Label>
                        </div>

                        <div className={`flex items-center space-x-4 border ${paymentMethod === 'pickup' ? 'border-red-600 bg-neutral-900' : 'border-neutral-800'} p-4 cursor-pointer transition-colors hover:bg-neutral-900`}>
                          <RadioGroupItem value="pickup" id="pickup" className="border-white text-red-600" />
                          <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                            <div className="font-bold uppercase text-sm">Pay at Venue</div>
                            <div className="text-xs text-neutral-500">Cash/UPI on arrival</div>
                          </Label>
                        </div>
                      </RadioGroup>

                      <div className="flex items-start gap-3 text-amber-500 text-xs bg-amber-950/20 p-3 border border-amber-900/50">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <p>Payment is required to finalize your spot reservation.</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleRegister}
                      disabled={loading}
                      className="w-full rounded-none bg-white text-black hover:bg-red-600 hover:text-white uppercase font-bold py-6 tracking-wider transition-colors m-0"
                    >
                      {loading ? "Processing..." : "Complete Transaction"}
                    </Button>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}