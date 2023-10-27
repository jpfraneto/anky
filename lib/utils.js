async function benchmark(fn) {
  const t0 = performance.now();
  const result = await fn();
  const t1 = performance.now();

  return {
    duration: t1 - t0 + ' ms',
    result,
  };
}

// If you need to export the function to be used in another module
export { benchmark };
