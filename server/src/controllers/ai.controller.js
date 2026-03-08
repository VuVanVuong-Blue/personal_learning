import Groq from 'groq-sdk';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { CohereClient } from 'cohere-ai';
import Roadmap from '../models/Roadmap.js';
import dotenv from 'dotenv';
import { marked } from 'marked';
dotenv.config();

// Init SDKs
const groq = new Groq({ apiKey: process.env.GROP_API || process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API || process.env.GEMINI_API_KEY);
const cohere = new CohereClient({ token: process.env.COHERE || process.env.COHERE_API_KEY });

// Bộ Rules Nâng Cấp (Micro-learning 4 phần + Dynamic Formatting)
const domainRules = {
    TECH: {
        instruction: "Hành văn như Senior Developer. Súc tích, DỄ HIỂU. Bắt buộc dùng ẩn dụ đời sống để giải thích khái niệm trước khi đưa ra code. BẮT BUỘC dùng Code Block (```) cho phần Trọng tâm.",
        fewShot: `Ví dụ cấu trúc văn phong (KHÔNG copy nội dung, chỉ học theo form Markdown):
🎯 **Mục tiêu:** [1 câu chốt hạ mục đích bài học].
💡 **Bản chất:** [Dùng ví dụ đời thường/ẩn dụ để giải thích khái niệm cốt lõi].
🧠 **Trọng tâm:** \`\`\`[ngôn ngữ]
// Code minh họa thực tế
\`\`\`
🚀 **Thực hành:** [1 task code nhỏ để áp dụng ngay].
🔗 **Tài nguyên tham khảo:** [Link đính kèm nếu có].`
    },
    LANGUAGE: {
        instruction: "Hành văn như Giảng viên ngôn ngữ. Giải thích rõ ngữ cảnh văn hóa hoặc mẹo nhớ trước khi đưa từ vựng. BẮT BUỘC dùng Bảng (Table) cho phần Trọng tâm.",
        fewShot: `Ví dụ cấu trúc văn phong:
🎯 **Mục tiêu:** [1 câu chốt hạ kỹ năng giao tiếp đạt được].
💡 **Bản chất/Ngữ cảnh:** [Giải thích tại sao người bản xứ dùng từ này/cấu trúc này].
🧠 **Trọng tâm:** | Từ vựng/Mẫu câu | Phiên âm | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- | :--- |
| ... | ... | ... | ... |
🚀 **Thực hành:** [Tình huống đóng vai/Đặt câu].
🔗 **Tài nguyên tham khảo:** [Link đính kèm nếu có].`
    },
    BUSINESS: {
        instruction: "Hành văn như Chuyên gia Kinh tế. Đi thẳng vào Framework và ứng dụng thực tiễn. Tránh lý thuyết suông. BẮT BUỘC dùng Danh sách đánh số (1, 2, 3) hoặc Bảng cho phần Trọng tâm.",
        fewShot: `Ví dụ cấu trúc văn phong:
🎯 **Mục tiêu:** [1 câu chốt hạ bài toán kinh doanh cần giải quyết].
💡 **Bản chất:** [Giải thích mô hình/chiến lược bằng một Case Study ngắn gọn].
🧠 **Trọng tâm:** 1. **Bước 1:** [Hành động cốt lõi].
2. **Bước 2:** [Hành động cốt lõi].
🚀 **Thực hành:** [Phân tích 1 doanh nghiệp hoặc lập kế hoạch mini].
🔗 **Tài nguyên tham khảo:** [Link đính kèm nếu có].`
    },
    CREATIVE: {
        instruction: "Hành văn như Art Director. Tập trung vào cảm thụ thẩm mỹ và nguyên lý thị giác/âm thanh. Dùng Danh sách gạch đầu dòng (-) cho phần Trọng tâm.",
        fewShot: `Ví dụ cấu trúc văn phong:
🎯 **Mục tiêu:** [1 câu chốt hạ kỹ năng nghệ thuật đạt được].
💡 **Bản chất:** [Giải thích nguyên lý thẩm mỹ đằng sau kỹ thuật này].
🧠 **Trọng tâm:** - **[Quy tắc 1]:** [Giải thích ngắn].
- **[Quy tắc 2]:** [Giải thích ngắn].
🚀 **Thực hành:** [1 bài tập phác thảo/cảm âm/phối màu].
🔗 **Tài nguyên tham khảo:** [Link đính kèm nếu có].`
    },
    ACADEMIC: {
        instruction: "Hành văn như Giáo sư Đại học. BẮT BUỘC dùng ví dụ thực tế đời sống để giải thích định lý khô khan. Phần Trọng tâm phải làm nổi bật Công thức.",
        fewShot: `Ví dụ cấu trúc văn phong:
🎯 **Mục tiêu:** [1 câu chốt hạ định lý/khái niệm cần nắm].
💡 **Bản chất:** [Dùng ví dụ thực tiễn để chứng minh tại sao định lý này tồn tại].
🧠 **Trọng tâm:** > **Công thức/Định lý:** [Trình bày rõ ràng công thức hoặc quy tắc].
🚀 **Thực hành:** [Giải 1 bài tập ứng dụng nhanh].
🔗 **Tài nguyên tham khảo:** [Link đính kèm nếu có].`
    },
    SOFT_SKILLS: {
        instruction: "Hành văn như Chuyên gia Tâm lý học. Phân tích nguyên nhân sâu xa của hành vi/cảm xúc. Phần Trọng tâm đưa ra các bước xử lý tình huống.",
        fewShot: `Ví dụ cấu trúc văn phong:
🎯 **Mục tiêu:** [1 câu chốt hạ kỹ năng xử lý tình huống].
💡 **Bản chất:** [Phân tích rào cản tâm lý hoặc nguyên nhân gốc rễ của hành vi].
🧠 **Trọng tâm:** - **Sai lầm thường gặp:** [Hành vi bản năng].
- **Cách xử lý chuẩn:** [Kỹ thuật tâm lý áp dụng].
🚀 **Thực hành:** [Đưa ra 1 kịch bản giả định để người học tự suy ngẫm].
🔗 **Tài nguyên tham khảo:** [Link đính kèm nếu có].`
    },
    LIFESTYLE: {
        instruction: "Hành văn như Chuyên gia thực hành (Đầu bếp, PT). Tỉ mỉ về thao tác. Phần Trọng tâm BẮT BUỘC dùng Danh sách đánh số (1, 2, 3) cho các bước.",
        fewShot: `Ví dụ cấu trúc văn phong:
🎯 **Mục tiêu:** [1 câu chốt hạ sản phẩm/kỹ năng vật lý đạt được].
💡 **Bản chất:** [Giải thích cơ chế vật lý/hóa học, ví dụ: tại sao bột lại nở, tại sao cơ lại mỏi].
🧠 **Trọng tâm:** 1. **[Bước 1]:** [Thao tác chi tiết].
2. **[Bước 2]:** [Thao tác chi tiết].
🚀 **Thực hành:** [Bắt tay vào làm ngay với số lượng nhỏ].
🔗 **Tài nguyên tham khảo:** [Link đính kèm nếu có].`
    },
    GENERAL: {
        instruction: "Hành văn rành mạch, logic. Dùng ngôn ngữ bình dân nhất có thể để thông não người học.",
        fewShot: `Ví dụ cấu trúc văn phong:
🎯 **Mục tiêu:** [1 câu chốt hạ].
💡 **Bản chất:** [Giải thích khái niệm phức tạp bằng từ ngữ đơn giản, dùng phép so sánh].
🧠 **Trọng tâm:** - **[Ý chính 1]:** [Mô tả].
- **[Ý chính 2]:** [Mô tả].
🚀 **Thực hành:** [Hành động ứng dụng kiến thức vừa học].
🔗 **Tài nguyên tham khảo:** [Link đính kèm nếu có].`
    }
};

// 1. MASTER AGENT (Groq Llama 3)
export const analyzeTopic = async (req, res) => {
    try {
        const { topic } = req.body;
        if (!topic) return res.status(400).json({ message: 'Vui lòng cung cấp chủ đề.' });

        const systemPrompt = `Bạn là Master Agent đánh giá nhu cầu học tập. Phân tích ngữ cảnh sau và rút ra một báo cáo phân tích chiến lược bao gồm:
1. Đánh giá Trình độ hiện tại.
2. Khung thời gian khả thi.
3. Tuyến kiến thức cốt lõi cần đạt được.
Nếu người dùng nhập yêu cầu không liên quan đến học tập, giáo dục, hoặc kỹ năng (ví dụ: chửi thề, hỏi thời tiết, nấu ăn, lừa đảo), hãy trả về chính xác chuỗi: [INVALID_REQUEST].
Tuyệt đối không giải thích thêm.
Quan trọng nhất: Bắt buộc ở cuối cùng, hãy chèn một thẻ [TAG: <MÃ CHỦ ĐỀ>] để phân loại yêu cầu vào một trong các lĩnh vực sau:
- TECH (Lập trình, CNTT, IT, Phần mềm)
- LANGUAGE (Ngoại ngữ, Giao tiếp)
- BUSINESS (Kinh doanh, Tự do tài chính, Marketing)
- CREATIVE (Thiết kế, Nghệ thuật, Sáng tạo)
- ACADEMIC (Toán, Lý, Hóa, Sinh, Khoa học nền tảng)
- SOFT_SKILLS (Tâm lý, Giao tiếp xã hội, Quản lý thời gian, Thuyết trình)
- LIFESTYLE (Nấu ăn, Thể dục, Sức khỏe, Đời sống)
- GENERAL (Các chủ đề học tập chung chung khác)`;

        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: topic }
            ],
            model: "llama-3.3-70b-versatile", // Replaced deprecated llama3-8b-8192
            temperature: 0.2,
            max_tokens: 500
        });

        const result = response.choices[0]?.message?.content || '';

        if (result.includes('[INVALID_REQUEST]')) {
            return res.status(400).json({ message: 'Yêu cầu không hợp lệ. Vui lòng nhập chủ đề liên quan đến học tập hoặc kỹ năng chuyên môn.' });
        }

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        console.error('Master Agent Error:', error);
        res.status(500).json({ message: 'Lỗi phân tích chủ đề (Master Agent). Vui lòng cấu hình API Key.', errorDetail: error.message, errorStack: error.stack });
    }
};

