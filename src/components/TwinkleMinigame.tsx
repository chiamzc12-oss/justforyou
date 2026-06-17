import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface Item {
  id: number;
  x: number;
  y: number;
  emoji: string;
  speed: number;
}

export function TwinkleMinigame() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const containerRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  
  // Game State Refs (avoid render cycles for physics)
  const [basketX, setBasketX] = useState(50); // 0-100%
  const itemsRef = useRef<Item[]>([]);
  const [items, setItems] = useState<Item[]>([]); // for rendering

  // Physics Loop
  useEffect(() => {
    let tick: number;
    let spawnCount = 0;
    let isGameRunning = isPlaying && timeLeft > 0;

    const loop = () => {
      if (!isGameRunning) return;

      const containerHeight = containerRef.current?.clientHeight || 600;
      const basketRect = basketRef.current?.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();

      let currentItems = itemsRef.current;

      // Move items down
      currentItems = currentItems.map(item => ({
        ...item,
        y: item.y + item.speed
      }));

      // Check collision
      let newScore = 0;
      if (basketRect && containerRect) {
        // Compute basket pos relative to container
        const bLeft = basketRect.left - containerRect.left;
        const bRight = basketRect.right - containerRect.left;
        const bTop = basketRect.top - containerRect.top;

        currentItems = currentItems.filter(item => {
          // Approx dimensions of 3xl emoji text
          const itemRect = {
            left: item.x,
            right: item.x + 40,
            bottom: item.y + 40,
            centerX: item.x + 20,
          };

          const isCaught = 
            itemRect.bottom >= bTop &&
            itemRect.bottom <= bTop + 50 &&
            itemRect.centerX >= bLeft - 10 &&  // slightly forgivng hitbox
            itemRect.centerX <= bRight + 10;

          if (isCaught) {
            newScore++;
            return false; // remove
          }

          // remove if out of bounds (missed)
          if (item.y > containerHeight) {
             return false;
          }

          return true; // keep falling
        });
      }

      if (newScore > 0) setScore(s => s + newScore);

      // Spawning
      spawnCount++;
      if (spawnCount > 25) { // spawn interval
        spawnCount = 0;
        const emojis = ["🎂", "🎁", "🎈", "🎉", "🎀", "🧸", "🥳", "✨", "🍰"];
        const w = containerRect?.width || 500;
        currentItems.push({
          id: Math.random(),
          x: Math.random() * (w - 50),
          y: -50,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          speed: 3 + Math.random() * 5,
        });
      }

      itemsRef.current = currentItems;
      setItems(currentItems);

      tick = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      tick = requestAnimationFrame(loop);
    }
    return () => cancelAnimationFrame(tick);
  }, [isPlaying, timeLeft]);

  // Timer Countdown
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      t = setInterval(() => setTimeLeft(l => l - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
    return () => clearInterval(t);
  }, [isPlaying, timeLeft]);

  // Handle basket movement natively via pointer
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !isPlaying) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    x = Math.max(5, Math.min(95, x)); // keep inside edges
    setBasketX(x);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    itemsRef.current = [];
    setItems([]);
    setBasketX(50);
    setIsPlaying(true);
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] py-8 px-4 flex flex-col items-center">
      <h2 className="font-cute text-4xl text-primary-pink z-10 mb-2">
        Catch the Birthday Treats! 🎂
      </h2>
      <div className="mt-2 mb-4 flex justify-center gap-8 bg-white/60 backdrop-blur-md rounded-full px-8 py-3 w-max shadow-sm border border-pink-100 z-10">
         <div className="text-center">
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Score</p>
           <p className="font-cute text-3xl text-pink-500">{score}</p>
         </div>
         <div className="w-px bg-pink-200" />
         <div className="text-center">
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Time</p>
           <p className="font-cute text-3xl text-pink-500">{timeLeft}s</p>
         </div>
      </div>

      {!isPlaying && timeLeft === 30 && (
        <button 
          onClick={startGame} 
          className="z-10 mt-16 bg-gradient-to-r from-pink-400 to-primary-pink text-white font-cute text-2xl px-12 py-5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all transform active:scale-95"
        >
          Start Playing! ✨
        </button>
      )}

      {!isPlaying && timeLeft === 0 && (
        <div className="z-10 mt-16 text-center bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-4 border-pink-100">
          <p className="text-2xl font-cute text-primary-pink mb-2">Level Complete!</p>
          <p className="text-lg font-bold text-gray-600 mb-6">
            Wow! You caught {score} treats! Happy Birthday cutie! 🎁💖
          </p>
          <button 
            onClick={startGame} 
            className="bg-white border-2 border-primary-pink text-primary-pink font-cute text-xl px-10 py-3 rounded-full shadow-sm hover:bg-pink-50 transition-all active:scale-95"
          >
            Play Again
          </button>
        </div>
      )}

      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="flex-1 w-full max-w-2xl relative bg-white/40 rounded-3xl border-4 border-dashed border-pink-200 overflow-hidden shadow-inner cursor-none touch-none mt-2"
        style={{ touchAction: 'none' }} // Prevent scrolling on mobile while playing
      >
         {/* Falling Items */}
         {items.map(item => (
           <div 
             key={item.id} 
             style={{ transform: `translate(${item.x}px, ${item.y}px)` }}
             className="absolute top-0 left-0 text-3xl md:text-4xl select-none pointer-events-none drop-shadow-sm"
           >
             {item.emoji}
           </div>
         ))}

         {/* Player Basket */}
         {isPlaying && (
           <div 
              ref={basketRef}
              style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
              className="absolute bottom-6 text-[4rem] select-none scale-x-[1.2] drop-shadow-lg"
           >
              🧺
           </div>
         )}
         
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 text-[15rem]">
            🎂
         </div>
      </div>
    </div>
  );
}
