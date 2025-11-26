"use client";

import { useActionState, startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { Workshop } from "@/app/generated/prisma";
import Image from "next/image";

import { upsertWorkshop, ActionState } from "../actions/workshop";
import { WorkshopFormValues, workshopSchema } from "@/lib/validations/workshop";
import { cn } from "@/lib/utils";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkshopFormProps {
  initialData?: Workshop | null;
}

const initialState: ActionState = {
  message: "",
  status: "idle",
};

export default function WorkshopForm({ initialData }: WorkshopFormProps) {
  const [state, action, isPending] = useActionState(upsertWorkshop, initialState);
  const [uploading, setUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail || "");

  const form = useForm<WorkshopFormValues>({
   
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      date: initialData?.date ? new Date(initialData.date) : undefined,
      time: initialData?.time || "10:00",
      location: initialData?.location || "",
      totalSeats: initialData?.totalSeats || 10,
      price: initialData?.price || 0,
      discount: initialData?.discount || 0,
      thumbnail: initialData?.thumbnail || "",
      isOpen: initialData?.isOpen ?? true,
    },
  });

  const uploadToGitHub = async (file: File) => {
    setUploading(true);
    try {
      const extension = file.name.split('.').pop();
      const filename = `${Date.now()}-workshop.${extension}`.toLowerCase();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          content: base64,
          message: `Add workshop image: ${filename}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const { cdnUrl } = await response.json();
      setThumbnailUrl(cdnUrl);
      form.setValue('thumbnail', cdnUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2MB');
      return;
    }
    uploadToGitHub(file);
  };

  function onSubmit(values: WorkshopFormValues) {
    const formData = new FormData();

    // Append ID if editing
    if (initialData?.id) {
      formData.append("id", initialData.id);
    }

    // Append all fields manually to ensure correct format for Server Action
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("date", values.date.toISOString());
    formData.append("time", values.time);
    formData.append("location", values.location);
    formData.append("totalSeats", values.totalSeats.toString());
    formData.append("price", values.price.toString());
    formData.append("discount", values.discount.toString());
    formData.append("thumbnail", thumbnailUrl || values.thumbnail);
    formData.append("isOpen", String(values.isOpen));

    startTransition(() => {
      action(formData);
    });
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Workshop" : "Create Workshop"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Workshop title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Details about the workshop..." 
                          rows={6}
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date Picker */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time */}
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City or Venue" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pricing & Seats */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="totalSeats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Seats</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right Column - Thumbnail Upload & Settings */}
              <div className="space-y-6">
                {/* Thumbnail Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ImageIcon className="w-5 h-5" />
                      Workshop Thumbnail *
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      {thumbnailUrl ? (
                        <div className="space-y-3">
                          <Image 
                            src={thumbnailUrl} 
                            alt="Workshop thumbnail" 
                            width={200} 
                            height={200} 
                            className="mx-auto rounded-lg object-cover shadow-md"
                            unoptimized 
                          />
                          <div className="flex gap-2 justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setThumbnailUrl("");
                                form.setValue('thumbnail', "");
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                            <label className="cursor-pointer">
                              <Button type="button" variant="outline" size="sm" asChild>
                                <span>
                                  <Upload className="w-4 h-4 mr-1" />
                                  Replace
                                </span>
                              </Button>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-12 h-12 mx-auto text-gray-400" />
                          <div>
                            <label className="cursor-pointer">
                              <span className="text-blue-600 hover:text-blue-500 font-medium">
                                Click to upload image
                              </span>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                              />
                            </label>
                          </div>
                          <p className="text-sm text-gray-500">PNG, JPG up to 2MB</p>
                        </div>
                      )}
                      {uploading && (
                        <div className="flex items-center justify-center space-x-2 mt-4">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          <span className="text-blue-600 text-sm">Uploading...</span>
                        </div>
                      )}
                    </div>
                    {!thumbnailUrl && (
                      <p className="text-sm text-amber-600 mt-2 flex items-center">
                        <Upload className="w-4 h-4 mr-1" />
                        Image required before saving
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Is Open Switch */}
                <FormField
                  control={form.control}
                  name="isOpen"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Registration Open</FormLabel>
                        <FormDescription>
                          Allow users to register for this workshop.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Server Error Message */}
            {state.status === "error" && (
              <div className="p-3 rounded-md bg-red-50 text-red-800 border border-red-200">
                ❌ {state.message}
              </div>
            )}

            {state.status === "success" && (
              <div className="p-3 rounded-md bg-green-50 text-green-800 border border-green-200">
                ✅ Workshop saved successfully!
              </div>
            )}

            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={isPending || uploading || !thumbnailUrl}
                className="min-w-[140px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  initialData ? 'Update Workshop' : 'Create Workshop'
                )}
              </Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}