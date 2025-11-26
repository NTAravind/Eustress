import { z } from "zod";

export const workshopSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  // Coerce string input to date
  date: z.date({error: "Date is required" }),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location is required"),
  // Coerce strings to numbers for form inputs
  totalSeats: z.coerce.number().min(1, "Must have at least 1 seat"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  discount: z.coerce.number().default(0),
  thumbnail: z.string().url("Please enter a valid URL"),
  isOpen: z.boolean().default(true),
});

export type WorkshopFormValues = z.infer<typeof workshopSchema>;