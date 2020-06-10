import VK, { MessageContext, Attachment, ExternalAttachment, PhotoAttachment, WallAttachment, StickerAttachment, DocumentAttachment } from "vk-io";
import API from "vk-io/lib/api";

export class Utils {
    private getAttachmentInstance(vk: VK, attachment: Attachment<{}> | ExternalAttachment<{}>, attachment_types: string[]) {
        if (!attachment_types.includes(attachment.type))
            return;

        const attachmentPayload = attachment[attachment.type];

        switch (attachment.type) {
            case "photo":
                return new PhotoAttachment(attachmentPayload, vk)
            case "sticker":
                return new StickerAttachment(attachmentPayload, vk);
            case "doc":
                return new DocumentAttachment(attachmentPayload, vk);
            case "wall":
                const wallAttachment = new WallAttachment(attachmentPayload, vk);

                return wallAttachment.attachments.filter(attachment => attachment_types.includes(attachment.type));
        }
    }

    public async getContextAttachments(
        context: MessageContext,
        messageId: number | null = null,
        attachment_types: string[] = ['photo', 'sticker', 'doc', 'wall']
    ): Promise<(Attachment<{}> | ExternalAttachment<{}>)[]> {
        if (!context.id && !messageId)
            return;

        const { items: [message] } = await context.vk.api.messages.getById({
            message_ids: messageId ? messageId : context.id
        });

        const attachments = {
            fwd: [],
            reply: [],
            own: []
        };

        // context.hasForwards && context.forwards.hasAttachments()        
        if (message.fwd_messages.length && message.fwd_messages[0].attachments.length) {
            const [fwd] = message.fwd_messages;
            attachments.fwd = fwd.attachments;
        } else
            // context.hasReplyMessage && context.replyMessage.hasAttachments()
            if (message.reply_message && message.reply_message.attachments.length) {
                attachments.reply = message.reply_message.attachments;
            } else
                // context.hasAttachments()
                if (message.attachments.length) {
                    attachments.own = message.attachments;
                }

        return Object.entries(attachments).reduce((acc, [_type, attachments]) => {
            const $attachments = attachments.flatMap(attachment => this.getAttachmentInstance(context.vk, attachment, attachment_types))

            return [
                ...acc,
                ...$attachments
            ];
        }, []).filter(attachment => attachment && !(attachment.type == 'doc' && (!attachment.isImage && !attachment.isGif)))
    }

    public async deleteMessage(api: API, message_ids: number | number[]) {
        return api.messages.delete({
            message_ids,
            delete_for_all: 1
        });
    }

}