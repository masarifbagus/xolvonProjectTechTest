import TransactionDetailClient from "./transaction-detail-client";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

interface TransactionPageProps {
  params: Promise<{ id: string }>;
}

export default function TransactionDetailPage({ params }: TransactionPageProps) {
  return <TransactionDetailClient params={params} />;
}