// 2. ARCHITECT AGENT (Groq Llama 3)
export const generateMilestones = async (req, res) => {
    try {
        const { topic, masterOutput } = req.body;
        if (!masterOutput || !topic) return res.status(400).json({ message: 'Thiếu dữ liệu từ Master Agent hoặc chủ đề gốc.' });

        const tagMatch = masterOutput.match(/\[TAG:\s*([A-Z_]+)\]/);
        const tag = tagMatch && domainRules[tagMatch[1]] ? tagMatch[1] : 'GENERAL';
        const rule = domainRules[tag];

        const systemPrompt = `Bạn là Architect Agent. Dựa vào bản báo cáo chiến lược sau, hãy vạch ra DÀN Ý CÁC CHẶNG (Milestones) chính yếu để đạt được lộ trình học tập tối ưu cho yêu cầu gốc của User là: "${topic}".
Văn phong yêu cầu: ${rule.instruction}
YÊU CẦU QUAN TRỌNG: 
- Chỉ trả về danh sách các Chặng theo thứ tự logic, lược bỏ các giải thích mông lung.
- BẮT BUỘC phải vạch ra ÍT NHẤT 3 chặng và TỐI ĐA 5 chặng (Milestones). KHÔNG ĐƯỢC TẠO DƯỚI 3 CHẶNG dù khóa học ngắn.
TUYỆT ĐỐI không Generate bất kỳ lời mở đầu, lời chào, hay lời kết luận nào. Chỉ nhả ra đúng dữ liệu thô.`;

        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `CHIẾN LƯỢC: ${masterOutput}\n\nYêu cầu MỆNH LỆNH: Hãy vẽ ra chính xác từ 3 đến 5 chặng.` }
            ],
            model: "llama-3.3-70b-versatile", // Replaced deprecated llama3-8b-8192
            temperature: 0.3,
            max_tokens: 800
        });

        const architectResult = response.choices[0]?.message?.content || '';
        console.log('--- ARCHITECT OUTPUT ---', architectResult);

        res.status(200).json({ success: true, data: architectResult });
    } catch (error) {
        console.error('Architect Agent Error:', error);
        res.status(500).json({ message: 'Lỗi tạo dàn ý (Architect Agent).', errorDetail: error.message });
    }
};

