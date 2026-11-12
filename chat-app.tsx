"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu, Plus, MessageSquare, Trash2, Send, Paperclip, Sparkles, Shirt, ChevronDown, Settings2, X, ArrowUpRight, Leaf, Ruler, ShoppingBag } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string; createdAt: string };
type Chat = { id: string; title: string; updatedAt: string; messages?: Message[] };
type Product = { id: string; sku: string; name: string; category: string; description: string; sizes: string; material: string; price: number; care: string; color: string };
const suggestions = ["What size should I choose?", "Recommend an outfit for work.", "How should I wash linen?", "Find something under €70."];
export default function ChatApp() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prompts, setPrompts] = useState<{id:string;name:string;content:string}[]>([]);
  const [promptId, setPromptId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPromptManager, setShowPromptManager] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [promptName, setPromptName] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [error, setError] = useState("");

  const refreshChats = useCallback(async () => {
    try { const r = await fetch("/api/chats"); if (!r.ok) throw new Error(); setChats(await r.json()); }
    catch { setError("Could not connect to the database. Please try again in a moment."); }
  }, []);
  useEffect(() => {
    refreshChats();
    fetch("/api/products").then(r => r.ok ? r.json() : []).then(setProducts).catch(() => {});
    fetch("/api/prompts").then(r => r.ok ? r.json() : []).then((p) => { setPrompts(p); if (p[0]) setPromptId(p[0].id); }).catch(() => {});
  }, [refreshChats]);

  async function newChat() {
    setError("");
    const r = await fetch("/api/chats", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ temperature, topP }) });
    if (!r.ok) { setError("Could not create a conversation. Check the database connection."); return; }
    const chat = await r.json(); setActive(chat.id); setMessages([]); setChats(old => [chat, ...old]); setMobileOpen(false);
  }
  async function openChat(id: string) {
    const r = await fetch(`/api/chats/${id}`);
    if (!r.ok) { setError("Could not load this conversation."); return; }
    const chat = await r.json(); setActive(id); setMessages(chat.messages ?? []); setTemperature(chat.temperature); setTopP(chat.topP); setMobileOpen(false);
  }
  async function deleteChat(id: string) {
    const r = await fetch(`/api/chats/${id}`, { method: "DELETE" });
    if (r.ok) { setChats(old => old.filter(c => c.id !== id)); if (active === id) { setActive(null); setMessages([]); } }
  }
  async function sendMessage(value = input) {
    const text = value.trim(); if (!text || loading) return;
    setError(""); let chatId = active;
    if (!chatId) {
      const created = await fetch("/api/chats", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({temperature,topP}) });
      if (!created.ok) { setError("Could not create a conversation. Check the database connection."); return; }
      const chat = await created.json(); chatId = chat.id; setActive(chatId); setChats(old => [chat, ...old]);
    }
    setInput(""); setLoading(true);
    const optimistic: Message = { id: `temp-${Date.now()}`, role:"user", content:text, createdAt:new Date().toISOString() };
    setMessages(old => [...old, optimistic]);
    try {
      const r = await fetch(`/api/chats/${chatId}/messages`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ content:text, promptId }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.error || "Message could not be sent.");
      setMessages(old => [...old.filter(m => m.id !== optimistic.id), data.userMessage, data.assistantMessage]);
      await refreshChats();
    } catch (e) { setMessages(old => old.filter(m => m.id !== optimistic.id)); setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setLoading(false); }
  }
  async function saveConversationSettings() {
    if (active) {
      const r = await fetch(`/api/chats/${active}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({temperature,topP}) });
      if (!r.ok) setError("Could not save conversation settings.");
    }
    setShowSettings(false);
  }
  async function savePrompt() {
    const payload = { name: promptName.trim(), content: promptContent.trim() };
    if (!payload.name || !payload.content) return;
    const url = editingPrompt ? `/api/prompts/${editingPrompt}` : "/api/prompts";
    const r = await fetch(url, { method: editingPrompt ? "PUT" : "POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    if (r.ok) {
      const updated = await fetch("/api/prompts").then(x=>x.json());
      setPrompts(updated);
      if (!editingPrompt) setPromptId(updated[updated.length-1]?.id ?? promptId);
      setPromptName(""); setPromptContent(""); setEditingPrompt(null);
    } else setError("Could not save this system prompt. Check that its name is unique.");
  }
  async function removePrompt(id: string) {
    const r = await fetch(`/api/prompts/${id}`, {method:"DELETE"});
    if (r.ok) { const updated = await fetch("/api/prompts").then(x=>x.json()); setPrompts(updated); if (promptId===id) setPromptId(updated[0]?.id ?? ""); }
  }
  const activeTitle = useMemo(() => chats.find(c => c.id === active)?.title ?? "New conversation", [chats, active]);

  return <main className="min-h-screen bg-paper">
    <div className="mx-auto flex min-h-screen max-w-[1600px] border-x border-[#e8e3da] bg-[#fbfaf7]">
      <aside className={`${mobileOpen ? "fixed inset-0 z-40 flex" : "hidden"} w-full shrink-0 flex-col border-r border-[#e8e3da] bg-[#f1eee8] md:relative md:flex md:w-[270px]`}>
        <div className="flex h-[76px] items-center justify-between border-b border-[#e3ded5] px-6">
          <div><div className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#8a8175]">TrendWear</div><div className="mt-1 text-lg font-semibold tracking-tight">Assist<span className="text-[#b69b76]">.</span></div></div>
          <button className="rounded-full p-2 hover:bg-white md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button>
        </div>
        <div className="p-4"><button onClick={newChat} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#262522] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#49463f]"><Plus size={16}/> New conversation</button></div>
        <div className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#938b80]">Recent conversations</div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3">
          {chats.length === 0 && <p className="px-3 py-5 text-xs leading-5 text-[#9b948a]">Your conversations will appear here.</p>}
          {chats.map(chat => <div key={chat.id} className={`group mb-1 flex items-center gap-1 rounded-xl ${active===chat.id?"bg-white shadow-sm":"hover:bg-white/70"}`}>
            <button onClick={() => openChat(chat.id)} className="min-w-0 flex-1 px-3 py-3 text-left"><span className="block truncate text-[13px] text-[#48443e]">{chat.title}</span><span className="mt-1 block text-[10px] text-[#a49c91]">{new Date(chat.updatedAt).toLocaleDateString()}</span></button>
            <button onClick={() => deleteChat(chat.id)} className="mr-2 rounded-lg p-2 text-[#aaa197] opacity-0 hover:bg-[#f5eeea] hover:text-[#9a4d40] group-hover:opacity-100" aria-label="Delete conversation"><Trash2 size={14}/></button>
          </div>)}
        </div>
        <div className="border-t border-[#e3ded5] p-5"><div className="flex items-center gap-2 text-[11px] text-[#8b8378]"><span className="h-2 w-2 rounded-full bg-[#91a58b]"/> Fashion support, made simple</div><p className="mt-2 text-[10px] leading-4 text-[#aaa197]">Product information shown is based on the sample catalogue.</p></div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[76px] items-center justify-between border-b border-[#e8e3da] px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3"><button className="rounded-full p-2 hover:bg-[#f1eee8] md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={19}/></button><div className="min-w-0"><div className="truncate text-sm font-semibold">{activeTitle}</div><div className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[.14em] text-[#999186]"><span className="h-1.5 w-1.5 rounded-full bg-[#91a58b]"/> Online assistant</div></div></div>
          <div className="flex items-center gap-2"><button onClick={() => setShowProducts(!showProducts)} className="hidden items-center gap-2 rounded-full border border-[#e3ded5] px-4 py-2 text-xs text-[#615b52] hover:bg-white sm:flex"><ShoppingBag size={14}/> Catalogue</button><button onClick={() => setShowSettings(true)} className="rounded-full border border-[#e3ded5] p-2.5 text-[#615b52] hover:bg-white" aria-label="Settings"><Settings2 size={16}/></button></div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-10">
              {error && <div className="mx-auto mb-5 max-w-2xl rounded-xl border border-[#e7c9c1] bg-[#fff5f2] px-4 py-3 text-xs text-[#914d40]">{error}</div>}
              {messages.length===0 ? <div className="mx-auto flex max-w-2xl flex-col items-center pt-8 text-center sm:pt-16">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-[#e4ddd1] bg-[#f4f0e9] text-[#9b8465]"><Sparkles size={22}/></div>
                <div className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#9b8d7b]">Your personal fashion guide</div>
                <h1 className="mt-4 max-w-xl text-3xl font-medium leading-tight tracking-[-.04em] text-[#292723] sm:text-[42px]">A more considered way<br className="hidden sm:block"/> to get dressed.</h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-[#8d877e]">Ask about fit, fabrics and care, or find pieces that work for your wardrobe and your budget.</p>
                <div className="mt-9 grid w-full max-w-xl gap-2 sm:grid-cols-2">{suggestions.map((s,i)=><button key={s} onClick={() => sendMessage(s)} className="group flex items-center justify-between rounded-2xl border border-[#e8e2d8] bg-white/70 px-4 py-4 text-left text-xs text-[#5f594f] transition hover:border-[#cbbba5] hover:bg-white"><span>{s}</span><ArrowUpRight size={14} className="text-[#b5a58f] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></button>)}</div>
                <div className="mt-10 flex flex-wrap justify-center gap-5 text-[10px] uppercase tracking-[.12em] text-[#a39a8e]"><span className="flex items-center gap-1.5"><Ruler size={13}/> Fit guidance</span><span className="flex items-center gap-1.5"><Leaf size={13}/> Fabric care</span><span className="flex items-center gap-1.5"><Shirt size={13}/> Outfit ideas</span></div>
              </div> : <div className="mx-auto max-w-2xl space-y-6">{messages.map(m=><div key={m.id} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3.5 sm:max-w-[80%] ${m.role==="user"?"rounded-br-md bg-[#292824] text-white":"rounded-bl-md border border-[#ece7df] bg-white text-[#4c4841]"}`}><div className="whitespace-pre-wrap text-[13px] leading-6">{m.content}</div><div className={`mt-2 text-[9px] ${m.role==="user"?"text-white/50":"text-[#aaa197]"}`}>{new Date(m.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</div></div></div>)}{loading&&<div className="flex items-center gap-2 text-xs text-[#9b9388]"><span className="flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b3a18a]"/><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b3a18a] [animation-delay:120ms]"/><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#b3a18a] [animation-delay:240ms]"/></span> Thinking through your request…</div>}</div>}
            </div>
            <div className="border-t border-[#e8e3da] bg-[#fbfaf7] px-4 py-4 sm:px-10 sm:py-5">
              {fileName&&<div className="mx-auto mb-2 flex max-w-2xl items-center justify-between rounded-lg bg-[#f0ece5] px-3 py-2 text-xs text-[#6d655b]"><span className="truncate">{fileName}</span><button onClick={()=>setFileName("")}><X size={14}/></button></div>}
              <div className="mx-auto max-w-2xl rounded-2xl border border-[#e3ddd3] bg-white p-2 shadow-[0_4px_20px_rgba(50,42,30,.04)] focus-within:border-[#c8b69c]">
                <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}} placeholder="Ask anything about your wardrobe..." rows={2} className="max-h-32 min-h-[52px] w-full resize-y bg-transparent px-3 py-2 text-sm text-[#37342f] outline-none placeholder:text-[#b0a99f]"/>
                <div className="flex items-center justify-between px-1 pb-1"><label className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-[11px] text-[#938a7e] hover:bg-[#f7f4ef]"><Paperclip size={14}/> Attach file<input type="file" className="hidden" onChange={e=>setFileName(e.target.files?.[0]?.name??"")}/></label><button onClick={()=>sendMessage()} disabled={!input.trim()||loading} className="flex items-center gap-2 rounded-full bg-[#292824] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#4b4841] disabled:cursor-not-allowed disabled:opacity-40">Send <Send size={13}/></button></div>
              </div>
              <p className="mt-2 text-center text-[9px] tracking-wide text-[#b2aaa0]">TrendWear Assist uses a sample product catalogue. Always verify garment labels.</p>
            </div>
          </div>
          {showProducts&&<aside className="hidden w-[280px] shrink-0 overflow-y-auto border-l border-[#e8e3da] bg-[#f7f5f0] p-5 lg:block"><div className="mb-5 flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[.2em] text-[#9c907f]">Explore</div><h2 className="mt-1 text-lg">The catalogue</h2></div><button onClick={()=>setShowProducts(false)}><X size={16}/></button></div>{products.map(p=><div key={p.id} className="mb-3 rounded-xl border border-[#e7e1d7] bg-white p-3"><div className="text-[9px] uppercase tracking-[.16em] text-[#a39787]">{p.category} · {p.color}</div><div className="mt-1 text-sm font-medium">{p.name}</div><p className="mt-1 text-[11px] leading-5 text-[#8d877e]">{p.description}</p><div className="mt-2 flex items-center justify-between text-[11px]"><span className="text-[#8c8274]">{p.material}</span><b>€{p.price.toFixed(2)}</b></div><div className="mt-2 text-[10px] text-[#a49b90]">Sizes: {p.sizes}</div></div>)}</aside>}
        </div>
      </section>
    </div>
    {showSettings&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"><div className="w-full max-w-md rounded-2xl bg-[#fbfaf7] p-6 shadow-xl"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Conversation settings</h2><button onClick={()=>setShowSettings(false)}><X size={18}/></button></div><p className="mt-1 text-xs text-[#948b80]">Adjust the assistant response settings for this conversation.</p><label className="mt-6 block text-xs font-medium">System prompt</label><select value={promptId} onChange={e=>setPromptId(e.target.value)} className="mt-2 w-full rounded-xl border border-[#e3ddd3] bg-white p-3 text-sm">{prompts.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><label className="mt-5 flex justify-between text-xs">Temperature <span>{temperature.toFixed(1)}</span></label><input type="range" min="0" max="1" step=".1" value={temperature} onChange={e=>setTemperature(Number(e.target.value))} className="mt-3 w-full accent-[#8d785e]"/><label className="mt-5 flex justify-between text-xs">Top-P <span>{topP.toFixed(1)}</span></label><input type="range" min="0" max="1" step=".1" value={topP} onChange={e=>setTopP(Number(e.target.value))} className="mt-3 w-full accent-[#8d785e]"/><button onClick={()=>{setShowSettings(false);setShowPromptManager(true);}} className="mt-5 w-full rounded-full border border-[#e3ddd3] py-3 text-sm text-[#514b43]">Manage prompts</button><button onClick={saveConversationSettings} className="mt-2 w-full rounded-full bg-[#292824] py-3 text-sm text-white">Save settings</button></div></div>}
  </main>;
}
