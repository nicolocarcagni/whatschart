import { useState } from 'react';
import { 
  UploadCloud, Loader2, ShieldCheck, Lock, Cpu, BarChart3, ArrowRight
} from 'lucide-react';
import { parseWhatsAppChat } from './utils/parser';
import Dashboard from './components/Dashboard';

function App() {
  const [messages, setMessages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = (file) => {
    setError(null);
    if (file && file.name.endsWith('.txt')) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        // Defer parsing execution to next event loop tick so loading state can render
        setTimeout(() => {
          try {
            const text = e.target.result;
            const parsed = parseWhatsAppChat(text);
            if (parsed.length === 0) {
              setError("Nessun messaggio valido trovato. Assicurati che sia un export corretto di WhatsApp.");
            } else {
              setMessages(parsed);
            }
          } catch {
            setError("Impossibile leggere il file. Verifica che il file di testo sia integro.");
          } finally {
            setIsLoading(false);
          }
        }, 60);
      };
      reader.onerror = () => {
        setError("Errore nella lettura del file. Riprova.");
        setIsLoading(false);
      };
      reader.readAsText(file);
    } else {
      setError("Formato non supportato. Carica il file _chat.txt esportato da WhatsApp.");
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans relative selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Background ambient mesh & grid texture */}
      <div className="fixed inset-0 bg-grid opacity-70 pointer-events-none -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="border-b border-zinc-900/80 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center p-[1px] shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight text-white font-mono">WhatsChart</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span>ELABORAZIONE LOCALE</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-zinc-400">
              <Lock className="w-3 h-3 text-zinc-500" />
              <span>NESSUN DATO INVIATO</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[65vh] gap-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-950/80">
                <div className="w-16 h-16 rounded-full border border-emerald-500/30 border-t-emerald-400 animate-spin flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border border-cyan-500/40 border-b-cyan-400 animate-spin" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>LETTURA DEL FILE</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Analisi della chat in corso...</h2>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto font-mono">
                Calcolo dei messaggi e delle statistiche direttamente sul tuo dispositivo.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="max-w-4xl mx-auto pt-6 md:pt-10">
            {/* Hero Banner */}
            <div className="text-center mb-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md shadow-inner text-xs font-mono text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-zinc-400">Privacy:</span> 100% nel tuo browser
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Statistiche della tua <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Chat WhatsApp
                </span>
              </h1>

              <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Visualizza record di messaggi, giorni consecutivi, pause, parole ed emoji più frequenti e attività per partecipante. Nessun dato lascia il tuo dispositivo.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                role="alert"
                className="mb-6 p-4 bg-rose-950/30 border border-rose-500/30 text-rose-300 rounded-xl text-center font-mono text-xs max-w-xl mx-auto flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {error}
              </div>
            )}

            {/* Dropzone */}
            <div
              role="region"
              aria-label="Area di caricamento file. Trascina qui l'export della chat o usa il pulsante di selezione."
              className={`relative rounded-3xl p-8 md:p-14 flex flex-col items-center justify-center transition-all duration-300 border backdrop-blur-xl group overflow-hidden ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_50px_rgba(16,185,129,0.2)] scale-[1.01]'
                  : 'border-zinc-800/90 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-950/90'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {/* Corner markers */}
              <div className="absolute top-4 left-4 font-mono text-[11px] text-zinc-700 pointer-events-none select-none">+</div>
              <div className="absolute top-4 right-4 font-mono text-[11px] text-zinc-700 pointer-events-none select-none">+</div>
              <div className="absolute bottom-4 left-4 font-mono text-[11px] text-zinc-700 pointer-events-none select-none">+</div>
              <div className="absolute bottom-4 right-4 font-mono text-[11px] text-zinc-700 pointer-events-none select-none">+</div>

              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:border-zinc-700 transition-colors shadow-inner">
                <UploadCloud className={`w-8 h-8 md:w-10 md:h-10 transition-colors duration-300 ${isDragging ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'}`} />
              </div>

              <h2 className="text-xl md:text-2xl font-bold mb-2 text-center text-white tracking-tight">
                Trascina qui il file <span className="font-mono text-emerald-400">_chat.txt</span>
              </h2>
              <p className="text-zinc-400 mb-8 text-center max-w-md text-sm">
                Esporta qualsiasi chat WhatsApp (selezionando "Senza file multimediali") e rilascia il file qui per analizzarlo.
              </p>

              <label
                htmlFor="chat-file-input"
                className="cursor-pointer bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-semibold font-mono text-sm px-8 py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2 tracking-tight"
              >
                <span>Seleziona file _chat.txt</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </label>
              <input
                id="chat-file-input"
                type="file"
                className="sr-only"
                accept=".txt"
                aria-label="Carica file di testo esportato da WhatsApp"
                onChange={onFileChange}
              />
            </div>

            {/* Feature info boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 font-mono">
              <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/50 flex items-start gap-3">
                <Cpu className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase">Nel tuo browser</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">I messaggi rimangono solo nella memoria del tuo dispositivo.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/50 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase">Nessun server</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Nessun database, nessun account né condivisione a terzi.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/50 flex items-start gap-3">
                <BarChart3 className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-white uppercase">Dati completi</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Grafici orari, record di messaggi, parole ed emoji più frequenti.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Dashboard messages={messages} onBack={() => setMessages([])} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 mt-16 py-8 text-center font-mono text-xs text-zinc-500">
        <p>
          made with &lt;3 by{' '}
          <a 
            href="https://github.com/nicolocarcagni" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-zinc-300 hover:text-emerald-400 transition-colors underline underline-offset-4"
          >
            nicolocarcagni
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
