import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Pause, Play, Square } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { useMainPlayer } from "../hooks/useMainPlayer";
import { predefinedSessions } from "../hooks/useUnifiedSessionManager";

interface SessionPanelProps {
  sessionManager: {
    activeSession: any;
    startSession: (session: any) => void;
    stopSession: () => void;
    pauseSession: () => void;
    resumeSession: () => void;
  };
}

export default function UnifiedSessionPanel({
  sessionManager,
}: SessionPanelProps) {
  const player = useMainPlayer();
  const { t } = useLanguage();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSessionName = (nameKey: string) => {
    return t.sessions[nameKey as keyof typeof t.sessions] || nameKey;
  };

  return (
    <Card className="border-2 border-white/20 bg-white/10 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
          <Clock className="h-6 w-6" />
          {t.sessions.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionManager.activeSession ? (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {getSessionName(sessionManager.activeSession.nameKey)}
                </h3>
                <span className="text-2xl font-bold text-white">
                  {formatTime(player.timeRemaining)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                <span>
                  {t.sessions.frequency} {player.currentIndex + 1}{" "}
                  {t.sessions.of} {player.queue.length}
                </span>
                <span>•</span>
                <span>{player.currentFrequency} Hz</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-full transition-all duration-1000"
                  style={{
                    width: `${((player.totalDuration - player.timeRemaining) / player.totalDuration) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {player.isPaused ? (
                <Button
                  onClick={sessionManager.resumeSession}
                  variant="default"
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t.sessions.continue}
                </Button>
              ) : (
                <Button
                  onClick={sessionManager.pauseSession}
                  variant="secondary"
                  className="flex-1"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  {t.pause}
                </Button>
              )}
              <Button
                onClick={sessionManager.stopSession}
                variant="destructive"
                className="flex-1"
              >
                <Square className="mr-2 h-4 w-4" />
                {t.stop}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {predefinedSessions.map((session) => (
                <Button
                  key={session.id}
                  onClick={() => sessionManager.startSession(session)}
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-start gap-1 bg-white/5 hover:bg-white/10 border-white/20 text-white"
                >
                  <span className="font-semibold">
                    {getSessionName(session.nameKey)}
                  </span>
                  <span className="text-xs text-white/70">
                    {session.frequencies.length} {t.sessions.frequencies}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
