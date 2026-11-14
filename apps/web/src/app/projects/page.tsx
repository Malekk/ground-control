import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Projets · Ground Control" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projets" description="Les produits pilotés par Ground Control." />
      <EmptyState message="Aucun projet pour le moment." />
    </>
  );
}
