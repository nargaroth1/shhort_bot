import { Telegraf } from "telegraf";
import OpenAI from "OpenAI";
import { marked } from 'marked'
import { ProviderManager } from "./providers.ts";
import { Whitelist } from "./whitelist.ts";

// const groq = new Groq({ apiKey: Deno.env.get('GROQ_API_KEY') });

const whitelist = new Whitelist('./whitelist.json');

const ppx = new OpenAI({
    baseURL: "https://api.perplexity.ai/",
    apiKey: "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",
});
const groq = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: Deno.env.get('GROQ_API_KEY'),
});
const aimlapi = new OpenAI({
    baseURL: "https://api.aimlapi.com",
    apiKey: Deno.env.get('AIML_API_KEY'),
});

const providers = new ProviderManager([
    {
        name: "chatgpt",
        instance: new OpenAI(),
        default_model: 'gpt-4o-mini'
    },
    {
        name: "perplexity",
        instance: ppx,
        default_model: 'llama-3.1-sonar-small-128k-online'
    },
    {
        name: "groq",
        instance: groq,
        default_model: 'llama-3.2-90b-vision-preview'
    },
    {
        name: "aiml",
        instance: aimlapi,
        default_model: 'cognitivecomputations/dolphin-2.5-mixtral-8x7b'
    }
]);

const bot = new Telegraf(Deno.env.get("TELEGRAM_BOT") || "");

bot.on("chosen_inline_result", (ctx) => {
    providers.sendReq(ctx.update.chosen_inline_result.result_id, ctx);
});

bot.action("cancel", (ctx) => {
    ctx.answerCbQuery();
});

bot.on("inline_query", async (ctx) => {
    if (ctx.from.id != 5862764935) {
        ctx.answerInlineQuery([
            {
                id: "banned",
                type: "article",
                title: "тебе нельзя пользоваться этим ботом",
                description: 'напиши @donut767 чтоб тебя добавил в белый список',
                input_message_content: {
                    message_text: `напиши [donut767](https://t.me/donut767) чтоб тебя добавил в белый список`,
                    parse_mode: "MarkdownV2"
                }
            }])
        return;
    }

    if (ctx.inlineQuery.query.trim().length == 0) {
        ctx.answerInlineQuery([], {
            cache_time: 0,
        });
        return;
    }
    ctx.answerInlineQuery([
        {
            id: "chatgpt",
            type: "article",
            title: "ChatGPT",
            description: ctx.inlineQuery.query,
            input_message_content: {
                message_text: "<i>ChatGPT is processing your query...</i>",
                parse_mode: "HTML",
            },
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Cancel",
                        callback_data: "cancel",
                    },
                ]],
            },
        },
        {
            id: "groq",
            type: "article",
            title: "GROQ",
            description: ctx.inlineQuery.query,
            input_message_content: {
                message_text: "<i>GROQ is processing your query...</i>",
                parse_mode: "HTML",
            },
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Cancel",
                        callback_data: "cancel",
                    },
                ]],
            },
        },
        {
            id: "perplexity",
            type: "article",
            title: "Perplexity.ai",
            description: ctx.inlineQuery.query,
            input_message_content: {
                message_text:
                    "<i>Perplexity.ai is processing your query...</i>",
                parse_mode: "HTML",
            },
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Cancel",
                        callback_data: "cancel",
                    },
                ]],
            },
        },
        {
            id: "aiml",
            type: "article",
            title: "aiml",
            description: ctx.inlineQuery.query,
            input_message_content: {
                message_text:
                    "<i>aiml is processing your query...</i>",
                parse_mode: "HTML",
            },
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "Cancel",
                        callback_data: "cancel",
                    },
                ]],
            },
        }, // 
    ], {
        cache_time: 0,
    });
});


bot.command('whitelist', (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length == 0) {
        ctx.reply('Provide id')
        return;
    }
    const id = parseInt(args[0]);
    if (whitelist.addUser(id)) {
        ctx.reply('User whitelisted');
    } else {
        whitelist.removeUser(id)
        ctx.reply('User removed');
    }
})

bot.launch();

// if (import.meta.main) {
//   const aiclient = new OpenAI({
//     baseURL: 'https://api.perplexity.ai/',
//     apiKey: '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'
//   })
//   aiclient.chat.completions.create({
//     messages: [
//       {
//         role: "user",
//         content: "what's going on in ukraine now?",
//       },
//     ],
//     temperature: 0.2,
//     max_tokens: 512,
//     model: "llama-3.1-sonar-small-128k-chat",
//   }).then((response) => {
//     console.log('Response:', response.choices[0]?.message?.content || "");
//     console.log(response.usage)
//   })
// }
