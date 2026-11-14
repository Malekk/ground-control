import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Chat · Ground Control" };

export default function ChatPage() {
  return (
    <>
      <PageHeader title="Chat" description="Décrire une idée pour en tirer une spec." />
      <EmptyState message="Le chat arrive au ticket #8." />
    </>
  );
}
