"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Session } from "@/types/database";

interface RecentSessionsProps {
  sessions: Session[];
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No sessions yet. Start your first trading session!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Sessions</CardTitle>
        <Link href="/history">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <Link
              key={session.id}
              href={`/session/${session.id}/review`}
              className="block"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-4">
                  <div
                    className={`stat-number text-2xl font-bold ${
                      (session.discipline_score || 0) >= 80
                        ? "text-success"
                        : (session.discipline_score || 0) >= 60
                        ? "text-warning"
                        : "text-destructive"
                    }`}
                  >
                    {session.discipline_score ?? "--"}
                  </div>
                  <div>
                    <p className="font-medium">
                      {new Date(session.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.started_at &&
                        new Date(session.started_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      {session.ended_at &&
                        ` - ${new Date(session.ended_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}`}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`badge-smooth ${
                    (session.discipline_score || 0) >= 80
                      ? "bg-success/10 text-success border-success/20"
                      : (session.discipline_score || 0) >= 60
                      ? "bg-warning/10 text-warning border-warning/20"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                  }`}
                >
                  {(session.discipline_score || 0) >= 80
                    ? "Great"
                    : (session.discipline_score || 0) >= 60
                    ? "Good"
                    : "Needs Work"}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
