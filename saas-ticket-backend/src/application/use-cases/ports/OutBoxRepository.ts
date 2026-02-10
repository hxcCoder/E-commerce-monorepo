export type OutboxEvent = {
  id: string;
  eventName: string;
  payload: unknown;
  occurredOn: Date;
  published: boolean;
};

export interface OutboxRepository {
  save(event: OutboxEvent): Promise<void>;
  findPending(limit?: number): Promise<OutboxEvent[]>;
  markAsPublished(id: string): Promise<void>;
}