// 3. WEB RESEARCHER SUBAGENT (Tavily API + Gemini API 2)
export const researchWebContext = async (req, res) => {
    try {
        const { topic, architectOutput } = req.body;
        if (!architectOutput || !topic) return res.status(400).json({ message: 'Thiếu dữ liệu từ Architect Agent.' });

        // Dùng GEMINI_API2 để tạo ra 1 câu truy vấn Google xịn sò nhất từ Dàn Ý
        const subModel = new GoogleGenerativeAI(process.env.GEMINI_API2).getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `Từ chủ đề "${topic}" và dàn ý sau:\n${architectOutput}\n\nHãy sinh ra ĐÚNG 1 CÂU TRUY VẤN (query) ngắn gọn cho Google Search (dưới 10 chữ) để tìm tài liệu, khóa học, URL chất lượng cho lộ trình này. Mẫu trả về chỉ ghi câu truy vấn, không bọc dấu ngoặc. Khuyến khích chêm thêm từ khóa định dạng như pdf, youtube, course.`;

        const result = await subModel.generateContent(prompt);
        const query = result.response.text().trim();

        // Cào dữ liệu từ Tavily Search
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

        // Cấu trúc lại danh sách Links Markdown
        const links = (tavilyData.results || []).map(r => `- [${r.title}](${r.url})`).join('\n');
        console.log('--- TAVILY LINKS ---', links);

        res.status(200).json({ success: true, data: links });
    } catch (error) {
        console.error('Research SubAgent Error:', error);
        res.status(200).json({ success: true, data: '' }); // Fallback rỗng để tiến trình đi tiếp
    }
};

