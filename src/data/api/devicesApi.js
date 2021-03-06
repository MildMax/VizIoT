'use es6';

import axios from 'axios';
import { headers, baseUrlApi } from '../../constants/RequestConstants';
import { Record } from 'immutable';
import ApiRecord from './Api';
import { createMockCall } from 'VizIoT/utility/ApiUtility';

export const fetchDevices = new ApiRecord({
  call: ({ networkId }) => {
    // return createMockCall({data: [
    //     {
    //       _id: 0,
    //       name: 'Google Home Mini',
    //       shortName: 'MINI',
    //       category: 'Voice Assistant',
    //     },
    //     {
    //       _id: 1,
    //       name: 'Xiaomi Rice Cooker',
    //       shortName: 'RICE',
    //       category: 'Appliance',
    //     },
    //     {
    //       _id: 2,
    //       name: 'Philips Hue',
    //       shortName: 'HUE',
    //       category: 'Lighting',
    //     }
    //   ]
    // });

    const url = `${baseUrlApi}/device/all`;
    return axios.get(url, { headers });
  },
  paramParser: p => new Record({ networkId: null })(p),
});
