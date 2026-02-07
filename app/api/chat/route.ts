import { NextResponse } from "next/server"
import { DANGEROUS_TOOLS } from "@/lib/security/tools"
import { runDualAgents } from "@/lib/security/agents"

const ML_SERVICE_URL = "http://127.0.0.1:8000/predict"

export async function POST(req: Request) {
    try {
        const { message } = await req.json()

        // ---------------------------------------------------------
        // Layer 1: ML Shield (Python Service)
        // ---------------------------------------------------------
        let mlVerdict = "UNCERTAIN"
        // Default to uncertain if ML fails or returns low confidence

        try {
            const mlResponse = await fetch(ML_SERVICE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            })

            if (mlResponse.ok) {
                const mlData = await mlResponse.json()
                console.log("ML Shield Response:", mlData)

                if (mlData.verdict === "MALICIOUS") {
                    mlVerdict = "MALICIOUS"
                } else if (mlData.verdict === "SAFE" && mlData.confidence_score < 0.2) {
                    // High confidence that it is NOT malicious (model predicts prob(Malicious))
                    // if prob(Malicious) < 0.2, then it is very safe.
                    mlVerdict = "SAFE"
                } else {
                    mlVerdict = "UNCERTAIN"
                }
            }
        } catch (e) {
            console.error("ML Service Unavailable:", e)
        }

        // BLOCK IMMEDIATE MALICIOUS
        if (mlVerdict === "MALICIOUS") {
            return NextResponse.json({
                blocked: true,
                reason: "ML Shield detected malicious intent",
                layer: "LAYER_1_ML",
                analysis: "Keyword/Vector patterns matched known attacks."
            })
        }

        // ---------------------------------------------------------
        // Layer 2: Dual Agents (If Uncertain)
        // ---------------------------------------------------------
        let finalVerdict = mlVerdict
        let agentAnalysis = "Processed by Rule-Based/ML Layer"
        let toolPolicy = "ALLOW_ALL"

        if (mlVerdict === "UNCERTAIN") {
            const agentResult = await runDualAgents(message)
            finalVerdict = agentResult.verdict
            agentAnalysis = agentResult.analysis
            toolPolicy = agentResult.policy

            if (finalVerdict === "MALICIOUS") {
                return NextResponse.json({
                    blocked: true,
                    reason: "Dual Agents (Warden) blocked the request",
                    layer: "LAYER_2_AGENTS",
                    analysis: agentAnalysis,
                    policy: toolPolicy
                })
            }
        }

        // ---------------------------------------------------------
        // Execution: Tools
        // ---------------------------------------------------------
        // Filter tools based on policy
        let allowedTools = Object.keys(DANGEROUS_TOOLS)
        if (toolPolicy === "RESTRICTED") {
            allowedTools = allowedTools.filter(t => DANGEROUS_TOOLS[t as keyof typeof DANGEROUS_TOOLS].risk_level === "LOW")
        } else if (toolPolicy === "SHUTDOWN") {
            allowedTools = []
        }

        return NextResponse.json({
            blocked: false,
            layer: mlVerdict === "UNCERTAIN" ? "LAYER_2_AGENTS" : "LAYER_1_ML",
            toolPolicy,
            allowedTools,
            restrictedTools: Object.keys(DANGEROUS_TOOLS).filter(t => !allowedTools.includes(t)),
            response: `[Simulated AI Response] I've analyzed your request. Based on the ${toolPolicy} policy, I can access the following tools: ${allowedTools.join(", ")}.`,
            agentAnalysis
        })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
