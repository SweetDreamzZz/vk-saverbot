import { Attachment, ExternalAttachment, PhotoAttachment, DocumentAttachment, StickerAttachment } from "vk-io";

export class MessageAttachment {
    public attachments: (Attachment<{}> | ExternalAttachment<{}>)[];
    constructor(attachments: (Attachment<{}> | ExternalAttachment<{}>)[] = []) {
        this.attachments = attachments;
    }

    public getUrls(): string[] {

        return this.attachments.map(attachment => {
            switch (attachment.type) {
                case "photo":
                    const {
                        largePhoto,
                        mediumPhoto,
                        smallPhoto
                    } = attachment as PhotoAttachment;
        
                    return largePhoto ? largePhoto :
                        mediumPhoto ? mediumPhoto : smallPhoto;
                case "doc":
                    const { preview } = attachment as DocumentAttachment;
    
                    const typeSizes = ['w', 'z', 'y', 'r', 'q', 'p', 'm', 's'];
                    const [{ src: largePreview }] = typeSizes.map(type => (
                        preview['photo'].sizes.find(size => size.type === type)
                    )).filter(Boolean);
            
                    return largePreview;
    
                case "sticker":
                    const { images } = attachment as StickerAttachment;
                    const { url } = images.find(({ width: w, height: h }) => w == 512 && h == 512);
    
                    return url;
                default:
                    return null;
            }
        }).filter(Boolean);
    }

    public getAll() {
        return this.hasAttachments ? this.attachments : null;
    }

    public get(index: number = 0) {
        return this.hasAttachments ? this.attachments[index] : null;
    }

    public get hasAttachments() {
        return !!this.attachmentsLength;
    }

    public get attachmentsLength() {
        return this.attachments.length;
    }
}