

// export default AsyncChannel;


export class AsyncChannel<T> implements AsyncIterable<T> {
  private queue: T[] = [];
  private receivers: ((value: IteratorResult<T>) => void)[] = [];
  private isClosed = false;

  /**
   * Pushes data into the channel.
   * If a consumer is waiting, it hands the data off immediately.
   */
  public send(value: T): void {
    if (this.isClosed) {
      throw new Error("Cannot send to a closed channel.");
    }

    if (this.receivers.length > 0) {
      const resolve = this.receivers.shift()!;
      resolve({ value, done: false });
    } else {
      this.queue.push(value);
    }
  }

  /**
   * Pulls data out of the channel asynchronously.
   */
  public async receive(): Promise<IteratorResult<T>> {
    if (this.queue.length > 0) {
      return { value: this.queue.shift()!, done: false };
    }

    if (this.isClosed) {
      return { value: undefined as any, done: true };
    }

    return new Promise<IteratorResult<T>>((resolve) => {
      this.receivers.push(resolve);
    });
  }

  /**
   * Closes the channel. Remaining queued items can still be read.
   */
  public close(): void {
    if (this.isClosed) return;
    this.isClosed = true;

    // Flush remaining blocked consumers by telling them the channel is done
    while (this.receivers.length > 0) {
      const resolve = this.receivers.shift()!;
      resolve({ value: undefined as any, done: true });
    }
  }

  /**
   * Implements the AsyncIterable protocol so it can be used with for-await-of loops.
   */
  public [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => this.receive(),
    };
  }
}
