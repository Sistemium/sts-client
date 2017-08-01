/**
 * Created by edgarjanvuicik on 31/07/2017.
 */

import _ from 'lodash';

export function reduceObject() {

  return input => {

    let output = input;

    if (_.isObject(input)) {

      output = _.get(input, 'name') || _.get(input, 'deviceName') || _.get(input, 'url', input)

    }

    return output;

  }
}
