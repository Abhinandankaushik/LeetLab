type SubmissionTask = {
  id: string;
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
  status: 'pending' | 'running' | 'completed' | 'failed';
};

class SubmissionQueue {
  private queue: SubmissionTask[] = [];
  private isProcessing = false;
  private currentTaskId: string | null = null;

  async add(fn: () => Promise<any>): Promise<any> {
    const id = Math.random().toString(36).substring(7);
    return new Promise((resolve, reject) => {
      this.queue.push({
        id,
        fn,
        resolve,
        reject,
        status: 'pending',
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const task = this.queue.find(t => t.status === 'pending');
    
    if (!task) {
      this.isProcessing = false;
      return;
    }

    task.status = 'running';
    this.currentTaskId = task.id;

    try {
      const result = await task.fn();
      task.status = 'completed';
      task.resolve(result);
    } catch (err) {
      task.status = 'failed';
      task.reject(err);
    } finally {
      this.queue = this.queue.filter(t => t.id !== task.id);
      this.isProcessing = false;
      this.currentTaskId = null;
      this.processNext();
    }
  }

  getQueueStatus() {
    return {
      pending: this.queue.filter(t => t.status === 'pending').length,
      isProcessing: this.isProcessing,
      position: (id: string) => this.queue.findIndex(t => t.id === id) + 1,
    };
  }
}

export const submissionQueue = new SubmissionQueue();
