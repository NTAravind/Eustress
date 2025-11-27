import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import WorkshopForm from "../../../components/workshopform"

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkshopPage({ params }: PageProps) {
  // Await params in Next.js 15
  const { id } = await params;

  const workshop = await prisma.workshop.findUnique({
    where: { id },
  });

  if (!workshop) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <WorkshopForm initialData={workshop} />
    </div>
  );
}