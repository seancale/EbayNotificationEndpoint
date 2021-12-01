export type EbayDeleteNotif = {
    metadata: {
        topic: string,
        schemaVersion: string,
        deprecated: boolean
    },
    notification: {
        notificationId: string,
        eventDate: string,
        publishDate: string,
        publishAttemptCount: number,
        data: {
            username: string,
            userId: string,
            eiasToken: string
        }
    }
}