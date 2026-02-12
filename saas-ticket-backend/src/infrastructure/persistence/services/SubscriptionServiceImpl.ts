import { injectable } from "inversify";
import { SubscriptionService } from "../../../application/use-cases/ports/SubscriptionService";
import { getPrismaClient } from "../../persistence/prisma/PrismaClient";

@injectable()
export class SubscriptionServiceImpl implements SubscriptionService {
  private prisma = getPrismaClient();

  async canCreateProcess(organizationId: string): Promise<boolean> {
    const activeProcesses = await this.prisma.process.count({
      where: {
        organizationId,
        status: "ACTIVE",
      },
    });

    // Until subscription tables are introduced in Prisma schema,
    // apply a conservative default threshold to protect infrastructure.
    return activeProcesses < 1000;
  }
}
