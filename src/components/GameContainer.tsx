import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

export default function GameContainer() {
    const gameRef = useRef<HTMLDivElement>(null);
    const phaserInstance = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!gameRef.current || phaserInstance.current) return;

        // Configuración básica de Phaser 4
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: gameRef.current,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 300 },
                    debug: false
                }
            },
            scene: {
                preload: function (this: Phaser.Scene) {
                    // Aquí cargas tus assets (imágenes, sprites, etc.)
                    this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
                },
                create: function (this: Phaser.Scene) {
                    // Aquí creas los elementos del juego
                    this.add.image(400, 300, 'sky');

                    const text = this.add.text(400, 250, 'Runner X - Phaser 4 + React', {
                        fontSize: '32px',
                        color: '#ffffff'
                    });
                    text.setOrigin(0.5);
                },
                update: function (this: Phaser.Scene) {
                    // Lógica constante del juego (bucle principal)
                }
            }
        };

        // Inicializar el juego
        phaserInstance.current = new Phaser.Game(config);

        // Limpieza cuando el componente de React se desmonta
        return () => {
            if (phaserInstance.current) {
                phaserInstance.current.destroy(true);
                phaserInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-4 tracking-wider">RUNNER-X</h1>
            <div ref={gameRef} className="border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl" />
            <p className="mt-4 text-sm text-slate-400">Usa los controles para jugar</p>
        </div>
    );
}