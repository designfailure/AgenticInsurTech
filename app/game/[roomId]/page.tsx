"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { MultiplayerGameView } from "@/components/multiplayer-game-view"
import { getGameManager, destroyGameManager, type Player } from "@/lib/multiplayer-game-state"

export default function MultiplayerGamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const roomId = params.roomId as string
  const playerData = searchParams.get("player")

  const [player, setPlayer] = useState<Player | null>(null)
  const [gameManager, setGameManager] = useState<ReturnType<typeof getGameManager> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!roomId || !playerData) {
      router.push("/")
      return
    }

    try {
      const parsedPlayer = JSON.parse(decodeURIComponent(playerData))

      const manager = getGameManager(roomId)
      const addedPlayer = manager.addPlayer(parsedPlayer)

      setPlayer(addedPlayer)
      setGameManager(manager)

      setTimeout(() => {
        manager.startGame()
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Failed to parse player data:", error)
      router.push("/")
    }

    return () => {
      if (player) {
        const manager = getGameManager(roomId)
        manager.removePlayer(player.id)

        // If no players left, destroy the game manager
        if (manager.getPlayers().length === 0) {
          destroyGameManager(roomId)
        }
      }
    }
  }, [roomId, playerData, router])

  const handleBackToMenu = () => {
    if (gameManager && player) {
      gameManager.removePlayer(player.id)
      if (gameManager.getPlayers().length === 0) {
        destroyGameManager(roomId)
      }
    }
    router.push("/")
  }

  if (isLoading || !player || !gameManager) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading multiplayer game...</p>
        </Card>
      </div>
    )
  }

  return <MultiplayerGameView gameManager={gameManager} currentPlayer={player} onBackToMenu={handleBackToMenu} />
}