// 4. TEACHER AGENT (Gemini 2.5 Flash)
export const generateTasks = async (req, res) => {
    try {
        const { topic, architectOutput, masterOutput, researchData } = req.body;
        if (!architectOutput || !topic) return res.status(400).json({ message: 'Thiếu dữ liệu từ Architect Agent hoặc chủ đề gốc.' });

        const tagMatch = masterOutput ? masterOutput.match(/\[TAG:\s*([A-Z_]+)\]/) : null;
        const tag = tagMatch && domainRules[tagMatch[1]] ? tagMatch[1] : 'GENERAL';
        const rule = domainRules[tag];

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const systemInstruction = `Bạn là Teacher Agent. Yêu cầu gốc của User là: "${topic}". Dựa vào cái Dàn ý các Chặng học tập sau đây, chuyên môn của bạn là viết chi tiết Từng Bài Học (Tasks) tương ứng nhét vào trong mỗi chặng đó. 
${rule.instruction}

CẤU TRÚC VĂN PHONG YÊU CẦU BẮT BUỘC:
${rule.fewShot}
YÊU CẦU BẮT BUỘC KHÔNG THỂ BỎ QUA:
- Nội dung (content) bài học bạn xuất ra phải trình bày 100% bằng Markdown cực kỳ chuyên sâu và dài dòng (Tối thiểu 400 chữ/bài).
- BẮT BUỘC MỖI CHẶNG phải có TỪ 2 ĐẾN 3 bài học. 
- Về Tiêu đề (title): Phải rõ ràng, ngắn gọn, có action-verb.
- ÁP DỤNG CHAIN-OF-THOUGHT: Trong phần Markdown *content*, BẮT BUỘC phải chia làm 4 mục rõ ràng:
  1. Khái niệm cốt lõi (Giải thích bản chất, định nghĩa)
  2. Ví dụ thực tế (Minh họa cụ thể bằng trường hợp cụ thể)
  3. Hướng dẫn chi tiết / Code Minh Họa (Cách làm từng bước)
  4. Bài tập thực hành (Giao việc cụ thể để người học làm)
- KHÔNG CẦN CHÈN LINK (URL). Tuyệt đối bỏ qua phần tài liệu tham khảo để hệ thống tự xử lý.

BẠN ĐANG ĐƯỢC CHẠY CHẾ ĐỘ JSON SCHEMA CỦA GOOGLE API. 
HÃY TRẢ VỀ DỮ LIỆU ĐÚNG THEO KIỂU JSON ĐÃ KHAI BÁO, KHÔNG KÈM VĂN BẢN HAY GIẢI THÍCH!`;

        const prompt = `${systemInstruction}\n\n===DÀN Ý TỪ ARCHITECT===\n${architectOutput}`;

        const teacherSchema = {
            description: "Cấu trúc dữ liệu của lộ trình học tập chi tiết",
            type: SchemaType.OBJECT,
            properties: {
                milestones: {
                    type: SchemaType.ARRAY,
                    description: "Danh sách 3-5 chặng học tập",
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            title: {
                                type: SchemaType.STRING,
                                description: "Tên ngắn gọn của chặng",
                            },
                            tasks: {
                                type: SchemaType.ARRAY,
                                description: "Danh sách 2-4 bài học bên trong chặng này",
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        title: {
                                            type: SchemaType.STRING,
                                            description: "Tên bài học",
                                        },
                                        content: {
                                            type: SchemaType.STRING,
                                            description: "Nội dung siêu chi tiết của bài học định dạng chuẩn XÁC 100% Markdown",
                                        }
                                    },
                                    required: ["title", "content"],
                                }
                            }
                        },
                        required: ["title", "tasks"],
                    }
                }
            },
            required: ["milestones"],
        };

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 8192,
                responseMimeType: "application/json",
                responseSchema: teacherSchema,
            }
        });

        const teacherResult = result.response.text();
        console.log('--- TEACHER OUTPUT (JSON SCHEMA) LENGTH ---', teacherResult.length);

        res.status(200).json({ success: true, data: teacherResult });
    } catch (error) {
        console.error('Teacher Agent Error:', error);
        res.status(500).json({ message: 'Lỗi soạn bài học chi tiết (Teacher Agent).', errorDetail: error.message });
    }
};

