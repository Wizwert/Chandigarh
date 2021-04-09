import Discord from "discord.js";

export class ChdgDiscordReporter {
    loggerWebhook: Discord.WebhookClient;
    announceWebhook: Discord.WebhookClient;

    msgQueue: string[] = [];

    constructor(logWebhookToken: string = process.env.DISCORD_LOG_WEBHOOK_TOKEN || '', 
                logWebhookId = process.env.DISCORD_LOG_WEBHOOK_ID || '',
                announceWebhookToken: string = process.env.DISCORD_ANNOUNCE_WEBHOOK_TOKEN || '', 
                announceWebhookId = process.env.DISCORD_ANNOUNCE_WEBHOOK_ID || '') {

        this.loggerWebhook = new Discord.WebhookClient(logWebhookId, logWebhookToken);
        this.announceWebhook = new Discord.WebhookClient(announceWebhookId, announceWebhookToken);
        
        this.loggerWebhook.setInterval(this.sendLogs, 2000, this);
    }

    async sendLogs(context: ChdgDiscordReporter) {
        if(context.msgQueue.length === 0){
            return;
        }
        const numberOfMessages = context.msgQueue.length;

        const messageToSend = context.msgQueue.splice(0, numberOfMessages);

        const aggMsg = "```" + messageToSend.join('\n') + "```";
        context.loggerWebhook.send(aggMsg);
    }

    log(msg: string) {
        this.msgQueue.push(msg);
        
    }

    async announce(msg: string) {
        this.announceWebhook.send(msg);
    }

    close() {
        this.sendLogs(this);
        this.loggerWebhook.destroy();
        this.announceWebhook.destroy();
    }
}