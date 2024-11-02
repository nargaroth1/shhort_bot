import { marked } from "marked";
import OpenAI from "OpenAI";

export interface Provider {
    name: string;
    instance: OpenAI;
    default_model: string;
}

export class ProviderManager {
    providers: Provider[];

    constructor(providers: Provider[]) {
        this.providers = providers;
    }

    sendReq(client: string, ctx: any) {
        for (const provider of this.providers) {
            if (provider.name == client) {
                provider.instance.chat.completions.create({
                    messages: [
                        {
                            role: "user",
                            content: ctx.update.chosen_inline_result.query,
                        },
                    ],
                    temperature: 0.2,
                    max_tokens: 512,
                    model: provider.default_model,
                }).then((res) => {
                    const msg = `${
                        res.choices[0]?.message?.content || ""
                    }`;
                    ctx.editMessageText(msg, {
                        inline_message_id: ctx.inlineMessageId
                    });
                }).catch((ex) => {
                    ctx.editMessageText(`Got an error: ${ex}`, {
                        inline_message_id: ctx.inlineMessageId,
                        parse_mode: "HTML",
                    });
                });
            }
        }
    }
}
