import AssistantForm from "@/components/ai/AssistantForm";

export default function AssistantPage() {
  return (
    <main className="container mx-auto max-w-6xl py-20">
      <h1 className="text-2xl font-semibold">Assistant IA</h1>
      <p className="text-muted-foreground mt-1">
        Décrivez votre projet et obtenez un plan, des questions de cadrage et des freelances recommandés.
      </p>
      <div className="mt-6">
        <AssistantForm />
      </div>
    </main>
  );
}
