import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

export default function Game() {
    const gameRef = useRef<HTMLDivElement>(null)
    const phaserInstance = useRef<Phaser.Game | null>(null)

    useEffect(() => {
        if (!gameRef.current || phaserInstance.current) return

        let player: Phaser.Physics.Arcade.Sprite
        let obstacles: Phaser.Physics.Arcade.Group
        let cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined
        let nextObstacleTime = 0

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 400,
            parent: gameRef.current,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 900 }, // Un poco más de gravedad para caída rápida
                    debug: false
                }
            },
            scene: {
                preload: function (this: Phaser.Scene) {
                    // Fondo Espacial
                    const bgGraphic = this.make.graphics({ x: 0, y: 0 })
                    bgGraphic.fillStyle(0x0f172a, 1)
                    bgGraphic.fillRect(0, 0, 800, 400)
                    bgGraphic.generateTexture('background', 800, 400)

                    // Suelo
                    const groundGraphic = this.make.graphics({ x: 0, y: 0 })
                    groundGraphic.fillStyle(0x22c55e, 1)
                    groundGraphic.fillRect(0, 0, 800, 40)
                    groundGraphic.generateTexture('floor', 800, 40)

                    // Jugador (Cian)
                    const playerGraphic = this.make.graphics({ x: 0, y: 0 })
                    playerGraphic.fillStyle(0x06b6d4, 1)
                    playerGraphic.fillRect(0, 0, 32, 48)
                    playerGraphic.generateTexture('runner', 32, 48)

                    // Obstáculo / Enemigo (Rojo)
                    const obstacleGraphic = this.make.graphics({ x: 0, y: 0 })
                    obstacleGraphic.fillStyle(0xef4444, 1)
                    obstacleGraphic.fillRect(0, 0, 24, 40)
                    obstacleGraphic.generateTexture('enemy', 24, 40)
                },
                create: function (this: Phaser.Scene) {
                    this.add.image(400, 200, 'background')

                    const platforms = this.physics.add.staticGroup()
                    const ground = platforms.create(400, 380, 'floor') as Phaser.Physics.Arcade.Sprite
                    ground.refreshBody()

                    player = this.physics.add.sprite(100, 200, 'runner')
                    player.setBounce(0.05)
                    player.setCollideWorldBounds(true)

                    this.physics.add.collider(player, platforms)

                    // Creamos el grupo dinámico para los obstáculos
                    obstacles = this.physics.add.group()

                    // Si el jugador choca contra un obstáculo, llamamos a la función de reinicio
                    this.physics.add.collider(player, obstacles, () => {
                        this.scene.restart()
                    })

                    // Asegurar colisión de obstáculos con el piso
                    this.physics.add.collider(obstacles, platforms)

                    if (this.input.keyboard) {
                        cursors = this.input.keyboard.createCursorKeys()
                    }

                    // Resetear el temporizador al iniciar/reiniciar escena
                    nextObstacleTime = this.time.now + 1000
                },
                update: function (this: Phaser.Scene) {
                    if (!cursors || !player) return

                    // Mecánica de salto
                    const jumpPressed = cursors.up?.isDown || cursors.space?.isDown
                    const body = player.body as Phaser.Physics.Arcade.Body

                    if (jumpPressed && body && body.touching.down) {
                        player.setVelocityY(-480)
                    }

                    // Generación aleatoria de obstáculos por tiempo
                    if (this.time.now > nextObstacleTime) {
                        // Creamos un obstáculo justo afuera de la pantalla a la derecha
                        const obs = obstacles.create(850, 340, 'enemy') as Phaser.Physics.Arcade.Sprite

                        // Le damos velocidad hacia la izquierda (negativa en X)
                        obs.setVelocityX(-350)

                        // Evitamos que la gravedad o los choques lo empujen hacia abajo o lo roten
                        obs.setImmovable(true)
                        // Disable gravity on the obstacle body
                        const obsBody = obs.body as Phaser.Physics.Arcade.Body
                        obsBody.setAllowGravity(false)

                        // Programamos el siguiente obstáculo entre 1 y 2.5 segundos después
                        nextObstacleTime = this.time.now + Phaser.Math.Between(1000, 2500)
                    }

                    // Limpieza: Destruir obstáculos que ya pasaron de largo de la pantalla (X < -50)
                    obstacles.getChildren().forEach((obstacle) => {
                        const obs = obstacle as Phaser.Physics.Arcade.Sprite
                        if (obs.x < -50) {
                            obs.destroy()
                        }
                    })
                }
            }
        }

        phaserInstance.current = new Phaser.Game(config)

        return () => {
            if (phaserInstance.current) {
                phaserInstance.current.destroy(true)
                phaserInstance.current = null
            }
        }
    }, [])

    return (
        <section id="game-section" style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            <div
                ref={gameRef}
                style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
            />
        </section>
    )
}