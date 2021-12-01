export default class log {
    public static info(details: string): void {
        console.log(`[${(new Date()).getTime()}] - ${details}`);
    }
}