"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

interface RequestRecord {
    id: string
    created_at: string
    query: string
    action: string
    reason: string
    layer: string
    metadata: any
}

export function ChatHistorySection() {
    const [requests, setRequests] = useState<RequestRecord[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
        const channel = supabase
            .channel('history-updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests' }, () => {
                fetchHistory()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const fetchHistory = async () => {
        const { data } = await supabase
            .from('requests')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        if (data) {
            setRequests(data)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold">Chat History</h2>
            </div>

            {loading ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        Loading...
                    </CardContent>
                </Card>
            ) : requests.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No chat history yet. Start a conversation to see requests here.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {requests.map((req) => (
                        <Card key={req.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={req.action === "BLOCKED" ? "destructive" : "outline"}>
                                                {req.action}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(req.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="font-mono text-sm break-all">{req.query}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <div><strong>Layer:</strong> {req.layer}</div>
                                    <div><strong>Reason:</strong> {req.reason}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
