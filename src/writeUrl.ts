import {getClient} from './tokenUtil';
import SheetWrapper from './SheetWrapper';
import {automationSheetID} from './constants';

const writeURL = async (data: any[], tabName?: string) : Promise<void> => {
  const client = await getClient();

  const sheet = new SheetWrapper(automationSheetID, client);

  sheet.write(data, 'N', tabName);
};

export {writeURL};