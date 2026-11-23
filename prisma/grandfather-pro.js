const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const result = await prisma.user.updateMany({
        where: { subscriptionTier: "FREE" },
        data: { subscriptionTier: "PRO", subscriptionStatus: "ACTIVE" },
    });

    console.log(`Grandfathered ${result.count} existing users to PRO plan.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
