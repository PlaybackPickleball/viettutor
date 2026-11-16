import { choices, talk } from "./choices";
import type { LessonSpec } from "./lessonTypes";

const finalCoach =
  "Âm cuối giúp người nghe ra từ. Nói đủ từ là được. Không cần giọng bản ngữ.";

export const LESSON_SPECS_REST: LessonSpec[] = [
  {
    day: 15,
    week: 3,
    titleEn: "Family",
    titleVi: "Gia đình",
    objectives: ["Giới thiệu một người trong gia đình.", "Nghe các từ mẹ, cha, con."],
    vocabulary: [
      { en: "mother", vi: "mẹ" },
      { en: "father", vi: "cha" },
      { en: "child", vi: "con" },
      { en: "husband", vi: "chồng" },
      { en: "wife", vi: "vợ" },
      { en: "family", vi: "gia đình" },
    ],
    targets: ["mother", "family", "child"],
    focus: { en: "This is my mother.", vi: "Đây là mẹ tôi." },
    alts: [
      {
        en: "child",
        vi: "con",
        coach: "child bắt đầu bằng một âm giống chữ ch trong tiếng Anh. Nghe mẫu. Không cần nói giống hệt.",
      },
      { en: "family", vi: "gia đình" },
    ],
    recognize: {
      instruction: "father nghĩa là gì?",
      en: "father",
      choices: choices([
        ["father", "cha"],
        ["mother", "mẹ"],
        ["wife", "vợ"],
      ]),
      answerId: "father",
    },
    understand: {
      instruction: "This is my mother dùng để làm gì?",
      choices: choices([
        ["intro", "Giới thiệu mẹ"],
        ["buy", "Mua một món"],
      ]),
      answerId: "intro",
    },
    combine: {
      instruction: "Ghép câu giới thiệu gia đình.",
      tokens: ["This", "is", "my", "family"],
      vi: "Đây là gia đình tôi.",
    },
    converse: {
      instruction: "Giới thiệu mẹ.",
      lines: talk(
        ["Who is this?", "Đây là ai?"],
        ["This is my mother.", "Đây là mẹ tôi."],
        ["Nice to meet you.", "Rất vui được gặp."],
      ),
    },
    review: [
      { en: "mother", vi: "mẹ" },
      { en: "father", vi: "cha" },
      { en: "child", vi: "con" },
      { en: "This is my family.", vi: "Đây là gia đình tôi." },
    ],
  },
  {
    day: 16,
    week: 3,
    titleEn: "Jobs",
    titleVi: "Nghề nghiệp",
    objectives: ["Nói một nghề đơn giản.", "Nghe câu hỏi về việc làm."],
    vocabulary: [
      { en: "teacher", vi: "giáo viên" },
      { en: "seller", vi: "người bán hàng" },
      { en: "driver", vi: "tài xế" },
      { en: "cook", vi: "người nấu ăn" },
      { en: "I work", vi: "Tôi làm việc" },
    ],
    targets: ["seller", "teacher"],
    focus: { en: "I am a seller.", vi: "Tôi là người bán hàng." },
    alts: [
      { en: "I am a teacher.", vi: "Tôi là giáo viên." },
      { en: "driver", vi: "tài xế" },
    ],
    recognize: {
      instruction: "driver nghĩa là gì?",
      en: "driver",
      choices: choices([
        ["driver", "tài xế"],
        ["cook", "người nấu ăn"],
        ["teacher", "giáo viên"],
      ]),
      answerId: "driver",
    },
    understand: {
      instruction: "Bạn bán hàng ở cửa tiệm. Câu nào nói đúng việc đó?",
      choices: choices([
        ["seller", "I am a seller."],
        ["left", "Turn left."],
      ]),
      answerId: "seller",
    },
    combine: {
      instruction: "Ghép câu nói nghề giáo viên.",
      tokens: ["I", "am", "a", "teacher"],
      vi: "Tôi là giáo viên.",
    },
    converse: {
      instruction: "Hỏi và trả lời về việc làm.",
      lines: talk(
        ["What do you do?", "Bạn làm nghề gì?"],
        ["I am a seller.", "Tôi là người bán hàng."],
        ["I see. Thank you.", "Tôi hiểu. Cảm ơn."],
      ),
    },
    review: [
      { en: "teacher", vi: "giáo viên" },
      { en: "seller", vi: "người bán hàng" },
      { en: "driver", vi: "tài xế" },
      { en: "I am a seller.", vi: "Tôi là người bán hàng." },
    ],
  },
  {
    day: 17,
    week: 3,
    titleEn: "Where are you from",
    titleVi: "Bạn đến từ đâu",
    objectives: ["Nói mình đến từ Việt Nam.", "Hỏi người khác đến từ đâu."],
    vocabulary: [
      { en: "Where are you from?", vi: "Bạn đến từ đâu?" },
      { en: "I am from Vietnam", vi: "Tôi đến từ Việt Nam" },
      { en: "city", vi: "thành phố" },
      { en: "Ha Noi", vi: "Hà Nội" },
    ],
    targets: ["from", "Vietnam"],
    focus: { en: "I am from Vietnam.", vi: "Tôi đến từ Việt Nam." },
    alts: [
      { en: "Where are you from?", vi: "Bạn đến từ đâu?" },
      { en: "I am from Ha Noi.", vi: "Tôi đến từ Hà Nội." },
    ],
    recognize: {
      instruction: "I am from Vietnam nghĩa là gì?",
      en: "I am from Vietnam.",
      choices: choices([
        ["from", "Tôi đến từ Việt Nam"],
        ["name", "Tôi tên là Việt Nam"],
        ["work", "Tôi làm việc ở Việt Nam"],
      ]),
      answerId: "from",
    },
    understand: {
      instruction: "Câu nào là câu hỏi về quê hương?",
      choices: choices([
        ["ask", "Where are you from?"],
        ["job", "I am a seller."],
      ]),
      answerId: "ask",
    },
    combine: {
      instruction: "Ghép câu nói mình ở Hà Nội.",
      tokens: ["I", "am", "from", "Ha", "Noi"],
      vi: "Tôi đến từ Hà Nội.",
    },
    converse: {
      instruction: "Làm quen và nói mình đến từ đâu.",
      lines: talk(
        ["Where are you from?", "Bạn đến từ đâu?"],
        ["I am from Vietnam.", "Tôi đến từ Việt Nam."],
        ["Welcome.", "Chào mừng bạn."],
      ),
    },
    review: [
      { en: "Where are you from?", vi: "Bạn đến từ đâu?" },
      { en: "I am from Vietnam.", vi: "Tôi đến từ Việt Nam." },
      { en: "I am from Ha Noi.", vi: "Tôi đến từ Hà Nội." },
    ],
  },
  {
    day: 18,
    week: 3,
    titleEn: "Likes",
    titleVi: "Sở thích",
    objectives: ["Nói mình thích hoặc không thích.", "Hỏi người khác một câu ngắn."],
    vocabulary: [
      { en: "I like", vi: "Tôi thích" },
      { en: "I don't like", vi: "Tôi không thích" },
      { en: "Do you like coffee?", vi: "Bạn có thích cà phê không?" },
    ],
    targets: ["like"],
    focus: { en: "I like tea.", vi: "Tôi thích trà." },
    alts: [
      { en: "I don't like coffee.", vi: "Tôi không thích cà phê." },
      { en: "Do you like tea?", vi: "Bạn có thích trà không?" },
    ],
    recognize: {
      instruction: "I don't like coffee nghĩa là gì?",
      en: "I don't like coffee.",
      choices: choices([
        ["no", "Tôi không thích cà phê"],
        ["yes", "Tôi thích cà phê"],
        ["buy", "Tôi muốn mua cà phê"],
      ]),
      answerId: "no",
    },
    understand: {
      instruction: "Muốn nói mình thích trà, chọn câu nào?",
      choices: choices([
        ["like", "I like tea."],
        ["from", "I am from Vietnam."],
      ]),
      answerId: "like",
    },
    combine: {
      instruction: "Ghép câu thích cà phê.",
      tokens: ["I", "like", "coffee"],
      vi: "Tôi thích cà phê.",
    },
    converse: {
      instruction: "Hỏi sở thích rồi trả lời.",
      lines: talk(
        ["Do you like tea?", "Bạn có thích trà không?"],
        ["Yes. I like tea.", "Có. Tôi thích trà."],
        ["I like tea too.", "Tôi cũng thích trà."],
      ),
    },
    review: [
      { en: "I like tea.", vi: "Tôi thích trà." },
      { en: "I don't like coffee.", vi: "Tôi không thích cà phê." },
      { en: "Do you like tea?", vi: "Bạn có thích trà không?" },
    ],
  },
  {
    day: 19,
    week: 3,
    titleEn: "Daily routines",
    titleVi: "Việc hằng ngày",
    objectives: ["Nói một việc trong ngày.", "Nghe giờ gắn với việc đó."],
    vocabulary: [
      { en: "get up", vi: "thức dậy" },
      { en: "eat", vi: "ăn" },
      { en: "work", vi: "làm việc" },
      { en: "go home", vi: "về nhà" },
      { en: "sleep", vi: "ngủ" },
    ],
    targets: ["get up", "six"],
    focus: {
      en: "I get up at six.",
      vi: "Tôi thức dậy lúc sáu giờ.",
      coach: `${finalCoach} six có âm cuối.`,
    },
    alts: [
      { en: "I go home.", vi: "Tôi về nhà." },
      { en: "I eat rice.", vi: "Tôi ăn cơm." },
    ],
    recognize: {
      instruction: "go home nghĩa là gì?",
      en: "go home",
      choices: choices([
        ["home", "về nhà"],
        ["work", "làm việc"],
        ["sleep", "ngủ"],
      ]),
      answerId: "home",
    },
    understand: {
      instruction: "I get up at six nói về việc gì?",
      choices: choices([
        ["up", "Thức dậy lúc sáu giờ"],
        ["price", "Giá là sáu đô"],
      ]),
      answerId: "up",
    },
    combine: {
      instruction: "Ghép câu về nhà.",
      tokens: ["I", "go", "home"],
      vi: "Tôi về nhà.",
    },
    converse: {
      instruction: "Kể một việc trong ngày.",
      lines: talk(
        ["What time do you get up?", "Bạn thức dậy lúc mấy giờ?"],
        ["I get up at six.", "Tôi thức dậy lúc sáu giờ."],
        ["I see.", "Tôi hiểu."],
      ),
    },
    review: [
      { en: "I get up at six.", vi: "Tôi thức dậy lúc sáu giờ." },
      { en: "I go home.", vi: "Tôi về nhà." },
      { en: "I eat rice.", vi: "Tôi ăn cơm." },
    ],
  },
  {
    day: 20,
    week: 3,
    titleEn: "Asking for help",
    titleVi: "Nhờ giúp đỡ",
    objectives: ["Nhờ người khác giúp.", "Xin người kia nói chậm."],
    vocabulary: [
      { en: "Can you help me?", vi: "Bạn giúp tôi được không?" },
      { en: "I need help", vi: "Tôi cần giúp" },
      { en: "I don't understand", vi: "Tôi không hiểu" },
      { en: "Please speak slowly", vi: "Làm ơn nói chậm" },
    ],
    targets: ["help"],
    focus: { en: "Can you help me?", vi: "Bạn giúp tôi được không?" },
    alts: [
      { en: "I don't understand.", vi: "Tôi không hiểu." },
      { en: "Please speak slowly.", vi: "Làm ơn nói chậm." },
    ],
    recognize: {
      instruction: "Please speak slowly nghĩa là gì?",
      en: "Please speak slowly.",
      choices: choices([
        ["slow", "Làm ơn nói chậm"],
        ["fast", "Làm ơn nói nhanh"],
        ["bye", "Tạm biệt"],
      ]),
      answerId: "slow",
    },
    understand: {
      instruction: "Khi bạn chưa hiểu, câu nào hữu ích?",
      choices: choices([
        ["help", "I don't understand. Please speak slowly."],
        ["price", "It's ten dollars."],
      ]),
      answerId: "help",
    },
    combine: {
      instruction: "Ghép câu xin nói chậm.",
      tokens: ["Please", "speak", "slowly"],
      vi: "Làm ơn nói chậm.",
    },
    converse: {
      instruction: "Nhờ giúp, rồi xin nói chậm.",
      lines: talk(
        ["Can I help you?", "Tôi giúp được gì?"],
        ["Yes. Can you help me? Please speak slowly.", "Có. Bạn giúp tôi được không? Làm ơn nói chậm."],
        ["Of course. Slowly.", "Được. Tôi nói chậm."],
      ),
    },
    review: [
      { en: "Can you help me?", vi: "Bạn giúp tôi được không?" },
      { en: "I need help.", vi: "Tôi cần giúp." },
      { en: "I don't understand.", vi: "Tôi không hiểu." },
      { en: "Please speak slowly.", vi: "Làm ơn nói chậm." },
    ],
  },
  {
    day: 21,
    week: 3,
    titleEn: "Week 3 review",
    titleVi: "Ôn tuần 3",
    objectives: ["Ôn gia đình, nghề, quê và nhờ giúp.", "Nói một đoạn giới thiệu ngắn."],
    vocabulary: [
      { en: "This is my mother", vi: "Đây là mẹ tôi" },
      { en: "I am a seller", vi: "Tôi là người bán hàng" },
      { en: "I am from Vietnam", vi: "Tôi đến từ Việt Nam" },
      { en: "Can you help me?", vi: "Bạn giúp tôi được không?" },
    ],
    targets: ["mother", "Vietnam", "help"],
    focus: { en: "I am from Vietnam.", vi: "Tôi đến từ Việt Nam." },
    alts: [
      { en: "This is my mother.", vi: "Đây là mẹ tôi." },
      { en: "Can you help me?", vi: "Bạn giúp tôi được không?" },
    ],
    recognize: {
      instruction: "I like tea nghĩa là gì?",
      en: "I like tea.",
      choices: choices([
        ["like", "Tôi thích trà"],
        ["work", "Tôi làm việc"],
        ["home", "Tôi về nhà"],
      ]),
      answerId: "like",
    },
    understand: {
      instruction: "Đoạn nào là lời giới thiệu ngắn?",
      choices: choices([
        ["intro", "I am Lan. I am from Vietnam. I am a seller."],
        ["food", "A kilo of rice, please."],
      ]),
      answerId: "intro",
    },
    combine: {
      instruction: "Ghép câu nhờ giúp.",
      tokens: ["Can", "you", "help", "me"],
      vi: "Bạn giúp tôi được không?",
    },
    converse: {
      instruction: "Giới thiệu ngắn.",
      lines: talk(
        ["Hello. Where are you from?", "Xin chào. Bạn đến từ đâu?"],
        ["I am from Vietnam. I am a seller.", "Tôi đến từ Việt Nam. Tôi là người bán hàng."],
        ["Nice to meet you.", "Rất vui được gặp bạn."],
      ),
    },
    review: [
      { en: "This is my mother.", vi: "Đây là mẹ tôi." },
      { en: "I am a seller.", vi: "Tôi là người bán hàng." },
      { en: "I am from Vietnam.", vi: "Tôi đến từ Việt Nam." },
      { en: "I like tea.", vi: "Tôi thích trà." },
      { en: "Can you help me?", vi: "Bạn giúp tôi được không?" },
    ],
  },
  {
    day: 22,
    week: 4,
    titleEn: "Meeting people",
    titleVi: "Gặp gỡ",
    objectives: ["Chào theo buổi trong ngày.", "Hỏi thăm một câu rồi dừng."],
    vocabulary: [
      { en: "Good morning", vi: "Chào buổi sáng" },
      { en: "Good afternoon", vi: "Chào buổi chiều" },
      { en: "Good evening", vi: "Chào buổi tối" },
      { en: "I am fine", vi: "Tôi khỏe" },
    ],
    targets: ["morning"],
    focus: {
      en: "Good morning.",
      vi: "Chào buổi sáng.",
      coach: "morning dài hơn good. Nói chậm, đều. Nhịp này chỉ là gợi ý nghe.",
    },
    alts: [
      { en: "Good afternoon.", vi: "Chào buổi chiều." },
      { en: "Good evening.", vi: "Chào buổi tối." },
    ],
    recognize: {
      instruction: "Good evening dùng khi nào?",
      en: "Good evening.",
      choices: choices([
        ["eve", "Buổi tối"],
        ["morn", "Buổi sáng"],
        ["noon", "Buổi trưa, chiều sớm"],
      ]),
      answerId: "eve",
    },
    understand: {
      instruction: "Buổi sáng, câu chào nào hợp?",
      choices: choices([
        ["morn", "Good morning."],
        ["eve", "Good evening."],
      ]),
      answerId: "morn",
    },
    combine: {
      instruction: "Ghép lời chào buổi sáng và hỏi thăm.",
      tokens: ["Good", "morning", "how", "are", "you"],
      vi: "Chào buổi sáng. Bạn khỏe không?",
    },
    converse: {
      instruction: "Chào buổi sáng.",
      lines: talk(
        ["Good morning. How are you?", "Chào buổi sáng. Bạn khỏe không?"],
        ["I am fine, thank you.", "Tôi khỏe, cảm ơn."],
        ["Good.", "Tốt."],
      ),
    },
    review: [
      { en: "Good morning.", vi: "Chào buổi sáng." },
      { en: "Good afternoon.", vi: "Chào buổi chiều." },
      { en: "Good evening.", vi: "Chào buổi tối." },
      { en: "I am fine, thank you.", vi: "Tôi khỏe, cảm ơn." },
    ],
  },
  {
    day: 23,
    week: 4,
    titleEn: "Ordering food",
    titleVi: "Gọi món",
    objectives: ["Gọi cơm và cà phê.", "Xin tính tiền bằng một câu."],
    vocabulary: [
      { en: "I would like rice", vi: "Tôi muốn cơm" },
      { en: "A cup of coffee", vi: "Một ly cà phê" },
      { en: "That's all", vi: "Chỉ vậy thôi" },
      { en: "The bill, please", vi: "Làm ơn tính tiền" },
    ],
    targets: ["please", "coffee"],
    focus: { en: "I would like rice, please.", vi: "Tôi muốn cơm, làm ơn." },
    alts: [
      { en: "A cup of coffee.", vi: "Một ly cà phê." },
      { en: "The bill, please.", vi: "Làm ơn tính tiền." },
    ],
    recognize: {
      instruction: "The bill, please nghĩa là gì?",
      en: "The bill, please.",
      choices: choices([
        ["bill", "Xin tính tiền"],
        ["more", "Xin thêm món"],
        ["water", "Xin nước"],
      ]),
      answerId: "bill",
    },
    understand: {
      instruction: "Bạn đã gọi xong và muốn trả tiền. Câu nào hợp?",
      choices: choices([
        ["bill", "The bill, please."],
        ["name", "What is your name?"],
      ]),
      answerId: "bill",
    },
    combine: {
      instruction: "Ghép câu gọi một ly cà phê.",
      tokens: ["A", "cup", "of", "coffee"],
      vi: "Một ly cà phê.",
    },
    converse: {
      instruction: "Gọi món ở quán.",
      lines: talk(
        ["What would you like?", "Bạn muốn gọi gì?"],
        ["I would like rice, please. And a cup of coffee.", "Tôi muốn cơm, làm ơn. Và một ly cà phê."],
        ["Rice and coffee. Yes.", "Cơm và cà phê. Được."],
      ),
    },
    review: [
      { en: "I would like rice, please.", vi: "Tôi muốn cơm, làm ơn." },
      { en: "A cup of coffee.", vi: "Một ly cà phê." },
      { en: "That's all, thank you.", vi: "Chỉ vậy thôi, cảm ơn." },
      { en: "The bill, please.", vi: "Làm ơn tính tiền." },
    ],
  },
  {
    day: 24,
    week: 4,
    titleEn: "Selling products",
    titleVi: "Bán hàng",
    objectives: ["Giới thiệu một món đang bán.", "Nói giá ngắn."],
    vocabulary: [
      { en: "This is coffee", vi: "Đây là cà phê" },
      { en: "fresh", vi: "tươi, mới" },
      { en: "Would you like one?", vi: "Bạn muốn một phần không?" },
      { en: "It's twenty dollars", vi: "Hai mươi đô la" },
    ],
    targets: ["fresh", "coffee"],
    focus: { en: "This is coffee.", vi: "Đây là cà phê." },
    alts: [
      { en: "It's fresh.", vi: "Cà phê này mới." },
      { en: "It's twenty dollars.", vi: "Hai mươi đô la." },
      { en: "Would you like one?", vi: "Bạn muốn một phần không?" },
    ],
    recognize: {
      instruction: "fresh ở bài này nói về điều gì?",
      en: "It's fresh.",
      choices: choices([
        ["fresh", "Món còn mới"],
        ["far", "Món ở xa"],
        ["free", "Món không mất tiền"],
      ]),
      answerId: "fresh",
    },
    understand: {
      instruction: "Bạn là người bán. Câu nào mời khách?",
      choices: choices([
        ["offer", "Would you like one?"],
        ["help", "Please speak slowly."],
      ]),
      answerId: "offer",
    },
    combine: {
      instruction: "Ghép câu nói giá.",
      tokens: ["It's", "twenty", "dollars"],
      vi: "Hai mươi đô la.",
    },
    converse: {
      instruction: "Bán một phần cà phê.",
      lines: talk(
        ["Hello. This is coffee. It's fresh.", "Xin chào. Đây là cà phê. Cà phê mới."],
        ["How much is it?", "Bao nhiêu tiền?"],
        ["It's twenty dollars.", "Hai mươi đô la."],
      ),
    },
    review: [
      { en: "This is coffee.", vi: "Đây là cà phê." },
      { en: "It's fresh.", vi: "Món này mới." },
      { en: "Would you like one?", vi: "Bạn muốn một phần không?" },
      { en: "It's twenty dollars.", vi: "Hai mươi đô la." },
    ],
  },
  {
    day: 25,
    week: 4,
    titleEn: "Transportation",
    titleVi: "Đi lại",
    objectives: ["Hỏi xe buýt.", "Mua một vé."],
    vocabulary: [
      { en: "bus", vi: "xe buýt" },
      { en: "taxi", vi: "taxi" },
      { en: "train", vi: "tàu hỏa" },
      { en: "ticket", vi: "vé" },
      { en: "station", vi: "nhà ga, trạm" },
    ],
    targets: ["ticket", "bus"],
    focus: {
      en: "One ticket, please.",
      vi: "Một vé, làm ơn.",
      coach: finalCoach,
    },
    alts: [
      { en: "Where is the bus?", vi: "Xe buýt ở đâu?" },
      { en: "I go by bus.", vi: "Tôi đi xe buýt." },
    ],
    recognize: {
      instruction: "ticket nghĩa là gì?",
      en: "ticket",
      choices: choices([
        ["ticket", "vé"],
        ["bus", "xe buýt"],
        ["station", "nhà ga"],
      ]),
      answerId: "ticket",
    },
    understand: {
      instruction: "Bạn cần mua vé. Câu nào đúng?",
      choices: choices([
        ["ticket", "One ticket, please."],
        ["food", "I would like rice."],
      ]),
      answerId: "ticket",
    },
    combine: {
      instruction: "Ghép câu hỏi xe buýt.",
      tokens: ["Where", "is", "the", "bus"],
      vi: "Xe buýt ở đâu?",
    },
    converse: {
      instruction: "Mua vé.",
      lines: talk(
        ["Hello. Where is the bus?", "Xin chào. Xe buýt ở đâu?"],
        ["One ticket, please.", "Một vé, làm ơn."],
        ["One ticket. Here you are.", "Một vé. Của bạn đây."],
      ),
    },
    review: [
      { en: "bus", vi: "xe buýt" },
      { en: "taxi", vi: "taxi" },
      { en: "ticket", vi: "vé" },
      { en: "One ticket, please.", vi: "Một vé, làm ơn." },
      { en: "Where is the bus?", vi: "Xe buýt ở đâu?" },
    ],
  },
  {
    day: 26,
    week: 4,
    titleEn: "Shopping",
    titleVi: "Mua sắm",
    objectives: ["Nói mình muốn xem áo.", "Hỏi cỡ lớn."],
    vocabulary: [
      { en: "shirt", vi: "áo" },
      { en: "size", vi: "cỡ" },
      { en: "small", vi: "nhỏ" },
      { en: "large", vi: "lớn" },
      { en: "try", vi: "thử" },
    ],
    targets: ["shirt"],
    focus: {
      en: "I want this shirt.",
      vi: "Tôi muốn cái áo này.",
      coach:
        "shirt có âm cuối. Nói đủ từ để người bán nghe ra áo. Bài không giả định bạn đang nói thiếu âm.",
    },
    alts: [
      { en: "Do you have a large size?", vi: "Bạn có cỡ lớn không?" },
      { en: "small", vi: "cỡ nhỏ" },
    ],
    recognize: {
      instruction: "large nghĩa là gì?",
      en: "large",
      choices: choices([
        ["large", "cỡ lớn"],
        ["small", "cỡ nhỏ"],
        ["shirt", "áo"],
      ]),
      answerId: "large",
    },
    understand: {
      instruction: "Áo chật. Bạn muốn hỏi cỡ lớn. Câu nào hợp?",
      choices: choices([
        ["size", "Do you have a large size?"],
        ["bus", "Where is the bus?"],
      ]),
      answerId: "size",
    },
    combine: {
      instruction: "Ghép câu hỏi cỡ.",
      tokens: ["Do", "you", "have", "a", "large", "size"],
      vi: "Bạn có cỡ lớn không?",
    },
    converse: {
      instruction: "Mua áo.",
      lines: talk(
        ["Can I help you?", "Tôi giúp gì được?"],
        ["I want this shirt. Do you have a large size?", "Tôi muốn cái áo này. Bạn có cỡ lớn không?"],
        ["Yes. Large.", "Có. Cỡ lớn."],
      ),
    },
    review: [
      { en: "shirt", vi: "áo" },
      { en: "small", vi: "nhỏ" },
      { en: "large", vi: "lớn" },
      { en: "I want this shirt.", vi: "Tôi muốn cái áo này." },
      { en: "Do you have a large size?", vi: "Bạn có cỡ lớn không?" },
    ],
  },
  {
    day: 27,
    week: 4,
    titleEn: "Simple phone calls",
    titleVi: "Cuộc gọi ngắn",
    objectives: ["Xưng tên khi nghe máy.", "Nhờ gặp một người."],
    vocabulary: [
      { en: "This is Lan", vi: "Tôi là Lan" },
      { en: "Can I speak to Minh?", vi: "Tôi nói chuyện với Minh được không?" },
      { en: "Please call me", vi: "Làm ơn gọi lại cho tôi" },
      { en: "Goodbye", vi: "Tạm biệt" },
    ],
    targets: ["This is Lan"],
    focus: { en: "Hello, this is Lan.", vi: "Xin chào, tôi là Lan." },
    alts: [
      { en: "Can I speak to Minh?", vi: "Tôi nói chuyện với Minh được không?" },
      { en: "Please call me.", vi: "Làm ơn gọi lại cho tôi." },
    ],
    recognize: {
      instruction: "Can I speak to Minh? đang làm gì?",
      en: "Can I speak to Minh?",
      choices: choices([
        ["ask", "Xin được nói chuyện với Minh"],
        ["sell", "Đang bán hàng cho Minh"],
        ["eat", "Mời Minh ăn"],
      ]),
      answerId: "ask",
    },
    understand: {
      instruction: "Khi nghe máy, cách xưng tên nào rõ?",
      choices: choices([
        ["this", "Hello, this is Lan."],
        ["size", "Do you have a large size?"],
      ]),
      answerId: "this",
    },
    combine: {
      instruction: "Ghép câu xin gặp Minh.",
      tokens: ["Can", "I", "speak", "to", "Minh"],
      vi: "Tôi nói chuyện với Minh được không?",
    },
    converse: {
      instruction: "Một cuộc gọi rất ngắn.",
      lines: talk(
        ["Hello?", "Alô?"],
        ["Hello, this is Lan. Can I speak to Minh?", "Xin chào, tôi là Lan. Tôi nói chuyện với Minh được không?"],
        ["One moment, please.", "Xin chờ một chút."],
      ),
    },
    review: [
      { en: "Hello, this is Lan.", vi: "Xin chào, tôi là Lan." },
      { en: "Can I speak to Minh?", vi: "Tôi nói chuyện với Minh được không?" },
      { en: "Please call me.", vi: "Làm ơn gọi lại cho tôi." },
      { en: "Thank you. Goodbye.", vi: "Cảm ơn. Tạm biệt." },
    ],
  },
  {
    day: 28,
    week: 4,
    titleEn: "Week 4 review",
    titleVi: "Ôn tuần 4",
    objectives: ["Ôn gặp người, gọi món, bán hàng, đi lại, mua sắm và gọi điện.", "Nói một tình huống bạn chọn."],
    vocabulary: [
      { en: "Good morning", vi: "Chào buổi sáng" },
      { en: "The bill, please", vi: "Làm ơn tính tiền" },
      { en: "One ticket, please", vi: "Một vé, làm ơn" },
      { en: "This is Lan", vi: "Tôi là Lan" },
    ],
    targets: ["morning", "ticket", "shirt"],
    focus: { en: "Good morning.", vi: "Chào buổi sáng." },
    alts: [
      { en: "One ticket, please.", vi: "Một vé, làm ơn." },
      { en: "I want this shirt.", vi: "Tôi muốn cái áo này." },
      { en: "Hello, this is Lan.", vi: "Xin chào, tôi là Lan." },
    ],
    recognize: {
      instruction: "The bill, please dùng ở đâu?",
      en: "The bill, please.",
      choices: choices([
        ["cafe", "Khi muốn tính tiền"],
        ["phone", "Khi xưng tên trên điện thoại"],
        ["bus", "Khi hỏi xe buýt"],
      ]),
      answerId: "cafe",
    },
    understand: {
      instruction: "Câu nào là lời người bán?",
      choices: choices([
        ["sell", "This is coffee. It's twenty dollars."],
        ["ticket", "Where is the bus?"],
      ]),
      answerId: "sell",
    },
    combine: {
      instruction: "Ghép lời chào buổi sáng.",
      tokens: ["Good", "morning"],
      vi: "Chào buổi sáng.",
    },
    converse: {
      instruction: "Chào rồi nói một việc của tuần này.",
      lines: talk(
        ["Good morning. Can I help you?", "Chào buổi sáng. Tôi giúp gì được?"],
        ["Yes. One ticket, please.", "Có. Một vé, làm ơn."],
        ["One ticket. Thank you.", "Một vé. Cảm ơn."],
      ),
    },
    review: [
      { en: "Good morning.", vi: "Chào buổi sáng." },
      { en: "I would like rice, please.", vi: "Tôi muốn cơm, làm ơn." },
      { en: "This is coffee.", vi: "Đây là cà phê." },
      { en: "One ticket, please.", vi: "Một vé, làm ơn." },
      { en: "I want this shirt.", vi: "Tôi muốn cái áo này." },
      { en: "Hello, this is Lan.", vi: "Xin chào, tôi là Lan." },
    ],
  },
];
