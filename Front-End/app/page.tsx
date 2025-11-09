"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CustomCursor } from "@/components/CustomCursor";
import { ParticleEffect } from "@/components/ParticleEffect";
import { SoundButton } from "@/components/SoundButton";
import { ControlButton } from "@/components/ControlButton";

interface Particle {
  id: number;
  x: number;
  y: number;
}

export default function Home() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [trackPersonActive, setTrackPersonActive] = useState(false);
  const [gooningMachineActive, setGooningMachineActive] = useState(false);
  const particleIdRef = useRef(0);

  const wsRef = useRef<WebSocket | null>(null);

  // ---------------- WebSocket Setup ----------------
  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8765"); // make sure Python WS server is running

    wsRef.current.onopen = () => console.log("✅ WebSocket connected");
    wsRef.current.onclose = () => console.log("⚠️ WebSocket disconnected");
    wsRef.current.onerror = (err) => console.error("WebSocket error:", err);
    wsRef.current.onmessage = (msg) => console.log("Message from Python:", msg.data);

    return () => {
      wsRef.current?.close();
    };
  }, []);

  const sendCommand = useCallback((command: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(command);
      console.log("Sent command:", command);
    } else {
      console.warn("WebSocket not connected, cannot send:", command);
    }
  }, []);

  // ---------------- Particle Effects ----------------
  const handleButtonClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    setParticles([{ id: ++particleIdRef.current, x, y }]);
  }, []);

  const handleParticleComplete = useCallback((id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ---------------- Control Handlers ----------------
  const handleStop = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    handleButtonClick(e);
    sendCommand("stop");
    setTrackPersonActive(false);
    setGooningMachineActive(false);
  }, [handleButtonClick, sendCommand]);

  const handleTrackPerson = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    handleButtonClick(e);
    sendCommand("track");
    setTrackPersonActive((prev) => !prev);
    setGooningMachineActive(false);
  }, [handleButtonClick, sendCommand]);

  const handleGooningMachine = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    handleButtonClick(e);
    sendCommand("scan");
    setGooningMachineActive((prev) => !prev);
    setTrackPersonActive(false);
  }, [handleButtonClick, sendCommand]);

  // ---------------- Render ----------------
  return (
    <main className="custom-cursor min-h-screen relative overflow-hidden bg-black">
      <CustomCursor />
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col justify-end">
        <div className="pb-4 px-4 md:px-6 space-y-2.5">
          <div className="mb-3">
            <h1 className="text-xl md:text-2xl font-light text-white/80">The Goon Chair</h1>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {[...Array(10)].map((_, i) => (
              <SoundButton key={i} label={`Sound ${i + 1}`} onPlay={handleButtonClick} />
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            <ControlButton label="Stop" onClick={handleStop} />
            <ControlButton
              label="Track Person"
              onClick={handleTrackPerson}
              active={trackPersonActive}
            />
            <ControlButton
              label="Gooning Machine"
              onClick={handleGooningMachine}
              active={gooningMachineActive}
            />
          </div>
        </div>
      </div>

      {particles.map((particle) => (
        <ParticleEffect
          key={particle.id}
          id={particle.id}
          x={particle.x}
          y={particle.y}
          onComplete={() => handleParticleComplete(particle.id)}
        />
      ))}
    </main>
  );
}
