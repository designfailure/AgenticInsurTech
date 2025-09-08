"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { GameLobby } from "@/components/game-lobby"
import { ChevronLeft, ChevronRight, RotateCcw, Play, Pause, Users, Gamepad2 } from "lucide-react"

type GameMode = "menu" | "lobby" | "single" | "multiplayer"

interface Player {
  id: string
  name: string
  carColor: string
  joinedAt: number
}

interface GameObject {
  id: number
  x: number
  y: number
  type: "obstacle" | "token"
}

interface GameState {
  playerX: number
  score: number
  gameObjects: GameObject[]
  isPlaying: boolean
  gameSpeed: number
  lives: number
  isColliding: boolean
}

export default function CarRacingGame() {
  const [gameMode, setGameMode] = useState<GameMode>("menu")
  const [roomId, setRoomId] = useState<string>("")
  const [players, setPlayers] = useState<Player[]>([])

  const [gameState, setGameState] = useState<GameState>({
    playerX: 50, // percentage from left
    score: 0,
    gameObjects: [],
    isPlaying: false,
    gameSpeed: 2,
    lives: 3,
    isColliding: false,
  })

  const GAME_WIDTH = 100 // percentage
  const PLAYER_WIDTH = 8 // percentage
  const OBJECT_WIDTH = 6 // percentage

  const createMultiplayerGame = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(newRoomId)
    setGameMode("lobby")
  }

  const startSinglePlayer = () => {
    setGameMode("single")
    resetGame()
  }

  const handleStartMultiplayerGame = (gamePlayers: Player[]) => {
    setPlayers(gamePlayers)
    setGameMode("multiplayer")
    resetGame()
    setTimeout(() => {
      setGameState((prev) => ({ ...prev, isPlaying: true }))
    }, 100)
  }

  const backToMenu = () => {
    setGameMode("menu")
    setRoomId("")
    setPlayers([])
    resetGame()
  }

  // Generate new game objects
  const generateObject = useCallback((id: number): GameObject => {
    const isToken = Math.random() > 0.7 // 30% chance for tokens
    return {
      id,
      x: Math.random() * (GAME_WIDTH - OBJECT_WIDTH),
      y: -10,
      type: isToken ? "token" : "obstacle",
    }
  }, [])

  // Move player left
  const moveLeft = useCallback(() => {
    if (!gameState.isPlaying) return
    setGameState((prev) => ({
      ...prev,
      playerX: Math.max(0, prev.playerX - 15),
    }))
  }, [gameState.isPlaying])

  // Move player right
  const moveRight = useCallback(() => {
    if (!gameState.isPlaying) return
    setGameState((prev) => ({
      ...prev,
      playerX: Math.min(GAME_WIDTH - PLAYER_WIDTH, prev.playerX + 15),
    }))
  }, [gameState.isPlaying])

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        moveLeft()
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        moveRight()
      } else if (e.key === " ") {
        e.preventDefault()
        toggleGame()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [moveLeft, moveRight])

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying) return

    const gameLoop = setInterval(() => {
      setGameState((prev) => {
        let newObjects = prev.gameObjects
          .map((obj) => ({ ...obj, y: obj.y + prev.gameSpeed }))
          .filter((obj) => obj.y < 110)

        // Add new objects occasionally
        if (Math.random() < 0.02) {
          newObjects.push(generateObject(Date.now()))
        }

        // Check collisions
        let newScore = prev.score
        let newLives = prev.lives
        let isColliding = false

        newObjects = newObjects.filter((obj) => {
          const objCenterX = obj.x + OBJECT_WIDTH / 2
          const playerCenterX = prev.playerX + PLAYER_WIDTH / 2
          const distance = Math.abs(objCenterX - playerCenterX)

          if (obj.y > 70 && obj.y < 90 && distance < (PLAYER_WIDTH + OBJECT_WIDTH) / 2) {
            if (obj.type === "token") {
              newScore += 10
              return false // Remove token
            } else {
              newLives -= 1
              isColliding = true
              return false // Remove obstacle
            }
          }
          return true
        })

        // Increase speed over time
        const newGameSpeed = Math.min(prev.gameSpeed + 0.001, 5)

        return {
          ...prev,
          gameObjects: newObjects,
          score: newScore,
          lives: newLives,
          gameSpeed: newGameSpeed,
          isColliding,
          isPlaying: newLives > 0,
        }
      })
    }, 16) // ~60fps

    return () => clearInterval(gameLoop)
  }, [gameState.isPlaying, generateObject])

  // Clear collision animation
  useEffect(() => {
    if (gameState.isColliding) {
      const timer = setTimeout(() => {
        setGameState((prev) => ({ ...prev, isColliding: false }))
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [gameState.isColliding])

  const toggleGame = () => {
    setGameState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const resetGame = () => {
    setGameState({
      playerX: 50,
      score: 0,
      gameObjects: [],
      isPlaying: false,
      gameSpeed: 2,
      lives: 3,
      isColliding: false,
    })
  }

  if (gameMode === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-primary mb-4">Speed Rush</h1>
            <p className="text-muted-foreground text-lg">Choose your racing experience</p>
          </div>

          {/* Game Mode Selection */}
          <Card className="p-6 space-y-4">
            <Button onClick={startSinglePlayer} size="lg" className="w-full h-16 text-lg">
              <Gamepad2 className="w-6 h-6 mr-3" />
              Single Player
            </Button>

            <Button
              onClick={createMultiplayerGame}
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg bg-transparent"
            >
              <Users className="w-6 h-6 mr-3" />
              Create Multiplayer Game
            </Button>
          </Card>

          {/* Instructions */}
          <Card className="p-4 mt-6">
            <h3 className="font-semibold mb-2">Game Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Single player: Race against time and obstacles</li>
              <li>• Multiplayer: Race with friends via QR code</li>
              <li>• Collect tokens and avoid obstacles</li>
              <li>• Progressive difficulty and speed</li>
            </ul>
          </Card>
        </div>
      </div>
    )
  }

  if (gameMode === "lobby") {
    return <GameLobby roomId={roomId} onStartGame={handleStartMultiplayerGame} onBackToMenu={backToMenu} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Speed Rush</h1>
          <p className="text-muted-foreground">
            {gameMode === "multiplayer" ? `Room: ${roomId}` : "Avoid obstacles, collect tokens!"}
          </p>
        </div>

        {/* Game Stats */}
        <Card className="p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{gameState.score}</div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{gameState.lives}</div>
              <div className="text-sm text-muted-foreground">Lives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(gameState.gameSpeed * 10)}</div>
              <div className="text-sm text-muted-foreground">Speed</div>
            </div>
          </div>
        </Card>

        {/* Game Area */}
        <Card className="relative overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200 border-2 border-primary/20">
          <div className="relative w-full h-96">
            {/* Road markings */}
            <div className="absolute inset-0 flex justify-center">
              <div className="w-1 bg-white/50 h-full animate-pulse"></div>
            </div>

            {/* Game Objects */}
            {gameState.gameObjects.map((obj) => (
              <div
                key={obj.id}
                className={`absolute transition-all duration-75 ${
                  obj.type === "token"
                    ? "bg-accent rounded-full bounce-token text-accent-foreground flex items-center justify-center text-xs font-bold"
                    : "bg-destructive rounded-sm"
                }`}
                style={{
                  left: `${obj.x}%`,
                  top: `${obj.y}%`,
                  width: `${OBJECT_WIDTH}%`,
                  height: "8%",
                }}
              >
                {obj.type === "token" && "★"}
              </div>
            ))}

            {/* Player Car */}
            <div
              className={`absolute bottom-4 bg-primary rounded-lg transition-all duration-200 flex items-center justify-center text-primary-foreground font-bold ${
                gameState.isColliding ? "car-collision bg-destructive" : ""
              }`}
              style={{
                left: `${gameState.playerX}%`,
                width: `${PLAYER_WIDTH}%`,
                height: "12%",
              }}
            >
              🚗
            </div>

            {/* Game Over Overlay */}
            {gameState.lives <= 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Card className="p-6 text-center">
                  <h2 className="text-2xl font-bold text-destructive mb-2">Game Over!</h2>
                  <p className="text-muted-foreground mb-4">Final Score: {gameState.score}</p>
                  <div className="space-y-2">
                    <Button onClick={resetGame} className="w-full">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                    <Button onClick={backToMenu} variant="outline" className="w-full bg-transparent">
                      Back to Menu
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          {/* Game Controls */}
          <div className="flex gap-2 justify-center">
            <Button onClick={toggleGame} disabled={gameState.lives <= 0} className="flex-1">
              {gameState.isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {gameState.lives <= 0 ? "Game Over" : "Start"}
                </>
              )}
            </Button>
            <Button onClick={resetGame} variant="outline">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button onClick={backToMenu} variant="outline">
              Menu
            </Button>
          </div>

          {/* Movement Controls */}
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={moveLeft} disabled={!gameState.isPlaying} className="flex-1 h-16 text-lg">
              <ChevronLeft className="w-6 h-6 mr-2" />
              Left
            </Button>
            <Button size="lg" onClick={moveRight} disabled={!gameState.isPlaying} className="flex-1 h-16 text-lg">
              Right
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>

          {/* Instructions */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">How to Play:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use Left/Right buttons or arrow keys to move</li>
              <li>• Avoid red obstacles to keep your lives</li>
              <li>• Collect green tokens (★) for points</li>
              <li>• Speed increases as you play!</li>
              <li>• Press spacebar to pause/resume</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
