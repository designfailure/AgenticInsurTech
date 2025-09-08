"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QRCodeGenerator } from "./qr-code-generator"
import { CountdownTimer } from "./countdown-timer"
import { Users, Play, Copy, Check, Clock, Zap } from "lucide-react"

interface Player {
  id: string
  name: string
  carColor: string
  joinedAt: number
}

interface GameLobbyProps {
  roomId: string
  onStartGame: (players: Player[]) => void
  onBackToMenu: () => void
}

export function GameLobby({ roomId, onStartGame, onBackToMenu }: GameLobbyProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const joinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${roomId}`

  useEffect(() => {
    const mockPlayers = [{ id: "host", name: "Host Player", carColor: "#3b82f6", joinedAt: Date.now() }]
    setPlayers(mockPlayers)

    // Simulate additional players joining over time
    const joinTimers = [
      setTimeout(() => {
        setPlayers((prev) => [
          ...prev,
          {
            id: "player2",
            name: "Speed Racer",
            carColor: "#ef4444",
            joinedAt: Date.now(),
          },
        ])
      }, 3000),
      setTimeout(() => {
        setPlayers((prev) => [
          ...prev,
          {
            id: "player3",
            name: "Lightning",
            carColor: "#22c55e",
            joinedAt: Date.now(),
          },
        ])
      }, 7000),
    ]

    return () => joinTimers.forEach(clearTimeout)
  }, [])

  const copyJoinUrl = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  const startCountdown = () => {
    if (players.length < 1 || isStarting) return

    setIsStarting(true)
    setCountdown(10)
  }

  const handleCountdownComplete = () => {
    onStartGame(players)
    setCountdown(null)
    setIsStarting(false)
  }

  const handleCountdownTick = (count: number) => {
    if (count <= 3 && count > 0) {
      // In a real app, you might trigger haptic feedback on mobile
      console.log(`[v0] Countdown: ${count}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Speed Rush</h1>
          <p className="text-muted-foreground">Multiplayer Racing Lobby</p>
        </div>

        {/* Room Info */}
        <Card className="p-6 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Room: {roomId}</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                {players.length} Player{players.length !== 1 ? "s" : ""} Joined
              </Badge>
              {isStarting && (
                <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">
                  <Zap className="w-4 h-4 mr-2" />
                  Starting Soon!
                </Badge>
              )}
            </div>
          </div>

          {countdown !== null ? (
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
            <>
              {/* QR Code */}
              <div className="flex flex-col items-center mb-6">
                <p className="text-sm text-muted-foreground mb-4">Scan QR code or share link to join:</p>
                <QRCodeGenerator value={joinUrl} size={200} className="mb-4" />

                {/* Join URL */}
                <div className="flex items-center gap-2 w-full max-w-md">
                  <input
                    type="text"
                    value={joinUrl}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                  />
                  <Button size="sm" onClick={copyJoinUrl} variant="outline">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Players List */}
          <div className="space-y-2 mb-6">
            <h3 className="font-semibold text-center">Players:</h3>
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 bg-muted rounded-lg transition-all duration-300 ${
                  countdown !== null ? "animate-pulse" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: player.carColor }}
                  />
                  <span className="font-medium">{player.name}</span>
                  {index === 0 && <Badge variant="outline">Host</Badge>}
                </div>
                <Badge variant={countdown !== null ? "destructive" : "secondary"}>
                  {countdown !== null ? "Racing!" : "Ready"}
                </Badge>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button onClick={onBackToMenu} variant="outline" className="flex-1 bg-transparent" disabled={isStarting}>
              Back to Menu
            </Button>
            <Button
              onClick={startCountdown}
              disabled={players.length < 1 || isStarting}
              className={`flex-1 ${isStarting ? "animate-pulse" : ""}`}
            >
              {isStarting ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Game ({players.length} players)
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">How to Join:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Scan the QR code with your phone camera</li>
            <li>• Or copy and share the join link</li>
            <li>• Enter your name and choose a car color</li>
            <li>• Wait for the host to start the game</li>
            <li>• Game starts with a 10-second countdown with visual and audio cues</li>
            <li>• Get ready when the countdown reaches 3!</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
