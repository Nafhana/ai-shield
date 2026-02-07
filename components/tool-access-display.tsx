import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, ShieldAlert, Lock, Unlock } from "lucide-react"

interface ToolAccessDisplayProps {
    allowedTools: string[]
    restrictedTools: string[]
    policy: string
}

export function ToolAccessDisplay({ allowedTools, restrictedTools, policy }: ToolAccessDisplayProps) {
    return (
        <Card className="h-full border-l-0 rounded-none border-y-0">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {policy === "SHUTDOWN" ? (
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                    ) : (
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                    )}
                    Tool Access Control
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        Active Tools
                    </h4>
                    <div className="flex flex-col gap-2">
                        {allowedTools.length === 0 && <span className="text-xs text-muted-foreground italic">No tools available</span>}
                        {allowedTools.map((tool) => (
                            <div key={tool} className="flex items-center justify-between text-sm bg-secondary/30 p-2 rounded-md border">
                                <span className="font-mono text-xs">{tool}</span>
                                <Unlock className="h-3 w-3 text-green-500 opacity-70" />
                            </div>
                        ))}
                    </div>
                </div>

                {restrictedTools.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                            Restricted / Blocked
                        </h4>
                        <div className="flex flex-col gap-2">
                            {restrictedTools.map((tool) => (
                                <div key={tool} className="flex items-center justify-between text-sm bg-destructive/10 p-2 rounded-md border border-destructive/20">
                                    <span className="font-mono text-xs text-destructive">{tool}</span>
                                    <Lock className="h-3 w-3 text-destructive opacity-70" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Policy Status</span>
                        <Badge variant={policy === "ALLOW_ALL" ? "default" : policy === "RESTRICTED" ? "secondary" : "destructive"}>
                            {policy}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
