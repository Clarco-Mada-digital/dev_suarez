import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import QuoteRequestsList from "@/components/quotes/QuoteRequestsList";
import { redirect } from "next/navigation";

export default async function QuotesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const userId = session.user.id;

  const [sent, received] = await Promise.all([
    prisma.quoteRequest.findMany({ where: { clientId: userId }, orderBy: { createdAt: "desc" } }),
    prisma.quoteRequest.findMany({ where: { freelancerId: userId }, orderBy: { createdAt: "desc" } }),
  ]);

  const serialize = (q: any) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    budgetMin: q.budgetMin,
    budgetMax: q.budgetMax,
    deadline: q.deadline ? q.deadline.toISOString() : null,
    status: q.status,
    createdAt: q.createdAt.toISOString(),
    clientId: q.clientId,
    freelancerId: q.freelancerId,
    counterBudgetMin: q.counterBudgetMin,
    counterBudgetMax: q.counterBudgetMax,
    counterDeadline: q.counterDeadline ? q.counterDeadline.toISOString() : null,
    counterMessage: q.counterMessage || null,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Demandes de devis</h1>
          <p className="text-muted-foreground mt-1">Gérez vos demandes reçues et envoyées.</p>
        </div>
        <QuoteRequestsList
          sent={sent.map(serialize)}
          received={received.map(serialize)}
          userId={userId}
        />
      </div>
    </div>
  );
}
