import { Json } from '@cw/json';

import * as moment from 'moment';
import { db } from '@cw/db-mapper';

import { User } from '../sample-out/user';

debugger;

describe('Dummy test', () => {

  const view1 = User.viewEdit.buildEditView('extra_column')

  // User.viewEdit.buildEditView('extra_column', 'info_name_full')

  // const cs = User.viewEdit.buildEditView('info', 'hi')

  it(`column key '${'extra_column'}' present`, () => {
    expect(view1.columnKeys).toContain('extra_column')
  })

  it(`version key '${'header_version2'}' present`, () => {
  debugger;
    expect(view1.versionColumnKeys).toContain('header_version2')
  })
})
