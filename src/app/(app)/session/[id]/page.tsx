import { redirect, notFound } from "next/navigation";
import { getSessionWithTrades, getUserRulesForSession } from "./actions";
import { ActiveSession } from "@/components/session/active-session";

interface ActiveSessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function ActiveSessionPage({ params }: ActiveSessionPageProps) {
  const { id } = await params;

  const { data, error } = await getSessionWithTrades(id);

  if (error || !data) {
    notFound();
  }

  const { session, trades } = data;

  // If session is completed, redirect to review page
  if (session.status === "completed") {
    redirect(`/session/${id}/review`);
  }

  const { data: rules } = await getUserRulesForSession();

  return (
    <ActiveSession
      session={session}
      trades={trades}
      rules={rules || []}
    />
  );
}
