import { redirect } from "next/navigation";

export default async function RedesignArticleRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/articles/${id}`);
}
