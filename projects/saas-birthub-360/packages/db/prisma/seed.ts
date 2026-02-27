import {
  ActivityType,
  ContractStatus,
  DealStage,
  InvoiceStatus,
  LeadStatus,
  Plan,
  PrismaClient,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

const IDS = {
  org: "org_birthub_demo",
  admin: "user_admin_demo",
  ae: "user_ae_demo",
  leadAtlas: "lead_atlas_demo",
  leadAurum: "lead_aurum_demo",
  dealAtlas: "deal_atlas_demo",
  dealAurum: "deal_aurum_demo",
  customerAtlas: "customer_atlas_demo",
  contractAtlas: "contract_atlas_demo",
  invoiceAtlas: "invoice_atlas_demo",
  invoiceAurum: "invoice_aurum_demo",
};

async function main() {
  await prisma.activity.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  await prisma.organization.create({
    data: {
      id: IDS.org,
      name: "BirthHub Demo Org",
      cnpj: "12.345.678/0001-90",
      plan: Plan.ENTERPRISE,
      users: {
        create: [
          {
            id: IDS.admin,
            email: "admin@birthub.com",
            name: "Admin User",
            role: UserRole.ADMIN,
          },
          {
            id: IDS.ae,
            email: "ae@birthub.com",
            name: "Alice AE",
            role: UserRole.AE,
          },
        ],
      },
      leads: {
        create: [
          {
            id: IDS.leadAtlas,
            name: "Mariana Costa",
            email: "mariana@atlasdigital.com",
            company: "Atlas Digital",
            status: LeadStatus.QUALIFIED,
            icpScore: 92,
            intentScore: 88,
          },
          {
            id: IDS.leadAurum,
            name: "Carlos Prado",
            email: "carlos@aurumtech.com",
            company: "Aurum Tech",
            status: LeadStatus.IN_NEGOTIATION,
            icpScore: 80,
            intentScore: 72,
          },
        ],
      },
    },
  });

  await prisma.deal.createMany({
    data: [
      {
        id: IDS.dealAtlas,
        organizationId: IDS.org,
        leadId: IDS.leadAtlas,
        assignedAEId: IDS.ae,
        title: "Plano Enterprise Atlas",
        value: 26000,
        finalValue: 24000,
        stage: DealStage.NEGOTIATION,
        probability: 78,
      },
      {
        id: IDS.dealAurum,
        organizationId: IDS.org,
        leadId: IDS.leadAurum,
        assignedAEId: IDS.ae,
        title: "Expansão Aurum",
        value: 17500,
        finalValue: 17500,
        stage: DealStage.PROPOSAL_SENT,
        probability: 54,
      },
    ],
  });

  await prisma.customer.create({
    data: {
      id: IDS.customerAtlas,
      organizationId: IDS.org,
      leadId: IDS.leadAtlas,
      dealId: IDS.dealAtlas,
      mrr: 22000,
      planId: "enterprise-plus",
      contractStart: new Date("2025-01-01T00:00:00.000Z"),
      contractEnd: new Date("2025-12-31T00:00:00.000Z"),
      healthScore: 89,
      churnRisk: 0.18,
      npsScore: 71,
    },
  });

  await prisma.contract.create({
    data: {
      id: IDS.contractAtlas,
      organizationId: IDS.org,
      dealId: IDS.dealAtlas,
      customerId: IDS.customerAtlas,
      type: "MSA",
      status: ContractStatus.ACTIVE,
      version: 3,
      renewalDate: new Date("2025-12-01T00:00:00.000Z"),
    },
  });

  await prisma.invoice.createMany({
    data: [
      {
        id: IDS.invoiceAtlas,
        organizationId: IDS.org,
        customerId: IDS.customerAtlas,
        amount: 22000,
        status: InvoiceStatus.PAID,
        dueDate: new Date("2025-02-05T00:00:00.000Z"),
        paidAt: new Date("2025-02-02T00:00:00.000Z"),
      },
      {
        id: IDS.invoiceAurum,
        organizationId: IDS.org,
        customerId: IDS.customerAtlas,
        amount: 17400,
        status: InvoiceStatus.OVERDUE,
        dueDate: new Date("2025-03-05T00:00:00.000Z"),
      },
    ],
  });

  await prisma.activity.create({
    data: {
      leadId: IDS.leadAurum,
      dealId: IDS.dealAurum,
      agentId: "agent_sdr",
      type: ActivityType.AGENT_ACTION,
      channel: "dashboard",
      content: {
        summary: "Aurum solicitou desconto adicional de 5% e revisão de cláusula de SLA",
      },
      outcome: "pendente",
    },
  });

  console.log("Seed determinístico concluído", IDS);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
