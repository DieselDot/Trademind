import { redirect } from "next/navigation";
import { getActiveSession, getUserRules } from "../actions";
import { PreSessionForm } from "@/components/session/pre-session-form";

export default async function NewSessionPage() {
  // Check if there's already an active session
  const { data: activeSession } = await getActiveSession();

  if (activeSession) {
    redirect(`/session/${activeSession.id}`);
  }

  // Get user's active rules for the rules review step
  const { data: rules } = await getUserRules();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Pre-Session Ritual</h1>
        <p className="text-muted-foreground mt-2">
          Prepare yourself before entering the market
        </p>
      </div>

      <PreSessionForm rules={rules || []} />
    </div>
  );
}
