"use client"

export interface Player {
  id: string
  name: string
  carColor: string
  joinedAt: number
  position: number // x position on track
  score: number
  lives: number
  isActive: boolean
  lastUpdate: number
  racePosition: number // 1st, 2nd, 3rd place
  totalDistance: number // Total distance traveled
  collisions: number // Number of collisions
  tokensCollected: number // Number of tokens collected
  isFinished: boolean // Has finished the race
  finishTime?: number // Time when race was completed
}

export interface GameObject {
  id: number
  x: number
  y: number
  type: "obstacle" | "token"
  roomId: string
  spawnTime: number
}

export interface RaceEvent {
  id: string
  type: "collision" | "token_collected" | "player_finished" | "race_complete"
  playerId: string
  timestamp: number
  data?: any
}

export interface MultiplayerGameState {
  roomId: string
  players: Map<string, Player>
  gameObjects: GameObject[]
  gameSpeed: number
  isActive: boolean
  startTime: number | null
  lastObjectId: number
  raceEvents: RaceEvent[]
  raceDistance: number // Total race distance
  isRaceComplete: boolean
  winner?: Player
  raceResults: Player[]
}

export class MultiplayerGameManager {
  private state: MultiplayerGameState
  private updateCallbacks: Set<(state: MultiplayerGameState) => void> = new Set()
  private gameLoop: NodeJS.Timeout | null = null
  private objectSpawnTimer: NodeJS.Timeout | null = null
  private raceTimer: NodeJS.Timeout | null = null
  private eventProcessingTimer: NodeJS.Timeout | null = null

  constructor(roomId: string) {
    this.state = {
      roomId,
      players: new Map(),
      gameObjects: [],
      gameSpeed: 2,
      isActive: false,
      startTime: null,
      lastObjectId: 0,
      raceEvents: [],
      raceDistance: 1000, // Race ends after 1000 distance units
      isRaceComplete: false,
      raceResults: [],
    }
  }

  // Player management
  addPlayer(
    player: Omit<
      Player,
      | "position"
      | "score"
      | "lives"
      | "isActive"
      | "lastUpdate"
      | "racePosition"
      | "totalDistance"
      | "collisions"
      | "tokensCollected"
      | "isFinished"
    >,
  ): Player {
    const newPlayer: Player = {
      ...player,
      position: 50, // center position
      score: 0,
      lives: 3,
      isActive: true,
      lastUpdate: Date.now(),
      racePosition: this.state.players.size + 1,
      totalDistance: 0,
      collisions: 0,
      tokensCollected: 0,
      isFinished: false,
    }

    this.state.players.set(player.id, newPlayer)
    this.updateRacePositions()
    this.notifyUpdate()
    return newPlayer
  }

  removePlayer(playerId: string): void {
    this.state.players.delete(playerId)
    this.updateRacePositions()
    this.notifyUpdate()
  }

  updatePlayerPosition(playerId: string, newPosition: number): void {
    const player = this.state.players.get(playerId)
    if (player && !player.isFinished) {
      player.position = Math.max(0, Math.min(92, newPosition))
      player.lastUpdate = Date.now()

      player.totalDistance += 0.5 // Small increment per movement

      this.updateRacePositions()
      this.notifyUpdate()
    }
  }

  private updateRacePositions(): void {
    const activePlayers = Array.from(this.state.players.values())
      .filter((p) => p.isActive)
      .sort((a, b) => {
        // Sort by: finished first, then by score, then by distance, then by fewer collisions
        if (a.isFinished && !b.isFinished) return -1
        if (!a.isFinished && b.isFinished) return 1
        if (a.isFinished && b.isFinished) return (a.finishTime || 0) - (b.finishTime || 0)

        if (a.score !== b.score) return b.score - a.score
        if (a.totalDistance !== b.totalDistance) return b.totalDistance - a.totalDistance
        return a.collisions - b.collisions
      })

    activePlayers.forEach((player, index) => {
      player.racePosition = index + 1
    })
  }

