"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, RotateCcw, Home, Target } from "lucide-react"
import type { Player } from "@/lib/multiplayer-game-state"

interface RaceResultsProps {
  results: Player[]
  winner: Player | undefined
  currentPlayer: Player
  onPlayAgain: () => void
  onBackToMenu: () => void
}

export function RaceResults({ results, winner, currentPlayer, onPlayAgain, onBackToMenu }: RaceResultsProps) {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{position}</div>
        )
    }
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/20"
      case 2:
        return "bg-gray-400/10 border-gray-400/20"
      case 3:
        return "bg-amber-600/10 border-amber-600/20"
      default:
        return "bg-muted"
    }
  }

  const currentPlayerResult = results.find((p) => p.id === currentPlayer.id)
  const isWinner = winner?.id === currentPlayer.id

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            {isWinner ? (
              <Trophy className="w-16 h-16 mx-auto text-yellow-500 animate-bounce" />
            ) : (
              <Target className="w-16 h-16 mx-auto text-primary" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">Race Complete!</h1>
          <p className="text-muted-foreground text-lg">
            {isWinner
              ? "Congratulations! You won the race!"
              : `You finished in ${currentPlayerResult?.racePosition}${currentPlayerResult?.racePosition === 1 ? "st" : currentPlayerResult?.racePosition === 2 ? "nd" : currentPlayerResult?.racePosition === 3 ? "rd" : "th"} place!`}
          </p>
        </div>

        {/* Winner Spotlight */}
        {winner && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold mb-2">Race Winner</h2>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: winner.carColor }}
                />
                <span className="text-xl font-bold">{winner.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-accent">{winner.score}</div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{winner.tokensCollected}</div>
                  <div className="text-sm text-muted-foreground">Tokens</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">{Math.round(winner.totalDistance)}</div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Results Table */}
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-center">Final Results</h3>
          <div className="space-y-3">
            {results.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  player.id === currentPlayer.id
                    ? "bg-primary/10 border-primary/20 ring-2 ring-primary/20"
                    : getPositionColor(player.racePosition)
                }`}
              >
                <div className="flex items-center gap-4">
                  {getPositionIcon(player.racePosition)}
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: player.carColor }}
                  />
                  <div>
                    <div className="font-bold">
                      {player.name}
                      {player.id === currentPlayer.id && " (You)"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {player.isFinished ? "Finished" : player.lives > 0 ? "Did not finish" : "Eliminated"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg">{player.score}</div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{player.tokensCollected} 🌟</span>
                    <span>{player.collisions} 💥</span>
                    <span>{Math.round(player.totalDistance)}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Personal Stats */}
        {currentPlayerResult && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold mb-4 text-center">Your Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-accent">{currentPlayerResult.score}</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{currentPlayerResult.tokensCollected}</div>
                <div className="text-sm text-muted-foreground">Tokens</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-destructive">{currentPlayerResult.collisions}</div>
                <div className="text-sm text-muted-foreground">Collisions</div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-secondary">{Math.round(currentPlayerResult.totalDistance)}</div>
                <div className="text-sm text-muted-foreground">Distance (m)</div>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={onPlayAgain} size="lg" className="flex-1">
            <RotateCcw className="w-5 h-5 mr-2" />
            Race Again
          </Button>
          <Button onClick={onBackToMenu} variant="outline" size="lg" className="flex-1 bg-transparent">
            <Home className="w-5 h-5 mr-2" />
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  )
}
