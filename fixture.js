const user = (id, name, ok, speed, friends=[]) => (
  {id: id, name: name, ok: ok, speed: speed, friends: friends}
)

const FakeApi = {
  objects: {
    '1': user('1', 'foo', true, 250, ['2', '3']),
    '2': user('2', 'bar', true, 50),
    '3': user('3', 'baz', false, 100) },

  fetch: (ident) => {
    if(! FakeApi.objects[ident]) {
      throw new Error(`No fixture for ${ident}!`)
    }
    return new Promise((fulfill, fail) => {
      setTimeout (() => {
        try {
          const who = FakeApi.objects[ident]
          if(who.ok) {
            fulfill(who);
          } else {
            fail(new Error(`Oh no, ${who.name} broken!`))
          }
        } catch(err) {
          fail(err);
        }
      }, FakeApi.objects[ident].speed)
    });
  }
}

module.exports = {FakeApi: FakeApi};