  // Game state management
  startGame(): void {
    if (this.state.players.size === 0) return

    this.state.isActive = true
    this.state.startTime = Date.now()
    this.state.gameSpeed = 2
    this.state.isRaceComplete = false
    this.state.raceEvents = []
    this.state.raceResults = []

    // Reset all players for new race
    this.state.players.forEach((player) => {
      player.score = 0
      player.lives = 3
      player.isActive = true
      player.totalDistance = 0
      player.collisions = 0
      player.tokensCollected = 0
      player.isFinished = false
      player.finishTime = undefined
    })

    // Start game loop
    this.gameLoop = setInterval(() => {
      this.updateGameState()
    }, 16) // ~60fps

    // Start object spawning
    this.objectSpawnTimer = setInterval(() => {
      this.spawnGameObject()
    }, 1200) // Spawn object every 1.2 seconds

    this.raceTimer = setInterval(() => {
      this.updateRaceProgress()
    }, 100) // Update race progress every 100ms

    this.eventProcessingTimer = setInterval(() => {
      this.processRaceEvents()
    }, 50) // Process events every 50ms

    this.notifyUpdate()
  }

  stopGame(): void {
    this.state.isActive = false

    if (this.gameLoop) {
      clearInterval(this.gameLoop)
      this.gameLoop = null
    }

    if (this.objectSpawnTimer) {
      clearInterval(this.objectSpawnTimer)
      this.objectSpawnTimer = null
    }

    if (this.raceTimer) {
      clearInterval(this.raceTimer)
      this.raceTimer = null
    }

    if (this.eventProcessingTimer) {
      clearInterval(this.eventProcessingTimer)
      this.eventProcessingTimer = null
    }

    this.finalizeRace()
    this.notifyUpdate()
  }

  private updateRaceProgress(): void {
    if (!this.state.isActive || this.state.isRaceComplete) return

    // Update distance for all active players
    this.state.players.forEach((player) => {
      if (player.isActive && !player.isFinished) {
        player.totalDistance += this.state.gameSpeed * 0.1

        // Check if player finished the race
        if (player.totalDistance >= this.state.raceDistance && !player.isFinished) {
          player.isFinished = true
          player.finishTime = Date.now()

          this.addRaceEvent({
            id: `finish_${player.id}_${Date.now()}`,
            type: "player_finished",
            playerId: player.id,
            timestamp: Date.now(),
            data: { finishTime: player.finishTime, position: player.racePosition },
          })
        }
      }
    })

    // Check if race is complete
    const activePlayers = Array.from(this.state.players.values()).filter((p) => p.isActive)
    const finishedPlayers = activePlayers.filter((p) => p.isFinished)

    if (finishedPlayers.length === activePlayers.length || finishedPlayers.length > 0) {
      // Race complete when all finish or after 30 seconds from first finish
      const firstFinishTime = Math.min(...finishedPlayers.map((p) => p.finishTime || Date.now()))
      if (Date.now() - firstFinishTime > 30000 || finishedPlayers.length === activePlayers.length) {
        this.completeRace()
      }
    }

    this.updateRacePositions()
  }

  private completeRace(): void {
    if (this.state.isRaceComplete) return

    this.state.isRaceComplete = true
    this.state.isActive = false

    // Finalize results
    const allPlayers = Array.from(this.state.players.values())
    this.state.raceResults = allPlayers.sort((a, b) => a.racePosition - b.racePosition)
    this.state.winner = this.state.raceResults[0]

    this.addRaceEvent({
      id: `race_complete_${Date.now()}`,
      type: "race_complete",
      playerId: this.state.winner?.id || "",
      timestamp: Date.now(),
      data: { winner: this.state.winner, results: this.state.raceResults },
    })

    this.stopGame()
  }

  private finalizeRace(): void {
    if (!this.state.isRaceComplete) {
      this.completeRace()
    }
  }

  private updateGameState(): void {
    if (!this.state.isActive) return

    // Move objects down
    this.state.gameObjects = this.state.gameObjects
      .map((obj) => ({ ...obj, y: obj.y + this.state.gameSpeed }))
      .filter((obj) => obj.y < 110) // Remove objects that are off screen

    // Check collisions for all players
    this.checkCollisions()

    // Increase game speed over time
    if (this.state.startTime) {
      const elapsed = Date.now() - this.state.startTime
      this.state.gameSpeed = Math.min(2 + elapsed / 30000, 4) // Max speed of 4
    }

    // Check if any players are still alive
    const alivePlayers = Array.from(this.state.players.values()).filter((p) => p.lives > 0 && p.isActive)
    if (alivePlayers.length === 0) {
      this.completeRace()
    }

    this.notifyUpdate()
  }

