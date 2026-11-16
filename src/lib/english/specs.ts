import { choices, talk } from "./choices";
import type { LessonSpec } from "./lessonTypes";

const thankCoach =
  "Một số người nói tiếng Việt thấy âm đầu của thank lạ. Nghe mẫu, rồi nói sao cho người nghe ra từ thank. Không cần giống người bản ngữ.";

const finalCoach =
  "Âm cuối giúp người nghe phân biệt từ. Nói đủ từ. Không cần giọng bản ngữ, và bài học không giả định bạn đang bỏ âm.";

export const LESSON_SPECS: LessonSpec[] = [
  {
    day: 1,
    week: 1,
    titleEn: "Hello, goodbye, thank you",
    titleVi: "Chào, tạm biệt, cảm ơn",
    objectives: [
      "Chào, tạm biệt và cảm ơn bằng câu rất ngắn.",
      "Nghe mẫu trước khi nói.",
    ],
    vocabulary: [
      { en: "Hello", vi: "Xin chào", ipa: "həˈloʊ" },
      { en: "Goodbye", vi: "Tạm biệt", ipa: "ˌɡʊdˈbaɪ" },
      { en: "Thank you", vi: "Cảm ơn", ipa: "ˈθæŋk ju" },
    ],
    targets: ["Hello", "Thank you", "Goodbye"],
    focus: { en: "Hello", vi: "Xin chào", ipa: "həˈloʊ" },
    alts: [
      { en: "Goodbye", vi: "Tạm biệt", ipa: "ˌɡʊdˈbaɪ" },
      { en: "Thank you", vi: "Cảm ơn", ipa: "ˈθæŋk ju", coach: thankCoach },
    ],
    recognize: {
      instruction: "Hello nghĩa là gì?",
      en: "Hello",
      choices: choices([
        ["hello", "Xin chào"],
        ["bye", "Tạm biệt"],
        ["price", "Bao nhiêu tiền"],
      ]),
      answerId: "hello",
    },
    understand: {
      instruction: "Khi nào mình nói Thank you?",
      choices: choices([
        ["thanks", "Khi muốn cảm ơn"],
        ["where", "Khi hỏi đường"],
      ]),
      answerId: "thanks",
    },
    combine: {
      instruction: "Ghép câu chào và giới thiệu tên.",
      tokens: ["Hello", "my", "name", "is", "Lan"],
      vi: "Xin chào. Tôi tên là Lan.",
    },
    converse: {
      instruction: "Nghe giáo viên, rồi nói câu của bạn. Có thể nghe gợi ý.",
      lines: talk(
        ["Hello!", "Xin chào!"],
        ["Hello, my name is Lan.", "Xin chào. Tôi tên là Lan."],
        ["Nice to meet you.", "Rất vui được gặp bạn."],
      ),
    },
    review: [
      { en: "Hello", vi: "Xin chào" },
      { en: "Goodbye", vi: "Tạm biệt" },
      { en: "Thank you", vi: "Cảm ơn" },
      { en: "Hello, my name is Lan.", vi: "Xin chào. Tôi tên là Lan." },
    ],
  },
  {
    day: 2,
    week: 1,
    titleEn: "My name is",
    titleVi: "Tôi tên là",
    objectives: ["Nói tên của mình.", "Hỏi tên người khác bằng một câu ngắn."],
    vocabulary: [
      { en: "My name is", vi: "Tôi tên là" },
      { en: "What is your name?", vi: "Bạn tên là gì?" },
      { en: "Nice to meet you", vi: "Rất vui được gặp bạn" },
    ],
    targets: ["My name is"],
    focus: { en: "My name is Lan.", vi: "Tôi tên là Lan." },
    alts: [{ en: "What is your name?", vi: "Bạn tên là gì?" }],
    recognize: {
      instruction: "My name is Lan nghĩa là gì?",
      en: "My name is Lan.",
      choices: choices([
        ["name", "Tôi tên là Lan"],
        ["from", "Tôi đến từ Lan"],
        ["bye", "Tạm biệt Lan"],
      ]),
      answerId: "name",
    },
    understand: {
      instruction: "Câu nào dùng để hỏi tên?",
      choices: choices([
        ["ask", "What is your name?"],
        ["thanks", "Thank you"],
      ]),
      answerId: "ask",
    },
    combine: {
      instruction: "Ghép câu nói tên Minh.",
      tokens: ["My", "name", "is", "Minh"],
      vi: "Tôi tên là Minh.",
    },
    converse: {
      instruction: "Một lượt chào và nói tên.",
      lines: talk(
        ["Hello. What is your name?", "Xin chào. Bạn tên là gì?"],
        ["My name is Lan.", "Tôi tên là Lan."],
        ["Nice to meet you, Lan.", "Rất vui được gặp Lan."],
      ),
    },
    review: [
      { en: "My name is Lan.", vi: "Tôi tên là Lan." },
      { en: "What is your name?", vi: "Bạn tên là gì?" },
      { en: "Nice to meet you.", vi: "Rất vui được gặp bạn." },
    ],
  },
  {
    day: 3,
    week: 1,
    titleEn: "Yes, no, please, sorry",
    titleVi: "Có, không, làm ơn, xin lỗi",
    objectives: ["Trả lời có hoặc không.", "Nói làm ơn và xin lỗi."],
    vocabulary: [
      { en: "Yes", vi: "Có, vâng" },
      { en: "No", vi: "Không" },
      { en: "Please", vi: "Làm ơn" },
      { en: "Sorry", vi: "Xin lỗi" },
    ],
    targets: ["Yes, please", "Sorry"],
    focus: { en: "Yes, please.", vi: "Vâng, làm ơn." },
    alts: [
      { en: "No, thank you.", vi: "Không, cảm ơn." },
      { en: "Sorry.", vi: "Xin lỗi." },
    ],
    recognize: {
      instruction: "Sorry nghĩa là gì?",
      en: "Sorry.",
      choices: choices([
        ["sorry", "Xin lỗi"],
        ["please", "Làm ơn"],
        ["hello", "Xin chào"],
      ]),
      answerId: "sorry",
    },
    understand: {
      instruction: "Khi ai đó mời nước và bạn muốn nhận, nói gì?",
      choices: choices([
        ["yes", "Yes, please"],
        ["no-name", "What is your name?"],
      ]),
      answerId: "yes",
    },
    combine: {
      instruction: "Ghép câu nhận lời, lịch sự.",
      tokens: ["Yes", "please"],
      vi: "Vâng, làm ơn.",
    },
    converse: {
      instruction: "Giáo viên mời. Bạn trả lời.",
      lines: talk(
        ["Coffee?", "Cà phê không?"],
        ["Yes, please.", "Vâng, làm ơn."],
        ["Here you are.", "Của bạn đây."],
      ),
    },
    review: [
      { en: "Yes, please.", vi: "Vâng, làm ơn." },
      { en: "No, thank you.", vi: "Không, cảm ơn." },
      { en: "Sorry.", vi: "Xin lỗi." },
    ],
  },
  {
    day: 4,
    week: 1,
    titleEn: "Numbers 1 to 10",
    titleVi: "Số từ 1 đến 10",
    objectives: ["Nghe và nói số 1 đến 10.", "Nói số lượng rất đơn giản."],
    vocabulary: [
      { en: "one", vi: "một" },
      { en: "two", vi: "hai" },
      { en: "three", vi: "ba" },
      { en: "four", vi: "bốn" },
      { en: "five", vi: "năm" },
      { en: "six", vi: "sáu" },
      { en: "seven", vi: "bảy" },
      { en: "eight", vi: "tám" },
      { en: "nine", vi: "chín" },
      { en: "ten", vi: "mười" },
    ],
    targets: ["two", "five"],
    focus: { en: "I need two.", vi: "Tôi cần hai." },
    alts: [
      { en: "three", vi: "ba" },
      { en: "five", vi: "năm" },
      { en: "ten", vi: "mười" },
    ],
    recognize: {
      instruction: "Nghe từ three. Nghĩa là số nào?",
      en: "three",
      choices: choices([
        ["3", "ba"],
        ["4", "bốn"],
        ["30", "ba mươi"],
      ]),
      answerId: "3",
    },
    understand: {
      instruction: "I need two dùng khi nào?",
      choices: choices([
        ["qty", "Khi nói mình cần hai cái"],
        ["name", "Khi nói tên mình"],
      ]),
      answerId: "qty",
    },
    combine: {
      instruction: "Ghép câu cần năm cái.",
      tokens: ["I", "need", "five"],
      vi: "Tôi cần năm.",
    },
    converse: {
      instruction: "Người bán hỏi số lượng.",
      lines: talk(
        ["How many?", "Mấy cái?"],
        ["Two, please.", "Hai, làm ơn."],
        ["Two. Here you are.", "Hai. Của bạn đây."],
      ),
    },
    review: [
      { en: "one", vi: "một" },
      { en: "two", vi: "hai" },
      { en: "five", vi: "năm" },
      { en: "ten", vi: "mười" },
      { en: "I need two.", vi: "Tôi cần hai." },
    ],
  },
  {
    day: 5,
    week: 1,
    titleEn: "Numbers 11 to 100",
    titleVi: "Số từ 11 đến 100",
    objectives: ["Phân biệt số mười mấy và số chục.", "Nói một giá hoặc số lượng tròn chục."],
    vocabulary: [
      { en: "eleven", vi: "mười một" },
      { en: "twelve", vi: "mười hai" },
      { en: "fifteen", vi: "mười lăm" },
      { en: "twenty", vi: "hai mươi" },
      { en: "thirty", vi: "ba mươi" },
      { en: "fifty", vi: "năm mươi" },
      { en: "one hundred", vi: "một trăm" },
    ],
    targets: ["fifteen", "fifty", "twenty"],
    focus: {
      en: "twenty",
      vi: "hai mươi",
      coach: "twenty nhấn ở đầu từ. Nói chậm là được.",
    },
    alts: [
      {
        en: "fifteen",
        vi: "mười lăm",
        coach: "fifteen thường nhấn về phía cuối. fifty nhấn ở đầu. Nghe hai từ riêng, không cần nói giống hệt.",
      },
      { en: "fifty", vi: "năm mươi" },
      { en: "one hundred", vi: "một trăm" },
    ],
    recognize: {
      instruction: "fifteen là số nào?",
      en: "fifteen",
      choices: choices([
        ["15", "mười lăm"],
        ["50", "năm mươi"],
        ["5", "năm"],
      ]),
      answerId: "15",
    },
    understand: {
      instruction: "fifty nghĩa là gì?",
      choices: choices([
        ["50", "năm mươi"],
        ["15", "mười lăm"],
      ]),
      answerId: "50",
    },
    combine: {
      instruction: "Ghép câu cần hai mươi.",
      tokens: ["I", "need", "twenty"],
      vi: "Tôi cần hai mươi.",
    },
    converse: {
      instruction: "Nói số lượng hai mươi.",
      lines: talk(
        ["How many?", "Bao nhiêu?"],
        ["Twenty, please.", "Hai mươi, làm ơn."],
        ["Twenty. Thank you.", "Hai mươi. Cảm ơn."],
      ),
    },
    review: [
      { en: "fifteen", vi: "mười lăm" },
      { en: "twenty", vi: "hai mươi" },
      { en: "fifty", vi: "năm mươi" },
      { en: "one hundred", vi: "một trăm" },
    ],
  },
  {
    day: 6,
    week: 1,
    titleEn: "Simple questions",
    titleVi: "Câu hỏi đơn giản",
    objectives: ["Hỏi thăm và hỏi giá bằng câu ngắn.", "Nghe được câu hỏi trước khi trả lời."],
    vocabulary: [
      { en: "How are you?", vi: "Bạn khỏe không?" },
      { en: "I am fine", vi: "Tôi khỏe" },
      { en: "How much is it?", vi: "Cái này bao nhiêu tiền?" },
      { en: "Where is it?", vi: "Nó ở đâu?" },
    ],
    targets: ["How are you?", "How much is it?"],
    focus: { en: "How are you?", vi: "Bạn khỏe không?" },
    alts: [
      { en: "I am fine, thank you.", vi: "Tôi khỏe, cảm ơn." },
      { en: "How much is it?", vi: "Cái này bao nhiêu tiền?" },
    ],
    recognize: {
      instruction: "How much is it? đang hỏi gì?",
      en: "How much is it?",
      choices: choices([
        ["price", "Hỏi giá"],
        ["name", "Hỏi tên"],
        ["health", "Hỏi sức khỏe"],
      ]),
      answerId: "price",
    },
    understand: {
      instruction: "Khi gặp người quen, câu nào tự nhiên?",
      choices: choices([
        ["how", "How are you?"],
        ["much", "How much is it?"],
      ]),
      answerId: "how",
    },
    combine: {
      instruction: "Ghép câu trả lời khỏe.",
      tokens: ["I", "am", "fine"],
      vi: "Tôi khỏe.",
    },
    converse: {
      instruction: "Chào và hỏi thăm.",
      lines: talk(
        ["Hello. How are you?", "Xin chào. Bạn khỏe không?"],
        ["I am fine, thank you.", "Tôi khỏe, cảm ơn."],
        ["Good.", "Tốt."],
      ),
    },
    review: [
      { en: "How are you?", vi: "Bạn khỏe không?" },
      { en: "I am fine, thank you.", vi: "Tôi khỏe, cảm ơn." },
      { en: "How much is it?", vi: "Cái này bao nhiêu tiền?" },
    ],
  },
  {
    day: 7,
    week: 1,
    titleEn: "Week 1 review",
    titleVi: "Ôn tuần 1",
    objectives: ["Nhắc lại chào, tên, số và câu hỏi.", "Nói một lượt ngắn không cần bài mới."],
    vocabulary: [
      { en: "Hello", vi: "Xin chào" },
      { en: "My name is Lan", vi: "Tôi tên là Lan" },
      { en: "Thank you", vi: "Cảm ơn" },
      { en: "twenty", vi: "hai mươi" },
    ],
    targets: ["Hello", "Thank you", "My name is Lan"],
    focus: { en: "Hello, my name is Lan.", vi: "Xin chào. Tôi tên là Lan." },
    alts: [
      { en: "Thank you.", vi: "Cảm ơn.", coach: thankCoach },
      { en: "I need twenty.", vi: "Tôi cần hai mươi." },
    ],
    recognize: {
      instruction: "Goodbye nghĩa là gì?",
      en: "Goodbye",
      choices: choices([
        ["bye", "Tạm biệt"],
        ["hello", "Xin chào"],
        ["sorry", "Xin lỗi"],
      ]),
      answerId: "bye",
    },
    understand: {
      instruction: "Câu nào vừa chào vừa nói tên?",
      choices: choices([
        ["intro", "Hello, my name is Lan."],
        ["qty", "I need two."],
      ]),
      answerId: "intro",
    },
    combine: {
      instruction: "Ghép lời cảm ơn.",
      tokens: ["Thank", "you"],
      vi: "Cảm ơn.",
    },
    converse: {
      instruction: "Một đoạn rất ngắn của tuần 1.",
      lines: talk(
        ["Hello. What is your name?", "Xin chào. Bạn tên là gì?"],
        ["My name is Lan. Thank you.", "Tôi tên là Lan. Cảm ơn."],
        ["Goodbye.", "Tạm biệt."],
      ),
    },
    review: [
      { en: "Hello", vi: "Xin chào" },
      { en: "My name is Lan.", vi: "Tôi tên là Lan." },
      { en: "Yes, please.", vi: "Vâng, làm ơn." },
      { en: "Thank you.", vi: "Cảm ơn." },
      { en: "How are you?", vi: "Bạn khỏe không?" },
    ],
  },
  {
    day: 8,
    week: 2,
    titleEn: "Food and drinks",
    titleVi: "Đồ ăn và thức uống",
    objectives: ["Gọi một món ăn hoặc thức uống.", "Nghe tên món quen."],
    vocabulary: [
      { en: "water", vi: "nước" },
      { en: "coffee", vi: "cà phê" },
      { en: "tea", vi: "trà" },
      { en: "rice", vi: "cơm" },
      { en: "bread", vi: "bánh mì" },
      { en: "milk", vi: "sữa" },
    ],
    targets: ["coffee", "water"],
    focus: { en: "I would like coffee.", vi: "Tôi muốn cà phê." },
    alts: [
      { en: "water", vi: "nước" },
      { en: "tea", vi: "trà" },
      { en: "rice", vi: "cơm" },
    ],
    recognize: {
      instruction: "tea nghĩa là gì?",
      en: "tea",
      choices: choices([
        ["tea", "trà"],
        ["coffee", "cà phê"],
        ["rice", "cơm"],
      ]),
      answerId: "tea",
    },
    understand: {
      instruction: "I would like coffee dùng để làm gì?",
      choices: choices([
        ["order", "Gọi một ly cà phê"],
        ["name", "Nói tên mình"],
      ]),
      answerId: "order",
    },
    combine: {
      instruction: "Ghép câu gọi nước.",
      tokens: ["I", "would", "like", "water"],
      vi: "Tôi muốn nước.",
    },
    converse: {
      instruction: "Gọi món với người phục vụ.",
      lines: talk(
        ["What would you like?", "Bạn muốn dùng gì?"],
        ["I would like coffee, please.", "Tôi muốn cà phê, làm ơn."],
        ["Coffee. One moment.", "Cà phê. Xin chờ một chút."],
      ),
    },
    review: [
      { en: "water", vi: "nước" },
      { en: "coffee", vi: "cà phê" },
      { en: "tea", vi: "trà" },
      { en: "rice", vi: "cơm" },
      { en: "I would like coffee.", vi: "Tôi muốn cà phê." },
    ],
  },
  {
    day: 9,
    week: 2,
    titleEn: "Buying and selling",
    titleVi: "Mua và bán",
    objectives: ["Nói mình muốn mua.", "Nghe từ mua và bán."],
    vocabulary: [
      { en: "buy", vi: "mua" },
      { en: "sell", vi: "bán" },
      { en: "this", vi: "cái này" },
      { en: "that", vi: "cái kia" },
    ],
    targets: ["buy", "this"],
    focus: {
      en: "I want to buy this.",
      vi: "Tôi muốn mua cái này.",
      coach:
        "this có âm đầu mà một số người thấy gần với âm đ. Nghe mẫu. Bài không giả định bạn nói sai.",
    },
    alts: [
      { en: "I sell coffee.", vi: "Tôi bán cà phê." },
      { en: "that", vi: "cái kia" },
    ],
    recognize: {
      instruction: "sell nghĩa là gì?",
      en: "sell",
      choices: choices([
        ["sell", "bán"],
        ["buy", "mua"],
        ["tea", "trà"],
      ]),
      answerId: "sell",
    },
    understand: {
      instruction: "Bạn đang đứng ở quầy và muốn lấy món trước mặt. Câu nào hợp?",
      choices: choices([
        ["this", "I want to buy this."],
        ["name", "What is your name?"],
      ]),
      answerId: "this",
    },
    combine: {
      instruction: "Ghép câu mua cơm.",
      tokens: ["I", "want", "to", "buy", "rice"],
      vi: "Tôi muốn mua cơm.",
    },
    converse: {
      instruction: "Một lượt mua hàng.",
      lines: talk(
        ["Can I help you?", "Tôi giúp gì được cho bạn?"],
        ["I want to buy this.", "Tôi muốn mua cái này."],
        ["This one. Yes.", "Cái này. Được."],
      ),
    },
    review: [
      { en: "buy", vi: "mua" },
      { en: "sell", vi: "bán" },
      { en: "this", vi: "cái này" },
      { en: "I want to buy this.", vi: "Tôi muốn mua cái này." },
    ],
  },
  {
    day: 10,
    week: 2,
    titleEn: "Prices",
    titleVi: "Giá",
    objectives: ["Hỏi giá.", "Nói một giá bằng đô la."],
    vocabulary: [
      { en: "How much is it?", vi: "Bao nhiêu tiền?" },
      { en: "dollar", vi: "đô la" },
      { en: "It's five dollars", vi: "Năm đô la" },
      { en: "It's ten dollars", vi: "Mười đô la" },
    ],
    targets: ["dollars"],
    focus: {
      en: "It's ten dollars.",
      vi: "Mười đô la.",
      coach: `${finalCoach} dollars có âm cuối.`,
    },
    alts: [
      { en: "How much is it?", vi: "Bao nhiêu tiền?" },
      { en: "It's five dollars.", vi: "Năm đô la." },
    ],
    recognize: {
      instruction: "It's five dollars là giá nào?",
      en: "It's five dollars.",
      choices: choices([
        ["5", "năm đô la"],
        ["10", "mười đô la"],
        ["50", "năm mươi đô la"],
      ]),
      answerId: "5",
    },
    understand: {
      instruction: "Muốn biết giá, hỏi câu nào?",
      choices: choices([
        ["price", "How much is it?"],
        ["name", "What is your name?"],
      ]),
      answerId: "price",
    },
    combine: {
      instruction: "Ghép giá hai mươi đô.",
      tokens: ["It's", "twenty", "dollars"],
      vi: "Hai mươi đô la.",
    },
    converse: {
      instruction: "Hỏi giá rồi nghe câu trả lời.",
      lines: talk(
        ["How much is it?", "Bao nhiêu tiền?"],
        ["It's ten dollars.", "Mười đô la."],
        ["Thank you.", "Cảm ơn."],
      ),
    },
    review: [
      { en: "How much is it?", vi: "Bao nhiêu tiền?" },
      { en: "It's five dollars.", vi: "Năm đô la." },
      { en: "It's ten dollars.", vi: "Mười đô la." },
    ],
  },
  {
    day: 11,
    week: 2,
    titleEn: "Money and quantities",
    titleVi: "Tiền và số lượng",
    objectives: ["Nói ký, chai, ly.", "Ghép số lượng với đồ vật."],
    vocabulary: [
      { en: "a kilo", vi: "một ký" },
      { en: "a bottle", vi: "một chai" },
      { en: "a cup", vi: "một ly" },
      { en: "some", vi: "một ít" },
    ],
    targets: ["kilo", "bottle"],
    focus: {
      en: "A kilo of rice.",
      vi: "Một ký cơm.",
      coach: finalCoach,
    },
    alts: [
      { en: "a bottle", vi: "một chai" },
      { en: "a cup of coffee", vi: "một ly cà phê" },
    ],
    recognize: {
      instruction: "a bottle nghĩa là gì?",
      en: "a bottle",
      choices: choices([
        ["bottle", "một chai"],
        ["cup", "một ly"],
        ["kilo", "một ký"],
      ]),
      answerId: "bottle",
    },
    understand: {
      instruction: "Bạn cần gạo theo ký. Câu nào đúng việc đó?",
      choices: choices([
        ["rice", "A kilo of rice."],
        ["name", "My name is Lan."],
      ]),
      answerId: "rice",
    },
    combine: {
      instruction: "Ghép câu cần hai chai.",
      tokens: ["I", "need", "two", "bottles"],
      vi: "Tôi cần hai chai.",
    },
    converse: {
      instruction: "Mua gạo.",
      lines: talk(
        ["What do you need?", "Bạn cần gì?"],
        ["A kilo of rice, please.", "Một ký gạo, làm ơn."],
        ["One kilo. Yes.", "Một ký. Được."],
      ),
    },
    review: [
      { en: "a kilo", vi: "một ký" },
      { en: "a bottle", vi: "một chai" },
      { en: "a cup of coffee", vi: "một ly cà phê" },
      { en: "I need two bottles.", vi: "Tôi cần hai chai." },
    ],
  },
  {
    day: 12,
    week: 2,
    titleEn: "Directions",
    titleVi: "Chỉ đường",
    objectives: ["Nghe trái, phải, đi thẳng.", "Hỏi một nơi gần."],
    vocabulary: [
      { en: "left", vi: "trái" },
      { en: "right", vi: "phải" },
      { en: "straight", vi: "thẳng" },
      { en: "near", vi: "gần" },
      { en: "the market", vi: "chợ" },
    ],
    targets: ["left", "straight"],
    focus: {
      en: "Turn left.",
      vi: "Rẽ trái.",
      coach: `${finalCoach} left có âm cuối.`,
    },
    alts: [
      {
        en: "Go straight.",
        vi: "Đi thẳng.",
        coach: "straight bắt đầu bằng cụm âm str. Nghe cả cụm, rồi nói chậm nếu bạn muốn.",
      },
      { en: "Where is the market?", vi: "Chợ ở đâu?" },
    ],
    recognize: {
      instruction: "right nghĩa là hướng nào?",
      en: "right",
      choices: choices([
        ["right", "phải"],
        ["left", "trái"],
        ["near", "gần"],
      ]),
      answerId: "right",
    },
    understand: {
      instruction: "Muốn hỏi chợ, nói câu nào?",
      choices: choices([
        ["where", "Where is the market?"],
        ["price", "It's ten dollars."],
      ]),
      answerId: "where",
    },
    combine: {
      instruction: "Ghép câu đi thẳng.",
      tokens: ["Go", "straight"],
      vi: "Đi thẳng.",
    },
    converse: {
      instruction: "Hỏi đường tới chợ.",
      lines: talk(
        ["Where is the market?", "Chợ ở đâu?"],
        ["Turn left.", "Rẽ trái."],
        ["Thank you.", "Cảm ơn."],
      ),
    },
    review: [
      { en: "Turn left.", vi: "Rẽ trái." },
      { en: "right", vi: "phải" },
      { en: "Go straight.", vi: "Đi thẳng." },
      { en: "Where is the market?", vi: "Chợ ở đâu?" },
    ],
  },
  {
    day: 13,
    week: 2,
    titleEn: "Time and dates",
    titleVi: "Giờ và ngày",
    objectives: ["Nói một giờ tròn.", "Nói hôm nay và ngày mai."],
    vocabulary: [
      { en: "today", vi: "hôm nay" },
      { en: "tomorrow", vi: "ngày mai" },
      { en: "morning", vi: "buổi sáng" },
      { en: "nine o'clock", vi: "chín giờ" },
      { en: "Monday", vi: "thứ Hai" },
    ],
    targets: ["tomorrow", "o'clock"],
    focus: { en: "See you tomorrow.", vi: "Hẹn gặp bạn ngày mai." },
    alts: [
      { en: "It's nine o'clock.", vi: "Bây giờ là chín giờ." },
      { en: "today", vi: "hôm nay" },
    ],
    recognize: {
      instruction: "tomorrow nghĩa là gì?",
      en: "tomorrow",
      choices: choices([
        ["tom", "ngày mai"],
        ["today", "hôm nay"],
        ["morning", "buổi sáng"],
      ]),
      answerId: "tom",
    },
    understand: {
      instruction: "It's nine o'clock nói về điều gì?",
      choices: choices([
        ["time", "Giờ"],
        ["price", "Giá tiền"],
      ]),
      answerId: "time",
    },
    combine: {
      instruction: "Ghép câu mười giờ.",
      tokens: ["It's", "ten", "o'clock"],
      vi: "Mười giờ.",
    },
    converse: {
      instruction: "Hẹn ngày mai.",
      lines: talk(
        ["See you tomorrow.", "Hẹn gặp bạn ngày mai."],
        ["Tomorrow. Thank you.", "Ngày mai. Cảm ơn."],
        ["Goodbye.", "Tạm biệt."],
      ),
    },
    review: [
      { en: "today", vi: "hôm nay" },
      { en: "tomorrow", vi: "ngày mai" },
      { en: "It's nine o'clock.", vi: "Chín giờ." },
      { en: "See you tomorrow.", vi: "Hẹn gặp bạn ngày mai." },
    ],
  },
  {
    day: 14,
    week: 2,
    titleEn: "Week 2 review",
    titleVi: "Ôn tuần 2",
    objectives: ["Ôn đồ ăn, giá, số lượng và đường.", "Nói một câu mua hàng trọn vẹn."],
    vocabulary: [
      { en: "coffee", vi: "cà phê" },
      { en: "How much is it?", vi: "Bao nhiêu tiền?" },
      { en: "A kilo of rice", vi: "Một ký gạo" },
      { en: "Turn left", vi: "Rẽ trái" },
    ],
    targets: ["coffee", "dollars", "left"],
    focus: { en: "I would like coffee.", vi: "Tôi muốn cà phê." },
    alts: [
      { en: "It's ten dollars.", vi: "Mười đô la." },
      { en: "Turn left.", vi: "Rẽ trái." },
    ],
    recognize: {
      instruction: "Go straight nghĩa là gì?",
      en: "Go straight.",
      choices: choices([
        ["straight", "Đi thẳng"],
        ["left", "Rẽ trái"],
        ["tomorrow", "Ngày mai"],
      ]),
      answerId: "straight",
    },
    understand: {
      instruction: "Câu nào vừa gọi món vừa lịch sự?",
      choices: choices([
        ["order", "I would like coffee, please."],
        ["time", "See you tomorrow."],
      ]),
      answerId: "order",
    },
    combine: {
      instruction: "Ghép câu hỏi giá.",
      tokens: ["How", "much", "is", "it"],
      vi: "Bao nhiêu tiền?",
    },
    converse: {
      instruction: "Mua cà phê và hỏi giá.",
      lines: talk(
        ["What would you like?", "Bạn muốn gì?"],
        ["Coffee, please. How much is it?", "Cà phê, làm ơn. Bao nhiêu tiền?"],
        ["It's five dollars.", "Năm đô la."],
      ),
    },
    review: [
      { en: "I would like coffee.", vi: "Tôi muốn cà phê." },
      { en: "I want to buy this.", vi: "Tôi muốn mua cái này." },
      { en: "It's ten dollars.", vi: "Mười đô la." },
      { en: "A kilo of rice.", vi: "Một ký gạo." },
      { en: "Turn left.", vi: "Rẽ trái." },
    ],
  },
];
