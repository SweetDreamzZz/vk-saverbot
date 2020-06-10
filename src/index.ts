import * as config from '../config.json';

import { VK, PhotoAttachment } from 'vk-io';
import { Utils, MessageAttachment } from './Utils';
import { AttachmentsError, UnknownError, EmptyAttachmentsError } from './Errors/';

const vk = new VK(config);

vk.updates.on('new_message', async context => {
    if (context.isChat)
        return;

    const utils: Utils = new Utils();

    const attachments: MessageAttachment = new MessageAttachment(
        await utils.getContextAttachments(context)
    );

    if (!attachments.hasAttachments)
        return new AttachmentsError(context);

    const start_message: number = await context.send(`Количество вложений: ${attachments.attachmentsLength}\n\nНачался процесс обработки данных, пожалуйста, подождите: этот процесс обычно занимает несколько секунд.`);

    if (start_message || start_message > 0) {

        const urls: string[] = attachments.getUrls();

        const t1: number = Date.now();

        const attachment: string[] = await Promise.all(
            urls.map(async (source): Promise<string> => {
                const photo: PhotoAttachment = await vk.upload.messagePhoto({
                    source,

                    // @ts-ignore
                    group_id: config.pollingGroupId
                });
                
                return photo.toString();
            })
        );

        if (!attachment.length)
            return new EmptyAttachmentsError(context);

        const t2: number = Date.now() - t1;

        await utils.deleteMessage(context.vk.api, start_message);

        return context.send({
            attachment,

            payload: JSON.stringify({
                uploadTime: t2
            })
        });
    }

    return new UnknownError(context);
});

export default (callback?: (...args: any[]) => void): void => {
    vk.updates.start()
        .then(callback)
        .catch(console.error)
}