  private spawnGameObject(): void {
    if (!this.state.isActive) return

    const isToken = Math.random() > 0.65 // 35% chance for tokens
    const newObject: GameObject = {
      id: ++this.state.lastObjectId,
      x: Math.random() * 94, // Keep within track bounds
      y: -10,
      type: isToken ? "token" : "obstacle",
      roomId: this.state.roomId,
      spawnTime: Date.now(),
    }

    this.state.gameObjects.push(newObject)
  }

  private checkCollisions(): void {
    const PLAYER_WIDTH = 8
    const OBJECT_WIDTH = 6

    this.state.players.forEach((player, playerId) => {
      if (player.lives <= 0 || player.isFinished) return

      this.state.gameObjects = this.state.gameObjects.filter((obj) => {
        const objCenterX = obj.x + OBJECT_WIDTH / 2
        const playerCenterX = player.position + PLAYER_WIDTH / 2
        const distance = Math.abs(objCenterX - playerCenterX)

        // Check if object is at player level and close enough
        if (obj.y > 70 && obj.y < 90 && distance < (PLAYER_WIDTH + OBJECT_WIDTH) / 2) {
          if (obj.type === "token") {
            player.score += 10
            player.tokensCollected += 1

            this.addRaceEvent({
              id: `token_${playerId}_${obj.id}`,
              type: "token_collected",
              playerId,
              timestamp: Date.now(),
              data: { tokenId: obj.id, newScore: player.score },
            })

            return false // Remove token
          } else {
            player.lives -= 1
            player.collisions += 1

            this.addRaceEvent({
              id: `collision_${playerId}_${obj.id}`,
              type: "collision",
              playerId,
              timestamp: Date.now(),
              data: { obstacleId: obj.id, livesRemaining: player.lives },
            })

            if (player.lives <= 0) {
              player.isActive = false
            }
            return false // Remove obstacle
          }
        }
        return true
      })
    })
  }

  private addRaceEvent(event: RaceEvent): void {
    this.state.raceEvents.push(event)
    // Keep only recent events (last 100)
    if (this.state.raceEvents.length > 100) {
      this.state.raceEvents = this.state.raceEvents.slice(-100)
    }
  }

  private processRaceEvents(): void {
    // In a real implementation, this would handle event synchronization
    // For now, we just clean up old events
    const cutoff = Date.now() - 10000 // Keep events for 10 seconds
    this.state.raceEvents = this.state.raceEvents.filter((event) => event.timestamp > cutoff)
  }

  // Subscription management
  subscribe(callback: (state: MultiplayerGameState) => void): () => void {
    this.updateCallbacks.add(callback)
    return () => {
      this.updateCallbacks.delete(callback)
    }
  }

  private notifyUpdate(): void {
    this.updateCallbacks.forEach((callback) => {
      callback({ ...this.state })
    })
  }

  // Getters
  getState(): MultiplayerGameState {
    return { ...this.state }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.state.players.get(playerId)
  }

  getPlayers(): Player[] {
    return Array.from(this.state.players.values())
  }

  getRaceResults(): Player[] {
    return this.state.raceResults
  }

  getWinner(): Player | undefined {
    return this.state.winner
  }

  getRaceEvents(): RaceEvent[] {
    return this.state.raceEvents
  }

  isRaceComplete(): boolean {
    return this.state.isRaceComplete
  }

  // Cleanup
  destroy(): void {
    this.stopGame()
    this.updateCallbacks.clear()
  }
}

// Global game manager instances
const gameManagers = new Map<string, MultiplayerGameManager>()

export function getGameManager(roomId: string): MultiplayerGameManager {
  if (!gameManagers.has(roomId)) {
    gameManagers.set(roomId, new MultiplayerGameManager(roomId))
  }
  return gameManagers.get(roomId)!
}

export function destroyGameManager(roomId: string): void {
  const manager = gameManagers.get(roomId)
  if (manager) {
    manager.destroy()
    gameManagers.delete(roomId)
  }
}
