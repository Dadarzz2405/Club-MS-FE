import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { chatApi } from "@/api/misc";
import type { ChatReply } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "bot";
  text: string;
}

export function ChatWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Assalamu'alaikum! I'm here to help with Islamic education and system navigation. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await chatApi.send(msg);
      const reply = res.reply;
      setMessages((prev) => [...prev, { role: "bot", text: reply.message }]);
      if (reply.action === "navigate" && reply.route) {
        navigate(reply.route);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 bg-card border rounded-xl shadow-2xl flex flex-col animate-fade-in overflow-hidden" style={{ height: "420px" }}>
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-semibold text-sm">Rohis Assistant</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "bot" && <Bot className="h-5 w-5 mt-1 text-primary shrink-0" />}
                <div className={cn("max-w-[80%] rounded-lg px-3 py-2 text-sm", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  {m.text}
                </div>
                {m.role === "user" && <User className="h-5 w-5 mt-1 text-muted-foreground shrink-0" />}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <Bot className="h-5 w-5 mt-1 text-primary shrink-0" />
                <div className="bg-muted rounded-lg px-3 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
              </div>
            )}
          </div>

          <div className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="text-sm"
            />
            <Button size="sm" onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
