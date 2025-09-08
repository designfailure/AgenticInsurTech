"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CountdownTimer } from "./countdown-timer"
import { Users, Clock, Car, LogOut, Zap } from "lucide-react"

interface Player {
  id: string
  name: string
  carColor: string
  joinedAt: number
}

interface PlayerWaitingRoomProps {
  roomId: string
  player: Player
  onGameStart: () => void
  onLeaveRoom: () => void
}

export function PlayerWaitingRoom({ roomId, player, onGameStart, onLeaveRoom }: PlayerWaitingRoomProps) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([])
  const [waitingTime, setWaitingTime] = useState(0)
  const [isCountdownActive, setIsCountdownActive] = useState(false)

  useEffect(() => {
    // Simulate other players joining
    const mockPlayers = [
      { id: "host", name: "Host Player", carColor: "#ef4444", joinedAt: Date.now() - 30000 },
      { id: "player2", name: "Speed Demon", carColor: "#22c55e", joinedAt: Date.now() - 15000 },
    ]
    setOtherPlayers(mockPlayers)

    const countdownTimer = setTimeout(() => {
      setIsCountdownActive(true)
      setCountdown(10)
    }, 5000)

    return () => clearTimeout(countdownTimer)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setWaitingTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleCountdownComplete = () => {
    setCountdown(null)
    setIsCountdownActive(false)
    onGameStart()
  }

  const handleCountdownTick = (count: number) => {
    if (count <= 3 && count > 0) {
      console.log(`[v0] Player countdown: ${count}`)
    }
  }

  const allPlayers = [player, ...otherPlayers]
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Speed Rush</h1>
          <p className="text-muted-foreground">
            {isCountdownActive ? "Race starting!" : "Waiting for race to start..."}
          </p>
        </div>

        {/* Room Status */}
        <Card className="p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Room: {roomId}</h2>
            <div className="flex justify-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                {allPlayers.length} Players
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {formatTime(waitingTime)}
              </Badge>
              {isCountdownActive && (
                <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">
                  <Zap className="w-4 h-4 mr-2" />
                  Starting!
                </Badge>
              )}
            </div>
          </div>

          {countdown !== null && isCountdownActive ? (
            <div className="mb-6">
              <CountdownTimer
                initialCount={10}
                onComplete={handleCountdownComplete}
                onTick={handleCountdownTick}
                size="lg"
                showAnimation={true}
              />
            </div>
          ) : (
            <div className="text-center mb-6 p-4 bg-muted rounded-lg">
              <Car className="w-8 h-8 mx-auto mb-2 text-primary animate-bounce" />
              <p className="text-muted-foreground">Waiting for host to start the race...</p>
            </div>
          )}

          {/* Players List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-center">Racers:</h3>
            {allPlayers.map((p, index) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                  p.id === player.id ? "bg-primary/10 border-2 border-primary/20" : "bg-muted"
                } ${isCountdownActive ? "animate-pulse" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: p.carColor }}
                  />
                  <span className="font-medium">
                    {p.name}
                    {p.id === player.id && " (You)"}
                  </span>
                  {index === 0 && (
                    <Badge variant="outline" size="sm">
                      Host
                    </Badge>
                  )}
                </div>
                <Badge variant={isCountdownActive ? "destructive" : "secondary"} size="sm">
                  {isCountdownActive ? "Racing!" : "Ready"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Controls */}
        <div className="space-y-3">
          <Button
            onClick={onLeaveRoom}
            variant="outline"
            className="w-full bg-transparent"
            disabled={isCountdownActive}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isCountdownActive ? "Cannot Leave During Countdown" : "Leave Room"}
          </Button>
        </div>

        <Card className="p-4 mt-6">
          <h3 className="font-semibold mb-2">Get Ready:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• The race will start automatically when the host begins</li>
            <li>• Watch for the 10-second countdown with visual effects</li>
            <li>• Get ready when the timer turns red (3 seconds left)!</li>
            <li>• Use left/right buttons to steer your car</li>
            <li>• Avoid red obstacles and collect green tokens</li>
            <li>• Compete for the highest score!</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
