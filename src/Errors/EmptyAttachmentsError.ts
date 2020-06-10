import { MessageContext } from "vk-io";

export class EmptyAttachmentsError extends Error {
    private text: string;

    constructor(context: MessageContext) {
        super();

        this.text = 'По какой-то причине я не смог ничего обработать, повторите попытку позже :)'

        context.send(this.text);
    }
}