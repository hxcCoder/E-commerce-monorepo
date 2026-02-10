export interface SubscriptionService {
    canCreateProcess(organizationId: string): Promise<boolean>;
}
