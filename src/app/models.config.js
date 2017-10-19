export default function (store) {

  store.defineModel('session', {
    schema: {
      properties: {
        secondsToDestroy: {type: 'number', track: true},
        destroyed: {type: 'boolean', track: true}
      }
    }
  });
  store.defineModel('deviceFile');
  store.defineModel('entity');
  store.defineModel('uploadableFile');

}
