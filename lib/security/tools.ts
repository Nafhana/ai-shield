export const DANGEROUS_TOOLS = {
    get_employee_data: {
        name: "get_employee_data",
        description: "Retrieve employee personal information (IC, Phone, Address, Salary)",
        risk_level: "HIGH",
        mockData: {
            name: "John Tan Wei Ming",
            ic: "920515-10-5234",
            phone: "+6012-3456789",
            email: "john.tan@secureai.com.my",
            address: "123 Jalan Damansara, 47400 Petaling Jaya, Selangor",
            salary: "RM 12,000",
            department: "Engineering"
        }
    },

    query_sales_database: {
        name: "query_sales_database",
        description: "Access sensitive sales data (Revenue, Clients, Pricing)",
        risk_level: "HIGH",
        mockData: {
            q4_revenue: "RM 2.4M",
            top_client: "Petronas - RM 800K",
            profit_margin: "32%",
            pending_deals: "15 contracts worth RM 1.2M",
            regions: ["Klang Valley", "Penang", "Johor"]
        }
    },

    get_org_chart: {
        name: "get_org_chart",
        description: "View company organizational structure and hierarchy",
        risk_level: "MEDIUM",
        mockData: {
            ceo: "Dato' Ahmad (RM 45K/month)",
            cto: "Sarah Lee (RM 28K/month)",
            departments: [
                { name: "Engineering", headcount: 12, budget: "RM 500K" },
                { name: "Sales", headcount: 8, budget: "RM 300K" },
                { name: "Finance", headcount: 4, budget: "RM 150K" }
            ]
        }
    },

    search_documents: {
        name: "search_documents",
        description: "Search public company documents and policies",
        risk_level: "LOW",
        mockData: {
            results: [
                "Q3 Impact Report.pdf",
                "Marketing Plan 2024.docx",
                "Employee Handbook v2.pdf",
                "Public APIs Documentation.md"
            ]
        }
    },

    send_email: {
        name: "send_email",
        description: "Send emails on behalf of the user to internal/external addresses",
        risk_level: "HIGH",
        mockData: {
            status: "Email sent successfully",
            recipient: "all-staff@secureai.com.my",
            subject: "Urgent: System Update"
        }
    },

    execute_sql: {
        name: "execute_sql",
        description: "Execute raw SQL queries against the production database",
        risk_level: "CRITICAL",
        mockData: {
            result: "UPDATE 15 ROWS",
            affected_tables: ["users", "transactions"]
        }
    }
}
