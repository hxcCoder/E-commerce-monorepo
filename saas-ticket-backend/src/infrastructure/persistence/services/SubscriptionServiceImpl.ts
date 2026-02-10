import { injectable } from "inversify";
import { SubscriptionService } from "../../../application/use-cases/ports/SubscriptionService";
import { getPrismaClient } from "../../persistence/prisma/PrismaClient";

@injectable()
export class SubscriptionServiceImpl implements SubscriptionService {
  private prisma = getPrismaClient();

  async canCreateProcess(organizationId: string): Promise<boolean> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      include: { plan: true },
    });

    if (!subscription) return false;

    const activeProcesses = await this.prisma.process.count({
      where: {
        organizationId,
        status: "ACTIVE",
      },
    });

    return activeProcesses < subscription.plan.maxActiveProcesses;
  }
}
