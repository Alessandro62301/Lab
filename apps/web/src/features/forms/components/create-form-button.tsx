"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateFormButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function createForm() {
    setLoading(true);
    const response = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Novo formulário" }),
    });
    const payload = await response.json();
    if (response.ok) router.push(`/forms/${payload.data.id}/editor`);
    else setLoading(false);
  }

  return (
    <Button size="sm" onClick={createForm} disabled={loading}>
      {loading ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
      Novo formulário
    </Button>
  );
}
