"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Download, Share2, Camera } from "lucide-react";
import { motion } from "framer-motion";

interface ExportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  streakDays: number;
  pagesRead: number;
}

export default function ExportCardModal({ isOpen, onClose, username, streakDays, pagesRead }: ExportCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imgDataUrl, setImgDataUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      drawCanvas();
    }
  }, [isOpen, username, streakDays, pagesRead]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Instagram Story dimension
    canvas.width = 1080;
    canvas.height = 1920;

    // Background Gradient (Emerald to Dark)
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, "#064e3b"); // emerald-900
    grd.addColorStop(1, "#020617"); // slate-950
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative circles
    ctx.beginPath();
    ctx.arc(900, 200, 300, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(16, 185, 129, 0.1)"; // emerald-500/10
    ctx.fill();

    ctx.beginPath();
    ctx.arc(150, 1600, 400, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(217, 119, 6, 0.1)"; // amber-500/10
    ctx.fill();

    // App Branding
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("JVC QURANIC SUPERAPP", canvas.width / 2, 200);
    
    ctx.fillStyle = "#10b981"; // emerald-500
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("ENTERPRISE ECOSYSTEM", canvas.width / 2, 260);

    // User greeting
    ctx.fillStyle = "#e4e4e7"; // zinc-200
    ctx.font = "60px sans-serif";
    ctx.fillText(`Alhamdulillah, ${username}`, canvas.width / 2, 500);
    ctx.font = "bold 80px sans-serif";
    ctx.fillText("Telah Istiqomah Hari Ini", canvas.width / 2, 600);

    // Cards for Stats
    const drawStatCard = (y: number, title: string, value: string, highlightColor: string) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
      ctx.lineWidth = 4;
      ctx.roundRect(140, y, 800, 250, 40);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "bold 45px sans-serif";
      ctx.fillText(title.toUpperCase(), canvas.width / 2, y + 80);

      ctx.fillStyle = highlightColor;
      ctx.font = "bold 100px sans-serif";
      ctx.fillText(value, canvas.width / 2, y + 190);
    };

    drawStatCard(800, "Worship Streak", `${streakDays} Hari`, "#f59e0b"); // amber-500
    drawStatCard(1100, "Tilawah Hari Ini", `${pagesRead} Halaman`, "#10b981"); // emerald-500

    // Footer
    ctx.fillStyle = "#71717a";
    ctx.font = "40px sans-serif";
    ctx.fillText("Mari bergabung dan tingkatkan ibadah bersama", canvas.width / 2, 1700);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 40px sans-serif";
    ctx.fillText("Download sekarang di Play Store & App Store", canvas.width / 2, 1760);

    // Convert to image
    setImgDataUrl(canvas.toDataURL("image/png"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-emerald-900/50 rounded-3xl p-6 w-full max-w-4xl flex flex-col md:flex-row gap-8 relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors z-10"
        >
          <X className="w-6 h-6 text-zinc-400" />
        </button>

        {/* Left: Preview */}
        <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
          <h3 className="text-lg font-bold text-white text-center">Preview Kartu</h3>
          <div className="w-full aspect-[9/16] bg-black rounded-2xl border border-zinc-800 overflow-hidden relative shadow-2xl">
            {/* Hidden canvas used for rendering */}
            <canvas ref={canvasRef} className="hidden" />
            {imgDataUrl ? (
              <img src={imgDataUrl} alt="Export Card" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 animate-pulse">
                Memproses Gambar...
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="w-full md:w-1/2 flex flex-col justify-center gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Bagikan Inspirasi</h2>
            <p className="text-zinc-400 text-sm">
              Syiarkan semangat ibadah Anda ke teman-teman di media sosial. Kartu ini dibuat otomatis berdasarkan data ibadah harian Anda (Worship Tracker).
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <a 
              href={imgDataUrl}
              download={`JVC-Worship-Card-${username}.png`}
              className="flex items-center justify-center gap-3 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Gambar (PNG)
            </a>
            
            <button 
              onClick={() => {
                if (navigator.share) {
                  fetch(imgDataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                      const file = new File([blob], "worship-card.png", { type: "image/png" });
                      navigator.share({
                        title: "JVC Quranic SuperApp",
                        text: `Alhamdulillah saya sudah mencapai streak ${streakDays} hari!`,
                        files: [file]
                      });
                    });
                } else {
                  alert("Browser Anda tidak mendukung fitur Web Share API. Silakan download gambar secara manual.");
                }
              }}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
            >
              <Share2 className="w-5 h-5" />
              Share Langsung (Web Share)
            </button>

            <button 
              onClick={() => alert("Fitur auto-post ke Instagram Graph API sedang dalam pengembangan untuk Enterprise versi selanjutnya.")}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 hover:opacity-90 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-pink-900/30 mt-2"
            >
              <Camera className="w-5 h-5" />
              Post ke Instagram Story
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
