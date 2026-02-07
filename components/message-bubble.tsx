import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ShieldCheck, Cpu } from "lucide-react"

interface MessageBubbleProps {
    role: "user" | "assistant"
    content: string
    metadata?: {
        blocked?: boolean
        reason?: string
        layer?: string
        analysis?: string
        toolPolicy?: string
    }
}

export function MessageBubble({ role, content, metadata }: MessageBubbleProps) {
    const isUser = role === "user"
    const isBlocked = metadata?.blocked

    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-6`}>
            <Avatar className="h-8 w-8">
                <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
                    {isUser ? "U" : "AI"}
                </AvatarFallback>
            </Avatar>

            <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                <Card className={`p-3 text-sm ${isUser
                        ? "bg-primary text-primary-foreground border-primary"
                        : isBlocked
                            ? "bg-destructive/10 border-destructive"
                            : "bg-muted/50"
                    }`}>
                    {content}
                </Card>

                {!isUser && metadata && (
                    <div className="flex flex-col gap-1 mt-1 w-full">
                        {/* Security Metadata Badge */}
                        <div className="flex items-center gap-2">
                            {isBlocked ? (
                                <Badge variant="destructive" className="flex gap-1 items-center w-fit text-[10px] px-1 h-5">
                                    <ShieldAlert className="h-3 w-3" />
                                    BLOCKED BY {metadata.layer?.replace("LAYER_", "")}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="flex gap-1 items-center w-fit text-[10px] px-1 h-5 text-green-600 border-green-200 bg-green-50">
                                    <ShieldCheck className="h-3 w-3" />
                                    SECURE
                                </Badge>
                            )}

                            {metadata.layer && !isBlocked && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Cpu className="h-3 w-3" />
                                    Processed by {metadata.layer}
                                </span>
                            )}
                        </div>

                        {/* Detailed Analysis if available */}
                        {(metadata.analysis || metadata.reason) && (
                            <div className="text-[10px] text-muted-foreground bg-background border rounded p-2 mt-1 font-mono">
                                {metadata.reason && <div className="font-semibold text-destructive mb-1">{metadata.reason}</div>}
                                {metadata.analysis && <div>Analysis: {metadata.analysis}</div>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
