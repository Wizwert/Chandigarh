import { ChdgDiscordReporter } from 'chdg-discord-reporter';

interface ILog {
  DateTime: string;
  Message: string;
}

export type logWriter = (message: string) => Promise<void>;

const writeLog = async (message: string) => {
  const reporter = new ChdgDiscordReporter();
  const now = new Date();
  const log: ILog = {
    DateTime: `${now.getFullYear()}-${now.getMonth()}-${now.getDay()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}.${now.getMilliseconds()}`,
    Message: message,
  };

  try {
    reporter.log(`[${log.DateTime}] ${log.Message}`);
    console.log(`[${log.DateTime}] ${log.Message}`);
  } catch (error) {
    console.error('Encountered error while logging', error);
  }
};

const announce = async (message: string) => {
  const reporter = new ChdgDiscordReporter();
  try {
    reporter.announce(message);
    console.log(message);
  } catch (error) {
    console.error('Encountered error while logging', error);
  }
}

export {writeLog, announce};