// 4. FORMATTER AGENT (Regex Parser) & LƯU DB
export const formatAndSaveRoadmap = async (req, res) => {
    try {
        const { topic, description, teacherOutput, researchData } = req.body;
        if (!teacherOutput || !topic) return res.status(400).json({ message: 'Thiếu dữ liệu tóm tắt hoặc chi tiết bài học.' });

        // Tạo Title ngắn gọn, cuốn hút bằng mô hình nhỏ, nhanh (Loại bỏ rủi ro xẻ thịt JSON bằng Cohere)
        const titleModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const titlePrompt = `Chủ đề của người duyệt là: "${topic}".
Hãy viết lại duy nhất 1 Tựa đề lộ trình học nghe thật chuyên nghiệp, ngắn gọn (Tối đa 8 chữ. Ví dụ: 'Hành Trình Chinh Phục ReactJS').
Chỉ trả về độ dài tựa đề, không bọc ngoặc phẩy, không giải thích.`;

        const titleResult = await titleModel.generateContent(titlePrompt);
        const catchyTitle = titleResult.response.text().replace(/["'\\]/g, '').trim();

        // Bóc tách Links từ Tavily data (Biến string Markdown - [Title](link) thành Mảng Object)
        const globalResources = [];
        if (researchData) {
            const linkRegex = new RegExp('\\[([^\\]]+)\\]\\((https?:\\/\\/[^\\)]+)\\)', 'g');
            let match;
            while ((match = linkRegex.exec(researchData)) !== null) {
                let type = 'link';
                const url = match[2].toLowerCase();
                if (url.includes('youtube.com') || url.includes('youtu.be')) type = 'youtube';
                else if (url.endsWith('.pdf')) type = 'pdf';
                globalResources.push({ name: match[1], url: match[2], type });
            }
        }

        const mappedMilestones = [];

        // Nếu JSON sinh ra quá dài và bị Gemini cắt đuôi do vượt giới hạn Max Tokens (Unterminated string)
        // Hệ thống sẽ tự động tìm cách "băng bó" chuỗi JSON phụ trợ để cứu vãn 90% dữ liệu đã sinh ra.
        // Auto-heal JSON Repair
        let aiData = null;
        try {
            aiData = JSON.parse(teacherOutput);
        } catch (originalError) {
            console.warn("⚠️ JSON bị cắt cụt do vượt Token Limit. Đang tiến hành vá lỗi tự động (Auto-Heal)...");

            let success = false;
            let repairedStr = teacherOutput;

            // Stack Parser Thông Minh: Cho phép cứu vãn C# Code Block hoặc bất kỳ chuỗi nào bị cắt ngang
            let inString = false;
            let isEscape = false;
            let stack = [];
            for (let j = 0; j < repairedStr.length; j++) {
                const c = repairedStr[j];
                if (isEscape) { isEscape = false; continue; }
                if (c === '\\') { isEscape = true; continue; }
                if (c === '"') { inString = !inString; continue; }
                if (!inString) {
                    if (c === '{') stack.push('}');
                    else if (c === '[') stack.push(']');
                    else if (c === '}') { if (stack[stack.length - 1] === '}') stack.pop(); }
                    else if (c === ']') { if (stack[stack.length - 1] === ']') stack.pop(); }
                }
            }

            // Nếu bị đứt ngang giữa chừng 1 string (ví dụ đang viết code C# dở) -> Đóng nháy kép lại
            if (inString) repairedStr += '"';

            // Xóa rác lơ lửng nếu có gõ dở một Key nhưng chưa có Value: `"content": `
            repairedStr = repairedStr.replace(/,\s*$/, '').replace(/"[^"]+"\s*:\s*$/, '').replace(/,\s*$/, '');

            // Lấy stack ra để đóng lần lượt các ngoặc theo đúng cấu trúc Node
            for (let k = stack.length - 1; k >= 0; k--) {
                repairedStr += stack[k];
            }

            try {
                aiData = JSON.parse(repairedStr);
                success = true;
                console.log(`✅ Khôi phục Token Limit thành công bằng Robust Stack Parser`);
            } catch (e) {
                // Fallback cuối cùng: Cắt tỉa dần từ đuôi để cứu vãn từng cụm ngoặc
                for (let i = teacherOutput.length - 1; i > Math.max(0, teacherOutput.length - 2000); i--) {
                    let testStr = teacherOutput.substring(0, i);
                    let inS = false, isE = false, st = [];
                    for (let j = 0; j < testStr.length; j++) {
                        let c = testStr[j];
                        if (isE) { isE = false; continue; }
                        if (c === '\\') { isE = true; continue; }
                        if (c === '"') { inS = !inS; continue; }
                        if (!inS) {
                            if (c === '{') st.push('}');
                            else if (c === '[') st.push(']');
                            else if (c === '}') { if (st[st.length - 1] === '}') st.pop(); }
                            else if (c === ']') { if (st[st.length - 1] === ']') st.pop(); }
                        }
                    }
                    if (inS) testStr += '"';
                    testStr = testStr.replace(/,\s*$/, '').replace(/"[^"]+"\s*:\s*$/, '').replace(/,\s*$/, '');
                    for (let k = st.length - 1; k >= 0; k--) testStr += st[k];

                    try {
                        aiData = JSON.parse(testStr);
                        success = true;
                        console.log(`✅ Khôi phục thành công bằng cách cắt tỉa đứt đuôi vệ tinh`);
                        break;
                    } catch (err) {
                    }
                }
            }

            if (!success) {
                console.error("❌ Không thể cứu vãn JSON:", originalError.message);
                aiData = { milestones: [] };
            }
        }

        const rawMilestones = aiData.milestones || [];

        let mCount = 1;
        for (const mBlock of rawMilestones) {
            let rawMilestoneTitle = mBlock.title || `Chặng ${mCount}`;
            mCount++;

            const tasks = [];
            const rawTasks = mBlock.tasks || [];

            for (const tBlock of rawTasks) {
                let taskTitle = tBlock.title || 'Bài học phụ';
                let taskContentRaw = tBlock.content || `Nội dung trống cho ${taskTitle}`;

                tasks.push({
                    title: taskTitle,
                    content: marked.parse(taskContentRaw),
                    resources: globalResources,
                    isCompleted: false,
                    timeSpent: 0
                });
            }

            if (tasks.length > 0) {
                mappedMilestones.push({
                    title: rawMilestoneTitle,
                    tasks: tasks
                });
            }
        }

        if (mappedMilestones.length === 0) {
            return res.status(422).json({ message: "Lỗi nội suy dữ liệu JSON. Xin hãy bấm 'Tạo Phép Thuật' lại 1 lần nữa!" });
        }

        const finalRoadmap = new Roadmap({
            title: catchyTitle || topic,
            description: description || "Lộ trình tự học được tối ưu hóa bởi AI Multi-Agent Workflow.",
            author: req.user.id, // User auth via middleware
            isPublic: false,
            milestones: mappedMilestones,
            themeColor: 'indigo'
        });

        await finalRoadmap.save();

        res.status(201).json({ success: true, data: finalRoadmap._id });
    } catch (error) {
        console.error('Formatter Agent Error:', error);
        res.status(500).json({ message: 'Lỗi chuẩn hóa dữ liệu hoặc lưu Database (Formatter Agent).', errorDetail: error.message });
    }
};

// 5. AI LEARNING MENTOR (Chatbot - Gemini 2.5 Flash)
export const chatWithMentor = async (req, res) => {
    try {
        const { message, history, context } = req.body;
        if (!message) return res.status(400).json({ message: 'Missing message.' });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let systemPrompt = `Bạn là một AI Learning Mentor (Gia sư học tập AI) nhiệt tình và có chuyên môn cao. 
Nhiệm vụ của bạn là giải đáp các câu hỏi, giải thích các khái niệm được yêu cầu, và cung cấp bài tập nếu cần thiết. 
Luôn hướng dẫn từng bước nhỏ, khuyến khích người học. Trả lời bằng Tiếng Việt thân thiện.`;

        if (context) {
            systemPrompt += `\n\n=== NGỮ CẢNH BÀI HỌC HIỆN TẠI ===\nTiêu đề: ${context.title}\nNội dung bài học: ${context.content}`;
        }

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 1000,
            }
        });

        // Tạm thời truyền system prompt bằng cách ghép vào tin nhắn nếu Gemini không hỗ trợ role system ở history cũ.
        // Google Gemini Node SDK thường dùng message đầu tiên cho system instruction hoặc set up properties.
        // Ở đây ta ghép ngắn gọn vào context.
        const fullMessage = context ? `${systemPrompt}\n\nNgười dùng hỏi: ${message}` : message;

        const result = await chat.sendMessage(fullMessage);

        res.status(200).json({ success: true, response: result.response.text() });
    } catch (error) {
        console.error('AI Mentor Error:', error);
        res.status(500).json({ message: 'AI Mentor đang bận hoặc gặp lỗi.', errorDetail: error.message });
    }
};
