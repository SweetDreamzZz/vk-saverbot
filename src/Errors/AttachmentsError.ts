import { MessageContext } from "vk-io";

export class AttachmentsError extends Error {
    private text: string;

    constructor(context: MessageContext) {
        super();

        this.text = 'Я не нашел ни одного подходящего вложения.\n\nВложения, которые я умею обрабатывать: стикер, фотография, документ'

        context.send(this.text);
    }
}