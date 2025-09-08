"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RaceResults } from "./race-results"
import { ChevronLeft, ChevronRight, RotateCcw, Play, Pause, Home, Trophy, Target } from "lucide-react"
import type { MultiplayerGameManager, MultiplayerGameState, Player } from "@/lib/multiplayer-game-state"

interface MultiplayerGameViewProps {
  gameManager: MultiplayerGameManager
  currentPlayer: Player
  onBackToMenu: () => void
}

export function MultiplayerGameView({ gameManager, currentPlayer, onBackToMenu }: MultiplayerGameViewProps) {
  const [gameState, setGameState] = useState<MultiplayerGameState>(gameManager.getState())
  const [isPaused, setIsPaused] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const GAME_WIDTH = 100
  const PLAYER_WIDTH = 8
  const OBJECT_WIDTH = 6

  // Subscribe to game state updates
  useEffect(() => {
    const unsubscribe = gameManager.subscribe((newState) => {
      setGameState(newState)

      if (newState.isRaceComplete && !showResults) {
        setTimeout(() => setShowResults(true), 2000) // Delay to show final moments
      }
    })
    return unsubscribe
  }, [gameManager, showResults])

  // Player movement
  const moveLeft = useCallback(() => {
    if (!gameState.isActive || isPaused) return
    const newPosition = Math.max(0, currentPlayer.position - 15)
    gameManager.updatePlayerPosition(currentPlayer.id, newPosition)
  }, [gameManager, currentPlayer.id, currentPlayer.position, gameState.isActive, isPaused])

  const moveRight = useCallback(() => {
    if (!gameState.isActive || isPaused) return
    const newPosition = Math.min(GAME_WIDTH - PLAYER_WIDTH, currentPlayer.position + 15)
    gameManager.updatePlayerPosition(currentPlayer.id, newPosition)
  }, [gameManager, currentPlayer.id, currentPlayer.position, gameState.isActive, isPaused])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        moveLeft()
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        moveRight()
      } else if (e.key === " ") {
        e.preventDefault()
        togglePause()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [moveLeft, moveRight])

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const resetGame = () => {
    setShowResults(false)
    gameManager.stopGame()
    // Reset all players
    gameState.players.forEach((player) => {
      gameManager.addPlayer({
        id: player.id,
        name: player.name,
        carColor: player.carColor,
        joinedAt: player.joinedAt,
      })
    })
    gameManager.startGame()
    setIsPaused(false)
  }

  // Get current player data
  const player = gameState.players.get(currentPlayer.id) || currentPlayer
  const allPlayers = Array.from(gameState.players.values())
  const alivePlayers = allPlayers.filter((p) => p.lives > 0 && p.isActive)
  const sortedPlayers = allPlayers.sort((a, b) => a.racePosition - b.racePosition)

  if (showResults && gameState.isRaceComplete) {
    return (
      <RaceResults
        results={gameState.raceResults}
        winner={gameState.winner}
        currentPlayer={player}
        onPlayAgain={resetGame}
        onBackToMenu={onBackToMenu}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Speed Rush</h1>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="secondary">Room: {gameState.roomId}</Badge>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: player.carColor }} />
              <span className="text-sm font-medium">{player.name}</span>
            </div>
            <Badge variant={gameState.isActive ? "default" : "outline"}>
              {gameState.isActive ? "Racing" : gameState.isRaceComplete ? "Complete" : "Waiting"}
            </Badge>
            <Badge variant="destructive" className="animate-pulse">
              <Trophy className="w-3 h-3 mr-1" />#{player.racePosition}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            {/* Game Stats */}
            <Card className="p-4 mb-4">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{player.score}</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">{player.lives}</div>
                  <div className="text-sm text-muted-foreground">Lives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{Math.round(gameState.gameSpeed * 10)}</div>
                  <div className="text-sm text-muted-foreground">Speed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{alivePlayers.length}</div>
                  <div className="text-sm text-muted-foreground">Alive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round((player.totalDistance / gameState.raceDistance) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Progress</div>
                </div>
              </div>
            </Card>

            {/* Race Progress Bar */}
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Race Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(player.totalDistance)}/{gameState.raceDistance}m
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300 relative"
                  style={{ width: `${Math.min((player.totalDistance / gameState.raceDistance) * 100, 100)}%` }}
                >
                  {player.totalDistance >= gameState.raceDistance && (
                    <Target className="absolute right-0 top-0 w-3 h-3 text-white animate-bounce" />
                  )}
                </div>
              </div>
            </Card>

            {/* Game Track */}
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

                {/* All Player Cars */}
                {allPlayers.map((p) => (
                  <div
                    key={p.id}
                    className={`absolute bottom-4 rounded-lg transition-all duration-200 flex items-center justify-center text-white font-bold text-xs ${
                      p.lives <= 0 ? "opacity-30" : ""
                    } ${p.id === currentPlayer.id ? "ring-2 ring-white" : ""} ${p.isFinished ? "animate-bounce" : ""}`}
                    style={{
                      left: `${p.position}%`,
                      width: `${PLAYER_WIDTH}%`,
                      height: "12%",
                      backgroundColor: p.carColor,
                      zIndex: p.id === currentPlayer.id ? 10 : 5,
                    }}
                  >
                    {p.isFinished ? "🏁" : "🚗"}
                  </div>
                ))}

                {/* Race Complete Overlay */}
                {gameState.isRaceComplete && !showResults && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Card className="p-6 text-center max-w-sm">
                      <Trophy className="w-12 h-12 mx-auto mb-4 text-accent animate-bounce" />
                      <h2 className="text-2xl font-bold text-primary mb-2">Race Complete!</h2>
                      <p className="text-muted-foreground mb-4">Calculating results...</p>
                      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    </Card>
                  </div>
                )}

                {/* Pause Overlay */}
                {isPaused && gameState.isActive && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Card className="p-4 text-center">
                      <Pause className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-muted-foreground">Game Paused</p>
                    </Card>
                  </div>
                )}
              </div>
            </Card>

            {/* Controls */}
            <div className="mt-6 space-y-4">
              <div className="flex gap-2 justify-center">
                <Button onClick={togglePause} disabled={!gameState.isActive} className="flex-1">
                  {isPaused ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button onClick={resetGame} variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button onClick={onBackToMenu} variant="outline">
                  <Home className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={moveLeft}
                  disabled={!gameState.isActive || isPaused || player.lives <= 0}
                  className="flex-1 h-16 text-lg"
                >
                  <ChevronLeft className="w-6 h-6 mr-2" />
                  Left
                </Button>
                <Button
                  size="lg"
                  onClick={moveRight}
                  disabled={!gameState.isActive || isPaused || player.lives <= 0}
                  className="flex-1 h-16 text-lg"
                >
                  Right
                  <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 text-center">
                <Trophy className="w-4 h-4 inline mr-2" />
                Live Rankings
              </h3>
              <div className="space-y-2">
                {sortedPlayers.map((p, index) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                      p.id === currentPlayer.id ? "bg-primary/10 border border-primary/20" : "bg-muted"
                    } ${p.lives <= 0 ? "opacity-60" : ""} ${p.isFinished ? "ring-2 ring-accent" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${index < 3 ? "text-accent" : "text-muted-foreground"}`}>
                        #{p.racePosition}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: p.carColor }}
                      />
                      <span className="font-medium truncate max-w-16">
                        {p.name}
                        {p.id === currentPlayer.id && " (You)"}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{p.score}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.isFinished ? "🏁" : p.lives > 0 ? `${p.lives} ❤️` : "💀"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Game Info */}
            <Card className="p-4 mt-4">
              <h3 className="font-semibold mb-2">Game Status:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Players: {allPlayers.length}</li>
                <li>• Alive: {alivePlayers.length}</li>
                <li>• Objects: {gameState.gameObjects.length}</li>
                <li>• Speed: {Math.round(gameState.gameSpeed * 10)}/50</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
