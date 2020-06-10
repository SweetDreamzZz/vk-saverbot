import { MessageContext } from "vk-io";

export class UnknownError extends Error {
    private text: string;

    constructor(context: MessageContext) {
        super();

        this.text = `🤔 Произошла неизвестная ошибка, попробуйте повторить запрос чуть позже.`
    }
}