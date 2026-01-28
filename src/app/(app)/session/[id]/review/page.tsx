import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSessionWithTrades } from "../actions";
import type { PreSessionData, PostSessionData, Trade } from "@/types/database";

interface SessionReviewPageProps {
  params: Promise<{ id: string }>;
}

const emotionColors: Record<string, string> = {
  confident: "bg-green-500/20 text-green-400",
  calm: "bg-blue-500/20 text-blue-400",
  fomo: "bg-amber-500/20 text-amber-400",
  revenge: "bg-red-500/20 text-red-400",
  fearful: "bg-purple-500/20 text-purple-400",
  frustrated: "bg-orange-500/20 text-orange-400",
};

export default async function SessionReviewPage({ params }: SessionReviewPageProps) {
  const { id } = await params;
  const { data, error } = await getSessionWithTrades(id);

  if (error || !data) {
    notFound();
  }

  const { session, trades } = data;
  const preSession = session.pre_session as PreSessionData;
  const postSession = session.post_session as PostSessionData | null;

  const wins = trades.filter((t: Trade) => t.result === "win").length;
  const losses = trades.filter((t: Trade) => t.result === "loss").length;
  const breakeven = trades.filter((t: Trade) => t.result === "breakeven").length;
  const rulesFollowed = trades.filter((t: Trade) => t.rules_followed).length;
  const totalPnl = trades.reduce((sum: number, t: Trade) => sum + (t.pnl || 0), 0);

  // Calculate emotion distribution
  const emotionCounts = trades.reduce((acc: Record<string, number>, t: Trade) => {
    acc[t.emotion_tag] = (acc[t.emotion_tag] || 0) + 1;
    return acc;
  }, {});

  const startTime = new Date(session.started_at);
  const endTime = session.ended_at ? new Date(session.ended_at) : new Date();
  const durationMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Review</h1>
          <p className="text-muted-foreground mt-1">
            {new Date(session.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>

      {/* Discipline Score */}
      <Card className="border-primary">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium">
            Discipline Score
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-6xl font-bold text-primary">
            {session.discipline_score ?? "--"}
          </div>
          <p className="text-muted-foreground mt-2">out of 100</p>
          <Progress
            value={session.discipline_score || 0}
            className="mt-4 h-2"
          />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trades.length}</div>
            <div className="flex gap-2 mt-1 text-xs">
              <span className="text-green-400">{wins}W</span>
              <span className="text-red-400">{losses}L</span>
              <span className="text-muted-foreground">{breakeven}BE</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalPnl > 0 ? "text-green-400" : totalPnl < 0 ? "text-red-400" : ""
              }`}
            >
              {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rules Followed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trades.length > 0
                ? Math.round((rulesFollowed / trades.length) * 100)
                : 100}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {rulesFollowed}/{trades.length} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hours}h {minutes}m
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emotion Distribution */}
      {trades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Emotional State Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(emotionCounts).map(([emotion, count]) => (
                <Badge
                  key={emotion}
                  variant="outline"
                  className={`${emotionColors[emotion]} text-sm px-3 py-1`}
                >
                  {emotion}: {count as number}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-Session Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Session Check-in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Sleep Quality</p>
              <p className="font-medium">{preSession.sleepRating}/5</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stress Level</p>
              <p className="font-medium">{preSession.stressLevel}/5</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Focus & Energy</p>
              <p className="font-medium">{preSession.focusRating}/5</p>
            </div>
          </div>
          {preSession.plannedSetups && (
            <div>
              <p className="text-sm text-muted-foreground">Planned Setups</p>
              <p className="text-sm">{preSession.plannedSetups}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post-Session Reflection */}
      {postSession && (
        <Card>
          <CardHeader>
            <CardTitle>Post-Session Reflection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Plan Adherence</p>
                <p className="font-medium">{postSession.planFollowedRating}/5</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Emotional Control</p>
                <p className="font-medium">{postSession.emotionalControlRating}/5</p>
              </div>
            </div>
            {postSession.whatWentWell && (
              <div>
                <p className="text-sm text-muted-foreground">What went well</p>
                <p className="text-sm">{postSession.whatWentWell}</p>
              </div>
            )}
            {postSession.whatToImprove && (
              <div>
                <p className="text-sm text-muted-foreground">What to improve</p>
                <p className="text-sm">{postSession.whatToImprove}</p>
              </div>
            )}
            {postSession.tomorrowFocus && (
              <div>
                <p className="text-sm text-muted-foreground">Tomorrow&apos;s focus</p>
                <p className="text-sm">{postSession.tomorrowFocus}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trade Log */}
      {trades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trade Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trades.map((trade: Trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono">
                      #{trade.trade_number}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        trade.result === "win"
                          ? "bg-green-500/20 text-green-400"
                          : trade.result === "loss"
                          ? "bg-red-500/20 text-red-400"
                          : ""
                      }
                    >
                      {trade.result.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={emotionColors[trade.emotion_tag]}>
                      {trade.emotion_tag}
                    </Badge>
                    {!trade.rules_followed && (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400">
                        Rules Broken
                      </Badge>
                    )}
                  </div>
                  {trade.pnl !== null && (
                    <span
                      className={`font-mono ${
                        trade.pnl > 0
                          ? "text-green-400"
                          : trade.pnl < 0
                          ? "text-red-400"
                          : ""
                      }`}
                    >
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
