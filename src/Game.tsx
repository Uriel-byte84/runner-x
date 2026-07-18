import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

export default function Game() {
    const gameRef = useRef<HTMLDivElement>(null)
    const phaserInstance = useRef<Phaser.Game | null>(null)

    useEffect(() => {
        if (!gameRef.current || phaserInstance.current) return

        // Tipamos correctamente el jugador con su tipo de cuerpo dinámico de Arcade
        let player: Phaser.Physics.Arcade.Sprite
        let cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined

        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 400,
            parent: gameRef.current,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 800 },
                    debug: false
                }
            },
            scene: {
                preload: function (this: Phaser.Scene) {
                    // Fondo Espacial (Azul oscuro)
                    const bgGraphic = this.make.graphics({ x: 0, y: 0 })
                    bgGraphic.fillStyle(0x0f172a, 1)
                    bgGraphic.fillRect(0, 0, 800, 400)
                    bgGraphic.generateTexture('background', 800, 400)
                    bgGraphic.destroy()

                    // El Suelo (Verde)
                    const groundGraphic = this.make.graphics({ x: 0, y: 0 })
                    groundGraphic.fillStyle(0x22c55e, 1)
                    groundGraphic.fillRect(0, 0, 800, 40)
                    groundGraphic.generateTexture('floor', 800, 40)
                    groundGraphic.destroy()

                    // El Jugador / Runner (Cian)
                    const playerGraphic = this.make.graphics({ x: 0, y: 0 })
                    playerGraphic.fillStyle(0x06b6d4, 1)
                    playerGraphic.fillRect(0, 0, 32, 48)
                    playerGraphic.generateTexture('runner', 32, 48)
                    playerGraphic.destroy()
                },
                create: function (this: Phaser.Scene) {
                    this.add.image(400, 200, 'background')

                    const platforms = this.physics.add.staticGroup()
                    const ground = platforms.create(400, 380, 'floor') as Phaser.Physics.Arcade.Sprite
                    ground.refreshBody()

                    player = this.physics.add.sprite(100, 200, 'runner')

                    player.setBounce(0.1)
                    player.setCollideWorldBounds(true)

                    this.physics.add.collider(player, platforms)

                    if (this.input.keyboard) {
                        cursors = this.input.keyboard.createCursorKeys()
                    }
                },
                update: function (this: Phaser.Scene) {
                    if (!cursors || !player) return

                    const jumpPressed = cursors.up?.isDown || cursors.space?.isDown

                    // Forzamos a TypeScript a reconocer el cuerpo como Arcade Body para leer .touching
                    const body = player.body as Phaser.Physics.Arcade.Body

                    if (jumpPressed && body && body.touching.down) {
                        player.setVelocityY(-450)
                    }
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