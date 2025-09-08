"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PlayerWaitingRoom } from "@/components/player-waiting-room"
import { Car, Users, ArrowRight } from "lucide-react"

interface Player {
  id: string
  name: string
  carColor: string
  joinedAt: number
}

type JoinState = "form" | "waiting" | "error"

export default function JoinGamePage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const [joinState, setJoinState] = useState<JoinState>("form")
  const [playerName, setPlayerName] = useState("")
  const [selectedColor, setSelectedColor] = useState("#3b82f6")
  const [isJoining, setIsJoining] = useState(false)
  const [player, setPlayer] = useState<Player | null>(null)

  const carColors = [
    { color: "#3b82f6", name: "Blue" },
    { color: "#ef4444", name: "Red" },
    { color: "#22c55e", name: "Green" },
    { color: "#f59e0b", name: "Orange" },
    { color: "#8b5cf6", name: "Purple" },
    { color: "#ec4899", name: "Pink" },
    { color: "#06b6d4", name: "Cyan" },
    { color: "#84cc16", name: "Lime" },
  ]

  useEffect(() => {
    if (!roomId || roomId.length !== 6) {
      setJoinState("error")
    }
  }, [roomId])

  const handleJoinGame = async () => {
    if (!playerName.trim()) return

    setIsJoining(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newPlayer: Player = {
        id: Math.random().toString(36).substring(2, 9),
        name: playerName.trim(),
        carColor: selectedColor,
        joinedAt: Date.now(),
      }

      setPlayer(newPlayer)
      setJoinState("waiting")
    } catch (error) {
      console.error("Failed to join game:", error)
      setJoinState("error")
    } finally {
      setIsJoining(false)
    }
  }

  const handleGameStart = () => {
    const playerData = encodeURIComponent(JSON.stringify(player))
    router.push(`/game/${roomId}?player=${playerData}`)
  }

  if (joinState === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Room</h1>
            <p className="text-muted-foreground mb-6">
              The room code "{roomId}" is not valid or the game may have ended.
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Back to Home
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  if (joinState === "waiting" && player) {
    return (
      <PlayerWaitingRoom
        roomId={roomId}
        player={player}
        onGameStart={handleGameStart}
        onLeaveRoom={() => router.push("/")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Speed Rush</h1>
          <p className="text-muted-foreground">Join the race!</p>
        </div>

        {/* Room Info */}
        <Card className="p-4 mb-6">
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Room: {roomId}
            </Badge>
          </div>
        </Card>

        {/* Join Form */}
        <Card className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Join the Race</h2>
            <p className="text-muted-foreground">Enter your details to start racing</p>
          </div>

          {/* Player Name */}
          <div className="space-y-2">
            <Label htmlFor="playerName">Your Name</Label>
            <Input
              id="playerName"
              type="text"
              placeholder="Enter your racing name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              className="text-center text-lg"
            />
          </div>

          {/* Car Color Selection */}
          <div className="space-y-3">
            <Label>Choose Your Car Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {carColors.map((car) => (
                <button
                  key={car.color}
                  onClick={() => setSelectedColor(car.color)}
                  className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedColor === car.color
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: car.color }}
                    />
                    <span className="text-xs font-medium">{car.name}</span>
                  </div>
                  {selectedColor === car.color && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Car className="w-2 h-2 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-white" style={{ backgroundColor: selectedColor }} />
              <span className="font-medium">{playerName.trim() || "Your Name"}</span>
            </div>
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoinGame}
            disabled={!playerName.trim() || isJoining}
            size="lg"
            className="w-full h-12 text-lg"
          >
            {isJoining ? (
              "Joining Race..."
            ) : (
              <>
                Join Race
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </Card>

        {/* Instructions */}
        <Card className="p-4 mt-6">
          <h3 className="font-semibold mb-2">What's Next:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Enter your name and pick a car color</li>
            <li>• Wait for other players to join</li>
            <li>• Game starts when host begins countdown</li>
            <li>• Use left/right controls to race and avoid obstacles</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
