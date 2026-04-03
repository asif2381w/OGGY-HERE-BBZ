const axios = require("axios");

const mahmud = async () => {
        const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
        return res.data.mahmud;
};

module.exports = {
        config: {
                name: "mathgame",
                aliases: ["math"],
                version: "1.7",
                author: "MahMUD",
                countDown: 5,
                role: 0,
                description: {
                        bn: "মজার গণিত কুইজ খেলুন এবং কয়েন জিতুন",
                        en: "Play fun math quizzes and win coins",
                        vi: "Chơi đố vui toán học và giành được tiền"
                },
                category: "game",
                guide: {
                        bn: '   {pn}',
                        en: '   {pn}',
                        vi: '   {pn}'
                }
        },

        langs: {
                bn: {
                        noQuiz: "× কোনো কুইজ পাওয়া যায়নি।",
                        error: "× সমস্যা হয়েছে: %1। প্রয়োজনে Contact MahMUD।",
                        replyToAns: "\n╭──✦ %1\n├‣ 𝗔) %2\n├‣ 𝗕) %3\n├‣ 𝗖) %4\n├‣ 𝗗) %5\n╰──────────────────‣\nসঠিক উত্তরটি লিখে রিপ্লাই দাও বেবি।",
                        notAuthor: "❌ এটা তোমার কুইজ না বেবি!",
                        alreadyAnswered: "❌ তুমি ইতিমধ্যে উত্তর দিয়েছো!",
                        correct: "✅ | সঠিক উত্তর বেবি!\nতুমি পেয়েছো +%1 কয়েন এবং +%2 এক্সপি!",
                        wrong: "❌ | ভুল উত্তর বেবি!\nসঠিক উত্তর ছিল: %1"
                },
                en: {
                        noQuiz: "× No quiz found.",
                        error: "× API error: %1. Contact MahMUD for help.",
                        replyToAns: "\n╭──✦ %1\n├‣ 𝗔) %2\n├‣ 𝗕) %3\n├‣ 𝗖) %4\n├‣ 𝗗) %5\n╰──────────────────‣\nReply with your answer, baby.",
                        notAuthor: "❌ This isn't your math quiz, baby!",
                        alreadyAnswered: "❌ You've already answered this quiz!",
                        correct: "✅ | Correct answer baby!\nYou earned +%1 coins & +%2 exp!",
                        wrong: "❌ | Wrong answer baby!\nThe Correct answer was: %1"
                },
                vi: {
                        noQuiz: "× Không tìm thấy câu đố.",
                        error: "× Lỗi: %1. Liên hệ MahMUD để hỗ trợ.",
                        replyToAns: "\n╭──✦ %1\n├‣ 𝗔) %2\n├‣ 𝗕) %3\n├‣ 𝗖) %4\n├‣ 𝗗) %5\n╰──────────────────‣\nTrả lời với đáp án của bạn, cưng ơi.",
                        notAuthor: "❌ Đây không phải là câu đố của bạn!",
                        alreadyAnswered: "❌ Bạn đã trả lời câu đố này rồi!",
                        correct: "✅ | Trả lời đúng rồi cưng!\nBạn nhận được +%1 xu & +%2 exp!",
                        wrong: "❌ | Sai rồi cưng ơi!\nCâu trả lời đúng là: %1"
                }
        },

        onStart: async function ({ api, event, message, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                try {
                        api.setMessageReaction("⏳", event.messageID, () => {}, true);
                        
                        const apiBase = await mahmud();
                        const res = await axios.get(`${apiBase}/api/math`);
                        const quiz = res.data?.data || res.data;

                        if (!quiz || !quiz.question) return message.reply(getLang("noQuiz"));

                        const { question, correctAnswer, options } = quiz;
                        const msg = getLang("replyToAns", question, options.a, options.b, options.c, options.d);

                        api.sendMessage(msg, event.threadID, (err, info) => {
                                global.GoatBot.onReply.set(info.messageID, {
                                        commandName: this.config.name,
                                        author: event.senderID,
                                        correctAnswer,
                                        answered: false
                                });
                        }, event.messageID);

                        api.setMessageReaction("✅", event.messageID, () => {}, true);

                } catch (err) {
                        console.error("Math Error:", err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        },

        onReply: async function ({ event, api, Reply, usersData, getLang }) {
                const { correctAnswer, author, answered } = Reply;

                if (event.senderID !== author) return api.sendMessage(getLang("notAuthor"), event.threadID, event.messageID);
                if (answered) return api.sendMessage(getLang("alreadyAnswered"), event.threadID, event.messageID);

                Reply.answered = true;
                const reply = event.body.trim().toLowerCase();
                const rewardCoins = 500;
                const rewardExp = 121;

                try {
                        await api.unsendMessage(event.messageReply.messageID);
                        
                        if (reply === correctAnswer.toLowerCase()) {
                                await usersData.addMoney(author, rewardCoins);
                                const userData = await usersData.get(author);
                                userData.exp += rewardExp;
                                await usersData.set(author, userData);

                                return api.sendMessage(getLang("correct", rewardCoins, rewardExp), event.threadID, event.messageID);
                        } else {
                                return api.sendMessage(getLang("wrong", correctAnswer), event.threadID, event.messageID);
                        }
                } catch (err) {
                        console.error("Math Reply Error:", err);
                }
        }
};
