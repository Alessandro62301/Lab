import { NextResponse } from "next/server";

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | "true";
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ cep: string }> },
) {
  const { cep: rawCep } = await context.params;
  const cep = rawCep.replace(/\D/g, "");
  if (!/^\d{8}$/.test(cep)) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Não foi possível consultar o CEP." }, { status: 502 });
    }
    const data = await response.json() as ViaCepResponse;
    if (data.erro) {
      return NextResponse.json({ error: "CEP não encontrado." }, { status: 404 });
    }
    return NextResponse.json({
      data: {
        cep: data.cep ?? "",
        street: data.logradouro ?? "",
        neighborhood: data.bairro ?? "",
        city: data.localidade ?? "",
        state: data.uf ?? "",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "O serviço de CEP não respondeu. Tente novamente." },
      { status: 504 },
    );
  }
}
