import {getClient} from './tokenUtil';
import SheetWrapper from './SheetWrapper';
import {AutomationSheetID} from './constants';

const writeURL = async (data: any[]) : Promise<void> => {
  const client = await getClient();

  const sheet = new SheetWrapper(AutomationSheetID, client);

  sheet.write(data, 'N');
};

export {writeURL};