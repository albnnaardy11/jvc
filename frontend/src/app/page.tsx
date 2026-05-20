"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  BookOpen, 
  Mic, 
  MapPin, 
  Flame, 
  Shield, 
  Award, 
  Search, 
  Compass, 
  Users, 
  CheckCircle, 
  Calendar, 
  ChevronRight, 
  Play, 
  Volume2, 
  Sparkles, 
  Clock, 
  User, 
  Activity, 
  Briefcase,
  AlertTriangle,
  Send,
  VolumeX,
  Share2,
  Tv,
  Check,
  SearchCheck,
  Map,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom UI Colors:
// - Gold: #D4AF37
// - Emerald: #10B981
// - Dark Obsidian: #050505

export default function Home() {
  // Navigation & Role states
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [role, setRole] = useState<"USER" | "USTADZ" | "DKM">("USER");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string>("");
  const [display_name, setDisplayName] = useState<string>("");
  const [streakDays, setStreakDays] = useState<number>(5);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Dashboard & Worship Tracker state
  const [juzMode, setJuzMode] = useState<boolean>(true); // true = Juz Mode (30 Days), false = Manzil Mode (7 Days)
  const [pagesReadToday, setPagesReadToday] = useState<number>(6);
  const [dailyTarget, setDailyTarget] = useState<number>(20); // 20 pages = 1 Juz
  const [loggedActivities, setLoggedActivities] = useState<any[]>([
    { id: 1, type: "TILAWAH", value: 6, time: "10:30" },
    { id: 2, type: "JAMAAH", value: 1, time: "12:15" },
    { id: 3, type: "SEDEKAH", value: 50000, time: "13:00" },
  ]);

  // Setoran Submission state
  const [selectedSurah, setSelectedSurah] = useState<string>("Al-Fatihah");
  const [startAyah, setStartAyah] = useState<number>(1);
  const [endAyah, setEndAyah] = useState<number>(7);
  const [structuralScope, setStructuralScope] = useState<string>("Ruku");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  
  // Ustadz Review Studio state
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [ustadzFeedback, setUstadzFeedback] = useState<string>("");
  
  // Real Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      if (role === "USTADZ") {
        fetchPendingReviews();
      } else if (role === "USER") {
        fetchUserHistory();
      }
    }
  }, [role, activeTab, isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const formData = new FormData();
      formData.append("username", loginEmail);
      formData.append("password", loginPassword);
      
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        body: formData
      });
      
      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();
      
      setAuthToken(data.access_token);
      
      // Ambil profil asli user
      const meRes = await fetch("http://localhost:8000/api/v1/auth/me", {
        headers: { "Authorization": `Bearer ${data.access_token}` }
      });
      
      if (meRes.ok) {
        const meData = await meRes.json();
        setDisplayName(meData.display_name);
        setRole(meData.role as any);
        setIsLoggedIn(true);
      }
    } catch (err) {
      alert("Login gagal. Pastikan email dan password benar.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/setoran/pending/all", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((d: any) => ({
          id: d.id,
          murid: "Murid #" + d.murid_id.toString().substring(0,4),
          surah: `Surah (Ayah ${d.start_ayah_id}-${d.end_ayah_id})`,
          range: `Ayah ${d.start_ayah_id}-${d.end_ayah_id}`,
          submitted: new Date(d.created_at).toLocaleTimeString(),
          audioUrl: "http://localhost:8000" + d.audio_url,
          aiScore: d.ai_analysis?.confidence_score || 0,
          status: d.status,
          anomalies: d.ai_analysis?.waveform_metadata?.anomalies?.map((a:any) => ({
            word: `Indeks Kata ${a.word_index}`,
            error: a.error_type,
            type: "warning",
            suggestion: "Perhatikan makhraj di detik " + a.timestamp
          })) || []
        }));
        setReviews(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch pending reviews", err);
    }
  };

  const fetchUserHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/setoran/history", {
         headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        setHistory(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleUstadzReview = async (isApproved: boolean) => {
    if (!selectedSubmissionId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/setoran/${selectedSubmissionId}/review`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          is_approved: isApproved,
          ustadz_feedback: ustadzFeedback
        })
      });
      if (res.ok) {
        alert(isApproved ? "Setoran Disetujui (Approved)!" : "Setoran Dikembalikan (Rejected).");
        setReviews(reviews.filter(r => r.id !== selectedSubmissionId));
        setSelectedSubmissionId(null);
        setUstadzFeedback("");
      } else {
        alert("Gagal menyimpan review Ustadz.");
      }
    } catch (err) {
      console.error(err);
      alert("Error menghubungi server.");
    }
  };

  // Simulated recording timer
  let timerInterval = useRef<any>(null);
  useEffect(() => {
    if (isRecording) {
      timerInterval.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      setRecordingSeconds(0);
    }
    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    setAnalysisResult(null);
    audioChunksRef.current = [];
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Gunakan Opus codec demi efisiensi dan ukuran file terkecil
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Microphone permission denied or error:", err);
      setIsRecording(false);
      alert("Akses microphone ditolak atau terjadi error. Mohon izinkan akses microphone.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        setIsAnalyzing(true);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        
        // Siapkan payload form-data untuk dikirim ke backend
        const formData = new FormData();
        formData.append("start_ayah_id", startAyah.toString());
        formData.append("end_ayah_id", endAyah.toString());
        formData.append("audio_file", audioBlob, "setoran.webm");

        try {
          // Asumsi FastAPI berjalan di localhost:8000
          const res = await fetch("http://localhost:8000/api/v1/setoran/submit", {
            method: "POST",
            body: formData,
            headers: {
              "Authorization": `Bearer ${authToken}`
            }
          });
          
          if (!res.ok) {
            const errDetail = await res.json();
            throw new Error(errDetail.detail || "API Upload Failed");
          }
          
          const data = await res.json();
          setIsAnalyzing(false);
          
          // Refresh user history table
          fetchUserHistory();
          
          // Tampilkan hasil nyata dari FastAPI -> Groq STT
          setAnalysisResult({
            confidenceScore: data.ai_confidence_score || 95.0,
            totalAyahs: endAyah - startAyah + 1,
            successMessage: "Transkripsi berhasil diproses oleh Groq LPU: " + data.message,
            anomalies: [
              { 
                ayah: startAyah, 
                word: "Hasil Transkripsi Groq:", 
                errorType: "Makhraj (Teks STT)", 
                timestamp: 0.0, 
                suggestion: `"${data.waveform_metadata?.transcription_text || "Teks tidak tersedia"}"`
              }
            ]
          });
          
          setStreakDays(prev => prev + 1);
        } catch (err: any) {
          console.error("Upload error:", err);
          setIsAnalyzing(false);
          alert(`Gagal mengirim audio ke server FastAPI. Error: ${err.message}`);
        }
        
        // Hentikan stream dari microphone setelah selesai
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.stop();
    }
  };

  const logDailyWorship = (type: string, amount: number) => {
    const newAct = {
      id: Date.now(),
      type: type,
      value: amount,
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    setLoggedActivities([newAct, ...loggedActivities]);
    if (type === "TILAWAH") {
      setPagesReadToday(prev => Math.min(prev + amount, dailyTarget));
    }
  };

  const triggerSparingMatch = () => {
    setSparingStatus("searching");
    setTimeout(() => {
      setOpponent({
        name: "Yusuf Al-Qordowi",
        origin: "DKI Jakarta",
        rating: 1420,
        avatar: "/avatar-opp.jpg",
        streak: 12
      });
      setSparingStatus("matched");
      
      // Start game
      setTimeout(() => {
        setSparingStatus("gameplay");
        setSparingTimer(15);
      }, 3000);
    }, 2500);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Dynamic Background Glowing Blobs */}
        <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[600px] h-[600px] rounded-full bg-amber-950/25 blur-[120px] pointer-events-none z-0" />

        <div className="bg-[#0a0a0a] border border-emerald-900/30 p-8 rounded-3xl w-full max-w-md shadow-2xl shadow-emerald-900/20 z-10 relative">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">JVC SuperApp</h1>
              <p className="text-zinc-500 text-sm mt-1">Enterprise Production Edition</p>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Akun</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="bg-[#050505] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="user@example.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="bg-[#050505] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isLoggingIn} className="mt-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              {isLoggingIn ? "Memverifikasi Kredensial..." : "Masuk (Secure Login)"}
            </button>
            <p className="text-center text-xs text-zinc-600 mt-2">Ditenagai oleh Supabase & JWT Auth</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ededed] font-sans flex flex-col relative overflow-hidden">
      
      {/* Dynamic Background Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-emerald-950/20 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[600px] h-[600px] rounded-full bg-amber-950/25 blur-[120px] pointer-events-none z-0" />

      {/* TOP HEADER: Branding, Streaks, and Role Switching */}
      <header className="border-b border-emerald-900/30 bg-[#080808]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-100 to-amber-300 bg-clip-text text-transparent">
              JVC QURANIC SUPERAPP
            </h1>
            <p className="text-xs text-emerald-500/70 font-semibold tracking-wider uppercase">Enterprise Ecosystem</p>
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex items-center gap-4">
          {/* Active streak */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full shadow-inner">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="text-sm font-extrabold text-amber-400">{streakDays} HARI STREAK</span>
          </div>

          {/* Role selector dropdown */}
          <div className="flex items-center bg-[#111] border border-emerald-500/20 rounded-xl p-1 shadow-md">
            <button 
              onClick={() => { setRole("USER"); setActiveTab("dashboard"); }} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${role === "USER" ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/30" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              Murid
            </button>
            <button 
              onClick={() => { setRole("USTADZ"); setActiveTab("setoran"); }} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${role === "USTADZ" ? "bg-amber-600 text-white shadow-md shadow-amber-700/30" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              Ustadz
            </button>
            <button 
              onClick={() => { setRole("DKM"); setActiveTab("talent"); }} 
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${role === "DKM" ? "bg-teal-600 text-white shadow-md shadow-teal-700/30" : "text-zinc-400 hover:text-zinc-200"}`}
            >
              DKM
            </button>
          </div>

          <div className="w-10 h-10 rounded-full border border-emerald-500/30 overflow-hidden flex items-center justify-center bg-zinc-950">
            <User className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <div className="flex flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 gap-6 relative z-10">
        
        {/* SIDEBAR FOR DESKTOP */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#0a0a0a]/90 border border-emerald-950/60 rounded-2xl p-4 gap-2 h-fit shrink-0 backdrop-blur-sm">
          <div className="px-3 py-2 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Menu Navigation ({role})
          </div>

          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "dashboard" ? "bg-gradient-to-r from-emerald-950 to-emerald-900/40 text-emerald-300 border-l-4 border-emerald-500" : "text-zinc-400 hover:bg-[#111] hover:text-zinc-200"}`}
          >
            <Activity className="w-5 h-5" />
            Worship Dashboard
          </button>

          <button 
            onClick={() => setActiveTab("setoran")}
            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "setoran" ? "bg-gradient-to-r from-emerald-950 to-emerald-900/40 text-emerald-300 border-l-4 border-emerald-500" : "text-zinc-400 hover:bg-[#111] hover:text-zinc-200"}`}
          >
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5" />
              <span>{role === "USTADZ" ? "Ustadz Review" : "Hybrid Setoran"}</span>
            </div>
            {role === "USTADZ" && (
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
            )}
          </button>

          <button 
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "map" ? "bg-gradient-to-r from-emerald-950 to-emerald-900/40 text-emerald-300 border-l-4 border-emerald-500" : "text-zinc-400 hover:bg-[#111] hover:text-zinc-200"}`}
          >
            <MapPin className="w-5 h-5" />
            Mosque Explorer
          </button>

          <button 
            onClick={() => setActiveTab("sparing")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "sparing" ? "bg-gradient-to-r from-emerald-950 to-emerald-900/40 text-emerald-300 border-l-4 border-emerald-500" : "text-zinc-400 hover:bg-[#111] hover:text-zinc-200"}`}
          >
            <Users className="w-5 h-5" />
            Sparing Tilawah
          </button>

          <button 
            onClick={() => setActiveTab("talent")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === "talent" ? "bg-gradient-to-r from-emerald-950 to-emerald-900/40 text-emerald-300 border-l-4 border-emerald-500" : "text-zinc-400 hover:bg-[#111] hover:text-zinc-200"}`}
          >
            <Briefcase className="w-5 h-5" />
            Muazin & Imam Hub
          </button>

          {/* DKM Exclusive settings card */}
          {role === "DKM" && (
            <div className="mt-6 border border-teal-500/20 bg-teal-950/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-teal-300 uppercase">DKM Panel</span>
              </div>
              <p className="text-xs text-teal-400/80 mb-3">Kelola kebutuhan operasional, volunteer muazin, serta laporan kas masjid digital.</p>
              <div className="text-sm font-bold text-teal-200 flex justify-between items-center bg-[#070707] p-2 rounded-lg border border-teal-500/10">
                <span>Saldo DKM</span>
                <span>{selectedMosque.dkm_wallet}</span>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN BODY OF PAGE */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: WORSHIP DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                {/* Greeting Hero card */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-[#0a2f1d] to-[#071d13] p-6 md:p-8 border border-emerald-800/40 shadow-xl shadow-emerald-950/50">
                  <div className="absolute right-0 top-0 w-1/3 h-full pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-200 via-emerald-400 to-transparent" />
                  <div className="flex flex-col gap-3 max-w-lg">
                    <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/20 px-3 py-1 rounded-full w-fit">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-300 uppercase">Kurikulum Madinah Standard</span>
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Assalamu&apos;alaikum, {display_name} 👋</h2>
                    <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
                      &ldquo;Sebaik-baik kalian adalah orang yang belajar Al-Qur&apos;an dan mengajarkannya.&rdquo; Hari ini, mari tingkatkan hafalan mushaf Madinah.
                    </p>
                  </div>
                </div>

                {/* The Worship Tracker / Strava Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Progress Ring & Target Toggles */}
                  <div className="md:col-span-1 bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col items-center justify-between text-center gap-4">
                    <div className="w-full flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Worship Tracker</h3>
                      {/* Juz/Manzil Mode Toggle */}
                      <button 
                        onClick={() => {
                          setJuzMode(!juzMode);
                          setDailyTarget(juzMode ? 86 : 20); // 1 Manzil is ~86 pages, 1 Juz is 20 pages
                        }}
                        className="text-xs bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl font-bold text-emerald-300 hover:bg-emerald-900/50 transition-colors"
                      >
                        {juzMode ? "Mode Juz (30 Hari)" : "Mode Manzil (7 Hari)"}
                      </button>
                    </div>

                    {/* Circular Progress Bar */}
                    <div className="relative w-40 h-40 flex items-center justify-center mt-2">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" strokeWidth="8" stroke="#112d1e" fill="transparent" />
                        <circle 
                          cx="80" 
                          cy="80" 
                          r="70" 
                          strokeWidth="10" 
                          stroke="#10b981" 
                          fill="transparent" 
                          strokeDasharray={440}
                          strokeDashoffset={440 - (440 * (pagesReadToday / dailyTarget))}
                          strokeLinecap="round"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-extrabold text-white">{pagesReadToday}</span>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">dari {dailyTarget} Halaman</span>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400/80 mt-1 italic">
                      {juzMode ? "Target: 1 Juz per hari untuk Khatam 30 hari." : "Target: 1 Manzil per hari untuk Khatam 7 hari."}
                    </div>
                  </div>

                  {/* Right Column: Log Activity Form & aggregates */}
                  <div className="md:col-span-2 bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Quick Log Worship</h3>
                    
                    {/* Log buttons */}
                    <div className="grid grid-cols-3 gap-4">
                      
                      {/* Read Quran */}
                      <button 
                        onClick={() => logDailyWorship("TILAWAH", 2)}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-900/20 bg-emerald-950/10 hover:bg-emerald-950/30 hover:border-emerald-500/30 transition-all text-center gap-2 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white">Tilawah Al-Quran</span>
                        <span className="text-[10px] text-emerald-400">+2 Halaman</span>
                      </button>

                      {/* Prayer at Mosque */}
                      <button 
                        onClick={() => logDailyWorship("JAMAAH", 1)}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-900/20 bg-emerald-950/10 hover:bg-emerald-950/30 hover:border-emerald-500/30 transition-all text-center gap-2 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white">Shalat Jamaah</span>
                        <span className="text-[10px] text-emerald-400">Di Masjid</span>
                      </button>

                      {/* Sedekah / Charity */}
                      <button 
                        onClick={() => logDailyWorship("SEDEKAH", 10000)}
                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-900/20 bg-emerald-950/10 hover:bg-emerald-950/30 hover:border-emerald-500/30 transition-all text-center gap-2 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                          <Award className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white">Infaq & Sedekah</span>
                        <span className="text-[10px] text-emerald-400">Rp 10.000</span>
                      </button>

                    </div>

                    {/* Stats feed showing recent activities logged */}
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Aktivitas Hari Ini</span>
                      <div className="max-h-24 overflow-y-auto flex flex-col gap-1.5 pr-2">
                        {loggedActivities.map((act) => (
                          <div key={act.id} className="flex justify-between items-center bg-zinc-950/80 px-3 py-2 rounded-lg border border-zinc-900 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="font-bold text-zinc-300">
                                {act.type === "TILAWAH" && `Membaca ${act.value} Halaman Al-Quran`}
                                {act.type === "JAMAAH" && `Shalat Jamaah 5 Waktu`}
                                {act.type === "SEDEKAH" && `Sedekah Digital Rp ${act.value.toLocaleString("id-ID")}`}
                              </span>
                            </div>
                            <span className="text-zinc-500">{act.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Row: Deen Feed & Mosque Event widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Deen Feed - Strava Social */}
                  <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Deen-Feed (Teman)</h3>
                      </div>
                      <span className="text-xs text-zinc-500 font-bold">Terbaru</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="bg-[#050505] p-3.5 rounded-xl border border-emerald-900/10 flex gap-3 text-xs">
                        <div className="w-9 h-9 rounded-full bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-bold">
                          AH
                        </div>
                        <div className="flex flex-col gap-1.5 w-full">
                          <div className="flex justify-between">
                            <span className="font-bold text-white">Ahmad Hanafi</span>
                            <span className="text-zinc-500">12m</span>
                          </div>
                          <p className="text-zinc-400">Baru saja menyelesaikan hafalan **Juz 30 (An-Naba s/d An-Nas)**! 🚀</p>
                          <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-semibold w-fit">
                            <Award className="w-3.5 h-3.5" />
                            AI Verified Setoran - 94.8% Akurasi
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#050505] p-3.5 rounded-xl border border-emerald-900/10 flex gap-3 text-xs">
                        <div className="w-9 h-9 rounded-full bg-emerald-900/30 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400 font-bold">
                          YR
                        </div>
                        <div className="flex flex-col gap-1.5 w-full">
                          <div className="flex justify-between">
                            <span className="font-bold text-white">Yusuf Rahman</span>
                            <span className="text-zinc-500">1 jam lalu</span>
                          </div>
                          <p className="text-zinc-400">Check-in Shalat Shubuh Jamaah di **Masjid Raya Bandung**! 🕌</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mosque Radar & Kajian */}
                  <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Radar Masjid Terdekat</h3>
                    </div>

                    <div className="bg-[#050505] border border-emerald-900/10 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-bold text-white">{selectedMosque.name}</h4>
                        <p className="text-xs text-zinc-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {selectedMosque.coordinate}
                        </p>
                        <div className="text-xs text-amber-400 font-bold mt-2 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Kajian Hari Ini: {selectedMosque.kajian}
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab("map")}
                        className="bg-emerald-600/10 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-400 hover:bg-emerald-600/20 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* DKM Volunteer board mock */}
                    <div className="border border-amber-500/10 bg-amber-500/5 p-3 rounded-xl text-xs text-amber-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Dibutuhkan: **Muazin Shalat Dzuhur**</span>
                      </div>
                      <button 
                        onClick={() => setActiveTab("talent")}
                        className="text-[10px] bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 font-bold px-2 py-1 rounded"
                      >
                        Daftar
                      </button>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB 2: HYBRID SETORAN OR USTADZ REVIEW STUDIO */}
            {activeTab === "setoran" && (
              <motion.div 
                key="setoran"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                
                {role === "USER" ? (
                  /* USER/MURID: SUBMIT SETORAN */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Submission Setup form */}
                    <div className="lg:col-span-1 bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-5 h-fit">
                      <div className="flex items-center gap-2 mb-2">
                        <Mic className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Form Setoran Hafalan</h3>
                      </div>

                      {/* Surah selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Surah</label>
                        <select 
                          value={selectedSurah}
                          onChange={(e) => setSelectedSurah(e.target.value)}
                          className="bg-zinc-950 border border-emerald-900/30 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Al-Fatihah">Al-Fatihah</option>
                          <option value="Al-Baqarah">Al-Baqarah</option>
                          <option value="An-Naba">An-Naba</option>
                          <option value="Al-Mulk">Al-Mulk</option>
                        </select>
                      </div>

                      {/* Ayah Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Dari Ayah</label>
                          <input 
                            type="number" 
                            value={startAyah}
                            onChange={(e) => setStartAyah(Math.max(1, parseInt(e.target.value) || 1))}
                            className="bg-zinc-950 border border-emerald-900/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Sampai Ayah</label>
                          <input 
                            type="number" 
                            value={endAyah}
                            onChange={(e) => setEndAyah(Math.max(startAyah, parseInt(e.target.value) || startAyah))}
                            className="bg-zinc-950 border border-emerald-900/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Scope select */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Cakupan Struktur (Mushaf Madinah)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {["Ruku", "Hizb", "Maqra"].map((s) => (
                            <button
                              key={s}
                              onClick={() => setStructuralScope(s)}
                              className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${structuralScope === s ? "bg-emerald-600/10 border-emerald-500 text-emerald-400" : "bg-zinc-950 border-zinc-900 text-zinc-400"}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Smart stopping recommendation box */}
                      <div className="border border-emerald-500/20 bg-emerald-950/20 rounded-xl p-3 flex gap-2.5">
                        <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div className="flex flex-col gap-0.5 text-xs text-emerald-300">
                          <span className="font-bold">Smart Stopping (Koreksi Ruku&apos;)</span>
                          <p className="text-[10px] text-emerald-400/80 leading-normal">AI mendeteksi batas ini berakhir di akhir kalimat yang bermakna lengkap (Ruku&apos; 1). Bagus!</p>
                        </div>
                      </div>
                    </div>

                    {/* Audio recorder & AI evaluation panel */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      
                      {/* The Recorder Interface */}
                      <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-6 min-h-[280px]">
                        
                        {!isRecording && !isAnalyzing && !analysisResult && (
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                              <Mic className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold">Siap Mengambil Setoran</h4>
                            <p className="text-zinc-500 text-xs max-w-xs">Pastikan mikrofon aktif dan berada di tempat tenang. Ucapkan Ta&apos;awudz sebelum mulai.</p>
                            <button 
                              onClick={handleStartRecording}
                              className="mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-xs"
                            >
                              Mulai Rekam Suara (Record)
                            </button>
                          </div>
                        )}

                        {isRecording && (
                          <div className="flex flex-col items-center gap-5 w-full">
                            {/* Animated sound wave bars */}
                            <div className="flex items-end justify-center gap-1 h-12 w-48">
                              {[...Array(12)].map((_, i) => (
                                <motion.div 
                                  key={i}
                                  animate={{ height: [12, Math.random() * 48 + 12, 12] }}
                                  transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5 }}
                                  className="w-1.5 bg-emerald-500 rounded-full"
                                />
                              ))}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-red-500 text-xs font-bold uppercase tracking-wider animate-pulse flex items-center justify-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-600" />
                                Merekam Audio...
                              </span>
                              <span className="text-3xl font-extrabold text-white">00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                            </div>
                            <button 
                              onClick={handleStopRecording}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-xs"
                            >
                              Hentikan & Kirim Ke AI
                            </button>
                          </div>
                        )}

                        {isAnalyzing && (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                            <div className="flex flex-col gap-1">
                              <h5 className="font-bold">Menganalisis Makhraj & Tajwid</h5>
                              <p className="text-zinc-500 text-xs">Model Groq LPU (Whisper-v3) mendeteksi intonasi dan tajwid secara real-time...</p>
                            </div>
                          </div>
                        )}

                        {analysisResult && (
                          <div className="w-full text-left flex flex-col gap-4">
                            <div className="flex justify-between items-center border-b border-emerald-950 pb-3">
                              <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-400" />
                                <span className="font-bold text-sm text-zinc-300">Hasil Evaluasi Groq AI</span>
                              </div>
                              <div className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-xs text-emerald-400 font-extrabold">
                                Akurasi: {analysisResult.confidenceScore}%
                              </div>
                            </div>
                            
                            <p className="text-xs text-emerald-400/90 leading-relaxed bg-emerald-950/20 border border-emerald-500/15 p-3 rounded-xl">
                              {analysisResult.successMessage}
                            </p>

                            {/* Anomalies list */}
                            <div className="flex flex-col gap-2.5">
                              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Deteksi Koreksi Makhraj</span>
                              {analysisResult.anomalies.map((anom: any, idx: number) => (
                                <div key={idx} className="bg-zinc-950 border border-amber-500/20 p-3 rounded-xl flex gap-3 text-xs">
                                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                  <div className="flex flex-col gap-1">
                                    <span className="font-bold text-white">Ayah {anom.ayah} &bull; Kata: &ldquo;{anom.word}&rdquo;</span>
                                    <p className="text-zinc-400">{anom.errorType}</p>
                                    <p className="text-[10px] text-zinc-500 italic mt-0.5">Saran Ustadz AI: {anom.suggestion}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <button 
                              onClick={() => setAnalysisResult(null)}
                              className="mt-2 w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold py-2.5 rounded-xl text-center"
                            >
                              Kirim Setoran Ulang (Retry)
                            </button>
                          </div>
                        )}

                      </div>

                      {/* Setoran History widget */}
                      <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-4">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Riwayat Setoran Terbaru</span>
                        
                        <div className="flex flex-col gap-2">
                          {history.length > 0 ? history.map((item: any) => (
                            <div key={item.id} className="bg-[#050505] p-3 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-white">Surah (Ayah {item.start_ayah_id}-{item.end_ayah_id})</span>
                                <span className="text-zinc-500 text-[10px]">{new Date(item.created_at).toLocaleDateString()} &bull; AI Verified: {item.ai_analysis?.confidence_score}%</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                item.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                                item.status === 'REJECTED' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </div>
                          )) : (
                            <p className="text-xs text-zinc-500">Belum ada riwayat setoran di server.</p>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                ) : (
                  /* USTADZ ROLE: USTADZ REVIEW STUDIO UI */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* List of pending submissions to review */}
                    <div className="lg:col-span-1 bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-4 h-fit">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Antrean Ustadz Review</h3>
                      </div>
                      
                      <p className="text-xs text-zinc-500">Pilih rekaman murid di bawah untuk mendengarkan, melihat visual waveform, dan memberikan feedback talaqqi.</p>

                      <div className="flex flex-col gap-2 mt-2">
                        {reviews.map((rev) => (
                          <button
                            key={rev.id}
                            onClick={() => setSelectedSubmissionId(rev.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${selectedSubmissionId === rev.id ? "bg-amber-950/20 border-amber-500 text-amber-300" : "bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-400"}`}
                          >
                            <div className="flex justify-between w-full text-xs">
                              <span className="font-bold text-white">{rev.murid}</span>
                              <span className="text-[10px] text-zinc-500">{rev.submitted}</span>
                            </div>
                            <div className="text-xs font-bold">{rev.surah} &bull; {rev.range}</div>
                            <div className="flex items-center justify-between mt-1 text-[10px]">
                              <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">AI Score: {rev.aiScore}%</span>
                              <span className="text-amber-500 flex items-center gap-1 font-semibold">Tinjau Rekaman &rarr;</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Earpiece studio workspace */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      
                      {selectedSubmissionId ? (
                        (() => {
                          const activeRev = reviews.find(r => r.id === selectedSubmissionId);
                          if (!activeRev) return null;
                          return (
                            <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-5">
                              
                              <div className="flex justify-between items-center border-b border-emerald-950 pb-3">
                                <div>
                                  <h4 className="font-bold text-base text-white">{activeRev.murid}</h4>
                                  <p className="text-xs text-zinc-500">Membaca {activeRev.surah} ({activeRev.range})</p>
                                </div>
                                <span className="bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded text-xs font-extrabold">
                                  Menunggu Talaqqi Sanad
                                </span>
                              </div>

                              {/* Audio Wave Player widget */}
                              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-zinc-400 font-bold">Evaluasi Waveform Audio (CSS Mock)</span>
                                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                                    <Sparkles className="w-3.5 h-3.5" /> AI Penunjuk Anomalies Aktif
                                  </span>
                                </div>

                                <audio src={activeRev.audioUrl} controls className="w-full mt-2 rounded-xl filter invert opacity-90 sepia hue-rotate-180 contrast-125 mix-blend-screen" />

                                <div className="mt-4 flex flex-col gap-3 border-t border-emerald-950 pt-4">
                                  <label className="text-xs font-bold text-zinc-400 uppercase">Ustadz Feedback (Talaqqi)</label>
                                  <textarea 
                                    value={ustadzFeedback}
                                    onChange={(e) => setUstadzFeedback(e.target.value)}
                                    placeholder="Tuliskan catatan perbaikan tajwid/makhraj untuk murid..."
                                    className="w-full bg-[#050505] border border-emerald-900/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 min-h-[80px]"
                                  />
                                  <div className="grid grid-cols-2 gap-3 mt-1">
                                    <button onClick={() => handleUstadzReview(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex justify-center items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                                      <CheckCircle className="w-4 h-4" /> Setujui (Approve)
                                    </button>
                                    <button onClick={() => handleUstadzReview(false)} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex justify-center items-center gap-1.5 shadow-lg shadow-amber-500/20">
                                      <AlertTriangle className="w-4 h-4" /> Tolak & Perbaiki (Reject)
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* AI pre-detections */}
                              <div className="flex flex-col gap-2 text-xs">
                                <span className="font-bold text-zinc-500 uppercase tracking-wider">Hasil Analisis AI Madinah</span>
                                {activeRev.anomalies.map((anom: any, idx: number) => (
                                  <div key={idx} className="bg-zinc-950 border border-red-500/10 p-3.5 rounded-xl flex gap-3 text-xs">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-bold text-white">Anomali pada kata &ldquo;{anom.word}&rdquo;</span>
                                      <p className="text-red-400/80">{anom.error}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Send review notes form */}
                              <div className="flex flex-col gap-2 mt-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Catatan Talaqqi Ustadz (Feedback Suara/Teks)</label>
                                <textarea 
                                  value={ustadzFeedback}
                                  onChange={(e) => setUstadzFeedback(e.target.value)}
                                  placeholder="Tulis koreksi makhraj atau tajwid secara terperinci untuk murid..."
                                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 h-20 resize-none"
                                />
                                
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                  <button 
                                    onClick={() => {
                                      // Simulate recording ustadz voice note feedback
                                      alert("Ustadz Voice Note Recorder aktif!");
                                    }}
                                    className="bg-zinc-900 border border-zinc-800 text-xs font-bold py-2.5 rounded-xl text-center text-zinc-300 hover:bg-zinc-800 transition-colors"
                                  >
                                    Rekam Balasan Suara
                                  </button>
                                  <button 
                                    onClick={() => {
                                      // Approve and delete from list
                                      setReviews(reviews.filter(r => r.id !== selectedSubmissionId));
                                      setSelectedSubmissionId(null);
                                      setUstadzFeedback("");
                                      alert("Evaluasi terkirim ke murid. Status setoran diperbarui menjadi ACCEPTED!");
                                    }}
                                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs py-2.5 rounded-xl text-center hover:opacity-90 shadow-md shadow-amber-700/20"
                                  >
                                    Kirim & Setujui Setoran
                                  </button>
                                </div>
                              </div>

                            </div>
                          );
                        })()
                      ) : (
                        <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[300px]">
                          <Award className="w-12 h-12 text-zinc-700" />
                          <h4 className="font-bold text-sm text-zinc-400">Tidak Ada Rekaman Murid Terpilih</h4>
                          <p className="text-zinc-600 text-xs max-w-xs">Pilih salah satu setoran hafalan murid di kolom sebelah kiri untuk memulai studio Talaqqi.</p>
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </motion.div>
            )}

            {/* TAB 3: MOSQUE EXPLORER & CHECK-IN */}
            {activeTab === "map" && (
              <motion.div 
                key="map"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                
                {/* Left Side: Mosque Details & check in */}
                <div className="lg:col-span-1 bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-5 h-fit">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Detail Masjid</h3>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="text-lg font-bold text-white">{selectedMosque.name}</h4>
                    <span className="text-xs text-zinc-500">{selectedMosque.coordinate}</span>
                  </div>

                  <div className="border border-emerald-900/20 bg-emerald-950/10 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Kegiatan Sosial DKM</span>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-300">Kajian Harian</span>
                      <span className="font-bold text-emerald-400">{selectedMosque.kajian}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-zinc-300">Volunteer Muazin</span>
                      <span className="font-bold text-amber-400">Butuh 2 Orang</span>
                    </div>
                  </div>

                  {/* Streak bonus tracker */}
                  <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-xl">
                    <Flame className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="text-xs text-amber-300">
                      <span className="font-bold">Check-In Streak Aktif!</span>
                      <p className="text-[10px] text-amber-400/80 mt-0.5">Dapatkan **{selectedMosque.streak_bonus}** untuk skor Ibadah Anda!</p>
                    </div>
                  </div>

                  {checkedInMosque === selectedMosque.name ? (
                    <div className="bg-emerald-600 text-white font-bold p-3.5 rounded-xl text-center text-xs flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Sudah Check-In Hari Ini!
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setCheckedInMosque(selectedMosque.name);
                        setStreakDays(prev => prev + 1);
                        alert(`Alhamdulillah! Berhasil check-in di ${selectedMosque.name}. Streak harian Anda bertambah menjadi ${streakDays + 1} hari!`);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl text-center text-xs shadow-md shadow-emerald-700/20 hover:opacity-90 transition-all"
                    >
                      Lakukan Check-In Ibadah
                    </button>
                  )}

                </div>

                {/* Right Side: Visual Mock Map */}
                <div className="lg:col-span-2 bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-4 min-h-[400px] relative overflow-hidden">
                  
                  <div className="absolute top-4 left-4 z-20 bg-zinc-950/80 border border-zinc-900 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 backdrop-blur">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold">Peta Masjid Digital (15km radius)</span>
                  </div>

                  {/* Dark Mode Map Canvas */}
                  <div className="w-full h-full bg-[#050505] rounded-xl relative border border-zinc-900 overflow-hidden flex items-center justify-center">
                    
                    {/* Simulated map graphic grids */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
                      {[...Array(36)].map((_, i) => (
                        <div key={i} className="border border-emerald-500" />
                      ))}
                    </div>

                    {/* Streets mock vectors */}
                    <div className="absolute top-1/3 left-0 w-full h-1 bg-zinc-900 transform rotate-12 pointer-events-none" />
                    <div className="absolute top-0 left-1/2 w-1 h-full bg-zinc-900 transform -rotate-45 pointer-events-none" />

                    {/* Mosque Marker 1 (Active/Selected) */}
                    <button 
                      onClick={() => setSelectedMosque({
                        name: "Masjid Raya Al-Jabbar",
                        coordinate: "POINT(107.6191 -6.9025)",
                        kajian: "Tafsir Jalalain - Ba'da Maghrib",
                        dkm_wallet: "Rp 45,200,000",
                        streak_bonus: "1.5x Multiplier"
                      })}
                      className="absolute top-1/4 left-1/3 z-10 flex flex-col items-center gap-1 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 group-hover:scale-110 transition-transform">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] bg-zinc-950 px-2 py-0.5 rounded text-emerald-400 font-bold border border-emerald-500/20">
                        Al-Jabbar (1.2km)
                      </span>
                    </button>

                    {/* Mosque Marker 2 */}
                    <button 
                      onClick={() => setSelectedMosque({
                        name: "Masjid Raya Bandung (Jami)",
                        coordinate: "POINT(107.6053 -6.9219)",
                        kajian: "Fiqih Sunnah - Subuh Berjamaah",
                        dkm_wallet: "Rp 120,450,000",
                        streak_bonus: "1.2x Multiplier"
                      })}
                      className="absolute bottom-1/3 right-1/4 z-10 flex flex-col items-center gap-1 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-transform">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] bg-zinc-950 px-2 py-0.5 rounded text-zinc-400 font-bold border border-zinc-900">
                        Masjid Raya Bandung (3.4km)
                      </span>
                    </button>

                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB 4: SPARING TILAWAH */}
            {activeTab === "sparing" && (
              <motion.div 
                key="sparing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                
                {sparingStatus === "idle" && (
                  <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-5 min-h-[350px]">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Sparing Tilawah (Sambung Ayat Matchmaker)</h3>
                    <p className="text-zinc-500 text-xs max-w-sm">
                      Uji hafalan Anda dengan bertanding secara real-time melawan Hafidz lain di seluruh dunia! AI akan membacakan satu ayat, musuh Anda melanjutkan, dan Anda menyambung.
                    </p>

                    <div className="flex flex-col gap-3 w-full max-w-xs mt-3">
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Pilih Tingkat Level Juz Sparing</label>
                        <select className="bg-zinc-950 border border-emerald-900/30 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500">
                          <option>Juz 30 (Umum)</option>
                          <option>Juz 29 (Tabarak)</option>
                          <option>Juz 1 s/d 5 (Baqarah)</option>
                        </select>
                      </div>

                      <button 
                        onClick={triggerSparingMatch}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3.5 rounded-xl text-center text-xs shadow-md shadow-amber-700/20 hover:opacity-90 transition-all mt-2"
                      >
                        Temukan Lawan Sparing Tilawah
                      </button>
                    </div>
                  </div>
                )}

                {sparingStatus === "searching" && (
                  <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-5 min-h-[350px]">
                    {/* Glowing radar ping */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping" />
                      <div className="absolute w-16 h-16 rounded-full border border-emerald-500/60 animate-pulse" />
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <Search className="w-5 h-5 animate-spin" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-lg">Mencari Lawan...</h4>
                      <p className="text-zinc-500 text-xs">Memindai database global dari 12,000+ hafidz online...</p>
                    </div>
                  </div>
                )}

                {sparingStatus === "matched" && (
                  <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-6 min-h-[350px]">
                    <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">
                      PERTANDINGAN DITEMUKAN!
                    </span>

                    {/* Face off */}
                    <div className="flex items-center justify-center gap-12 w-full max-w-md">
                      
                      {/* Murid */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-emerald-900/30 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-lg">
                          AB
                        </div>
                        <span className="font-bold text-xs text-white">{display_name}</span>
                        <span className="text-[10px] text-zinc-500">Rating: 1250</span>
                      </div>

                      <span className="text-3xl font-extrabold text-amber-500 italic">VS</span>

                      {/* Opponent */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-full bg-amber-900/30 border-2 border-amber-500 flex items-center justify-center text-amber-400 font-bold text-lg">
                          YQ
                        </div>
                        <span className="font-bold text-xs text-white">{opponent.name}</span>
                        <span className="text-[10px] text-zinc-500">Rating: {opponent.rating}</span>
                      </div>

                    </div>

                    <span className="text-xs text-zinc-500">Pertandingan &ldquo;Sambung Ayat&rdquo; akan dimulai dalam 3 detik...</span>
                  </div>
                )}

                {sparingStatus === "gameplay" && (
                  <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col gap-6">
                    
                    {/* Header game stats */}
                    <div className="flex justify-between items-center border-b border-emerald-950 pb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-white">Sparing Sambung Ayat</span>
                        <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/10 font-bold">Round {sparingRound}</span>
                      </div>
                      <div className="text-xs text-amber-400 font-bold flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        <Clock className="w-4 h-4 animate-spin" /> Waktu Rekam: {sparingTimer}s
                      </div>
                    </div>

                    {/* Arena prompt */}
                    <div className="flex flex-col gap-4">
                      
                      {/* Opponent's turn result */}
                      <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex flex-col gap-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Bacaan {opponent.name} (Lawan)</span>
                        <p className="text-sm font-bold text-white italic">&ldquo;‘Amma yatasa’alun...&rdquo;</p>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> AI Verified: 91.2% Akurat (An-Naba Ayah 1)
                        </span>
                      </div>

                      {/* Active User's turn */}
                      <div className="bg-emerald-950/15 border border-emerald-500/20 p-5 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
                        <span className="text-xs text-emerald-400 font-extrabold uppercase tracking-widest animate-pulse">GILIRAN ANDA!</span>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-zinc-400">Sambung ayat selanjutnya (An-Naba Ayah 2)</p>
                          <h4 className="text-lg font-bold text-white">&ldquo;&lsquo;Anin-naba&apos;il-&apos;adzim...&rdquo;</h4>
                        </div>

                        {isSparingRecording ? (
                          <button 
                            onClick={() => {
                              setIsSparingRecording(false);
                              alert("Merekam sparing dihentikan. AI mengevaluasi makhraj Anda... Selamat, Anda memenangkan Sparing Tilawah ini! +20 Rating Point!");
                              setSparingStatus("idle");
                            }}
                            className="bg-red-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl animate-pulse"
                          >
                            Hentikan & Kirim Hasil
                          </button>
                        ) : (
                          <button 
                            onClick={() => setIsSparingRecording(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-700/20"
                          >
                            Tekan Untuk Rekam Jawaban
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                )}

              </motion.div>
            )}

            {/* TAB 5: TALENT HUB */}
            {activeTab === "talent" && (
              <motion.div 
                key="talent"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                
                {/* Talent Search and Filters */}
                <div className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                  
                  {/* Search */}
                  <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Cari Imam/Muazin..."
                      value={talentSearch}
                      onChange={(e) => setTalentSearch(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-900 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span>Karakter Suara:</span>
                      <select 
                        value={selectedVoiceType} 
                        onChange={(e) => setSelectedVoiceType(e.target.value)}
                        className="bg-zinc-950 border border-zinc-900 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="All">Semua</option>
                        <option value="High Resonance">High Resonance</option>
                        <option value="Mellow">Mellow</option>
                        <option value="Deep Lyric">Deep Lyric</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span>Sertifikasi:</span>
                      <select 
                        value={selectedCertification}
                        onChange={(e) => setSelectedCertification(e.target.value)}
                        className="bg-zinc-950 border border-zinc-900 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="All">Semua</option>
                        <option value="Sanad 30 Juz">Sanad 30 Juz</option>
                        <option value="Sanad Qiro'at Sab'ah">Qiro&apos;at Sab&apos;ah</option>
                      </select>
                    </div>

                  </div>

                </div>

                {/* Directory List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {imams
                    .filter((im) => {
                      if (selectedVoiceType !== "All" && im.voice !== selectedVoiceType) return false;
                      if (selectedCertification !== "All" && im.cert !== selectedCertification) return false;
                      if (talentSearch && !im.name.toLowerCase().includes(talentSearch.toLowerCase())) return false;
                      return true;
                    })
                    .map((im) => (
                      <div key={im.id} className="bg-[#0a0a0a] border border-emerald-950 rounded-2xl p-5 flex flex-col gap-4 group">
                        
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-emerald-900/20 flex items-center justify-center text-emerald-400 border border-emerald-500/10 font-extrabold text-sm">
                              {im.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="flex flex-col">
                              <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">{im.name}</h4>
                              <span className="text-[10px] text-zinc-500">{im.location}</span>
                            </div>
                          </div>
                          
                          <div className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                            <Award className="w-3 h-3" strokeWidth={3} /> {im.rating}
                          </div>
                        </div>

                        {/* Specs */}
                        <div className="flex flex-col gap-1 border-y border-zinc-950 py-3 text-[10px] text-zinc-400">
                          <div className="flex justify-between">
                            <span>Sertifikasi:</span>
                            <span className="font-semibold text-white">{im.cert}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span>Karakter Suara:</span>
                            <span className="font-semibold text-white">{im.voice}</span>
                          </div>
                        </div>

                        {/* Audio portfolio player */}
                        <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex justify-between items-center text-[10px]">
                          <span className="font-bold text-zinc-300">{im.audio}</span>
                          <button 
                            onClick={() => {
                              alert(`Mendengarkan murottal portfolio ${im.name}!`);
                            }}
                            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded font-bold flex items-center gap-1 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Play className="w-3.5 h-3.5" /> Putar Audio
                          </button>
                        </div>

                        {/* Call to action */}
                        {role === "DKM" ? (
                          <button 
                            onClick={() => {
                              alert(`Kontrak Imam/Muazin ${im.name} dikirimkan ke email DKM! Saldo kas masjid akan otomatis ditransfer sebagai jaminan fee awal.`);
                            }}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-center text-xs transition-colors"
                          >
                            Tawari Kontrak Imam
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              alert(`Mengirim pesan tanya-jawab (Syura) ke ${im.name}!`);
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-bold py-2.5 rounded-xl text-center text-xs transition-colors"
                          >
                            Hubungi Syura Tanya Jawab
                          </button>
                        )}

                      </div>
                    ))}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION SHELL (Day 2 requirement) */}
      <footer className="lg:hidden border-t border-emerald-900/30 bg-[#080808]/90 backdrop-blur-md sticky bottom-0 z-50 py-2.5 px-4 flex items-center justify-around">
        
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 ${activeTab === "dashboard" ? "text-emerald-400" : "text-zinc-500"}`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[9px] font-bold">Worship</span>
        </button>

        <button 
          onClick={() => setActiveTab("setoran")}
          className={`flex flex-col items-center gap-1 relative ${activeTab === "setoran" ? "text-emerald-400" : "text-zinc-500"}`}
        >
          <Mic className="w-5 h-5" />
          <span className="text-[9px] font-bold">{role === "USTADZ" ? "Studio" : "Setoran"}</span>
          {role === "USTADZ" && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          )}
        </button>

        <button 
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center gap-1 ${activeTab === "map" ? "text-emerald-400" : "text-zinc-500"}`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[9px] font-bold">Explorer</span>
        </button>

        <button 
          onClick={() => setActiveTab("sparing")}
          className={`flex flex-col items-center gap-1 ${activeTab === "sparing" ? "text-emerald-400" : "text-zinc-500"}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-bold">Sparing</span>
        </button>

        <button 
          onClick={() => setActiveTab("talent")}
          className={`flex flex-col items-center gap-1 ${activeTab === "talent" ? "text-emerald-400" : "text-zinc-500"}`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[9px] font-bold">Talent</span>
        </button>

      </footer>

    </div>
  );
}
