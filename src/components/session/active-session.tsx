"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SessionStats } from "./session-stats";
import { TradeLogger } from "./trade-logger";
import { TradeList } from "./trade-list";
import { EndSessionDialog } from "./end-session-dialog";
import type { Session, Trade, Rule, PreSessionData } from "@/types/database";

interface ActiveSessionProps {
  session: Session;
  trades: Trade[];
  rules: Pick<Rule, "id" | "name" | "category">[];
}

export function ActiveSession({ session, trades, rules }: ActiveSessionProps) {
  const [endSessionOpen, setEndSessionOpen] = useState(false);
  const preSession = session.pre_session as PreSessionData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Session</h1>
          <p className="text-muted-foreground mt-1">
            {new Date(session.started_at).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setEndSessionOpen(true)}
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          End Session
        </Button>
      </div>

      <SessionStats
        trades={trades}
        preSession={preSession}
        startedAt={session.started_at}
      />

      <TradeLogger
        sessionId={session.id}
        rules={rules}
        tradeCount={trades.length}
        maxTrades={preSession.maxTrades}
      />

      <TradeList trades={trades} sessionId={session.id} rules={rules} />

      <EndSessionDialog
        sessionId={session.id}
        open={endSessionOpen}
        onOpenChange={setEndSessionOpen}
      />
    </div>
  );
}
