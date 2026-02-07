"use client"
// Force IDE re-index

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Activity, Flame, Terminal } from "lucide-react"
import { MessageBubble } from "@/components/message-bubble"

interface Message {
    role: "user" | "assistant"
    content: string
    metadata?: any
}

import { supabase } from "@/lib/supabase"

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello. I am Deriv Services Sdn Bhd. I can answer your questions and help you do tasks. How can I help you?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [currentPolicy, setCurrentPolicy] = useState("ALLOW_ALL")
    const [allowedTools, setAllowedTools] = useState<string[]>([])
    const [restrictedTools, setRestrictedTools] = useState<string[]>([])

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const sendMessage = async (currentInput: string) => {
        if (!currentInput.trim()) return

        const userMsg: Message = { role: "user", content: currentInput }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                body: JSON.stringify({ message: currentInput }),
                headers: { "Content-Type": "application/json" }
            })

            const data = await res.json()

            const aiMsg: Message = {
                role: "assistant",
                content: data.blocked ? "Request blocked by security protocols." : data.response,
                metadata: {
                    blocked: data.blocked,
                    reason: data.reason,
                    layer: data.layer,
                    analysis: data.analysis || data.agentAnalysis,
                    toolPolicy: data.toolPolicy
                }
            }

            setMessages(prev => [...prev, aiMsg])

            if (data.allowedTools) setAllowedTools(data.allowedTools)
            if (data.restrictedTools) setRestrictedTools(data.restrictedTools)
            if (data.toolPolicy) setCurrentPolicy(data.toolPolicy)

            // Persist state for Dashboard
            try {
                const { error } = await supabase.from('requests').insert({
                    query: currentInput,
                    action: data.blocked ? "BLOCKED" : "ALLOWED",
                    reason: data.reason || "Processed by Agents",
                    layer: data.layer,
                    metadata: {
                        blocked: data.blocked,
                        analysis: data.analysis || data.agentAnalysis,
                        toolPolicy: data.toolPolicy
                    }
                })
                if (error) console.error("Error logging to Supabase:", error)
            } catch (err) {
                console.error("Failed to log request:", err)
            }

        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: "assistant", content: "Error communicating with security backend." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex h-screen bg-background text-foreground font-sans">
            {/* Main Chat Area - Full Width Now */}
            <div className="flex-1 flex flex-col relative">
                <header className="h-14 border-b flex items-center px-6 justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Chat Interface</span>
                    </div>
                </header>

                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    <div className="max-w-3xl mx-auto space-y-6">
                        {messages.map((m, i) => (
                            <MessageBubble key={i} {...m} />
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-muted-foreground text-sm animate-pulse ml-12">
                                <Flame className="h-4 w-4 text-orange-500" />
                                Analyzing intent...
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t bg-background">
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type a command..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                                className="bg-muted/20 border-muted-foreground/20 focus-visible:ring-primary/20"
                            />
                            <Button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
