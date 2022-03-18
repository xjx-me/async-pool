async function* asyncPool(concurrency, iterable, iteratorFn) {
  let done;
  const ret = [];
  const executing = new Set();
  for (const item of iterable) {
    const promise = Promise.resolve().then(() => iteratorFn(item, iterable));
    ret.push(promise);
    executing.add(promise);
    const clean = () => executing.delete(promise);
    promise.then(clean).catch(clean);
    if (executing.size >= concurrency) {
      yield await Promise.race(executing);
    }
  }
  while (executing.size) {
    yield await Promise.race(executing);
  }
}

module.exports = asyncPool;