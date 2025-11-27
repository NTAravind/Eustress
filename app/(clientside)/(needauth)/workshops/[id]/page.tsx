// workshops/[id]/page.tsx
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { GetWorkshopById, CheckUserRegistration } from "@/app/(clientside)/actions/workshops";
import { WorkshopDetail } from "@/app/(clientside)/components/workshopdetails";

export async function generateStaticParams() {
  // You can optionally fetch workshop IDs here for static generation
  // For now, we'll rely on dynamic rendering
  return [];
}

interface WorkshopPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkshopPage({ params }: WorkshopPageProps) {
  const session = await auth();
  const { id } = await params;
  const workshop = await GetWorkshopById(id);

  if (!workshop) {
    notFound();
  }

  let isRegistered = false;
  let userRegistration = null;

  if (session?.user?.email) {
    const registration = await CheckUserRegistration(
      session.user.email,
      id
    );
    isRegistered = !!registration;
    userRegistration = registration;
  }

  return (
    <WorkshopDetail
      workshop={workshop}
      isRegistered={isRegistered}
      userRegistration={userRegistration}
      userEmail={session?.user?.email || null}
    />
  );
}