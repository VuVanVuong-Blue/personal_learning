import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROP_API });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const genAI2 = new GoogleGenerativeAI(process.env.GEMINI_API2);

async function testPipeline() {
    const topic = "Học tiếng anh cơ bản 1 tuần";
    console.log("=== BẮT ĐẦU TEST ===");
    console.log("Topic:", topic);

    // 1. MASTER
    const r1 = await groq.chat.completions.create({
        messages: [
            { role: "system", content: "Bạn là Master Agent. Phân tích topic và gắn [TAG: LANGUAGE]" },
            { role: "user", content: topic }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2
    });
    const masterOutput = r1.choices[0]?.message?.content || '';
    console.log("\\n[1/5] MASTER OUTPUT: ", masterOutput.substring(0, 100) + '...');

    // 2. ARCHITECT
    const systemPrompt2 = \`Bạn là Architect Agent. Dựa vào bản báo cáo chiến lược sau, hãy vạch ra DÀN Ý CÁC CHẶNG (Milestones) chính yếu để đạt được lộ trình học tập tối ưu cho yêu cầu gốc của User là: "\${topic}".
YÊU CẦU QUAN TRỌNG: 
- Chỉ trả về danh sách các Chặng theo thứ tự logic, lược bỏ các giải thích mông lung.
- BẮT BUỘC phải vạch ra ÍT NHẤT 3 chặng và TỐI ĐA 5 chặng (Milestones). KHÔNG ĐƯỢC TẠO DƯỚI 3 CHẶNG dù khóa học ngắn.
TUYỆT ĐỐI không Generate bất kỳ lời mở đầu, lời chào, hay lời kết luận nào. Chỉ nhả ra đúng dữ liệu thô.\`;

    const r2 = await groq.chat.completions.create({
        messages: [
            { role: "system", content: systemPrompt2 },
            { role: "user", content: \`CHIẾN LƯỢC: \${masterOutput}\\n\\nYêu cầu MỆNH LỆNH: Hãy vẽ ra chính xác từ 3 đến 5 chặng.\` }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3
    });
    const architectOutput = r2.choices[0]?.message?.content || '';
    console.log("\\n[2/5] ARCHITECT OUTPUT:\\n", architectOutput);

    // 3. RESEARCHER
    const subModel = genAI2.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt3 = \`Từ chủ đề "\${topic}" và dàn ý sau:\\n\${architectOutput}\\n\\nHãy sinh ra ĐÚNG 1 CÂU TRUY VẤN (query) ngắn gọn cho Google Search (dưới 10 chữ) để tìm tài liệu, khóa học, URL chất lượng cho lộ trình này.\`;
    const result3 = await subModel.generateContent(prompt3);
    const query = result3.response.text().trim();
    console.log("\\n[3/5] RESEARCH QUERY: ", query);

    const tavilyRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: process.env.TAVILY_API,
            query: query,
            search_depth: "basic",
            max_results: 4
        })
    });
    const tavilyData = await tavilyRes.json();
    const links = (tavilyData.results || []).map(r => \`- [\${r.title}](\${r.url})\`).join('\\n');
    console.log("\\n[3.5/5] TAVILY LINKS:\\n", links);
}
testPipeline();
