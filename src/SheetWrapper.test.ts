import SheetWrapper from './sheetwrapper';
import {OAuth2Client} from 'google-auth-library';

test('blah', async () =>{
  const sheet = new SheetWrapper('test', new OAuth2Client());

  expect(sheet.read('A1')).rejects.toThrow();
});