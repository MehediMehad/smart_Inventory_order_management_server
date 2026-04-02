/*
 * Useful for adding a delay to a function.
 * Output: Promise<void>
 *  ## Example Uses:
 * 1. await sleep(2000); // 2 second wait
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
