export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { job, historico = [] } = req.body;

    if (!job) {
      return res.status(400).json({ error: "Missing job description" });
    }

    let historicoTexto = "";
    if (historico.length > 0) {
      historicoTexto = "Histórico de propostas anteriores:\n";
      historico.forEach((h, i) => {
        historicoTexto += `Proposta ${i + 1}: ${h}\n`;
      });
      historicoTexto += "\n";
    }

    const prompt = `
Você é um profissional sênior, com experiência real na área do projeto descrito abaixo.

Fale como alguém que realmente trabalha com esse tipo de projeto no dia a dia.
Mostre que você entendeu o problema do cliente, proponha uma solução prática e transmita confiança, de forma natural e humana.

Adapte automaticamente sua linguagem e conhecimento ao tipo de projeto (SaaS, APIs, automação, e-commerce, sites, integrações, etc), demonstrando domínio do assunto sem parecer genérico ou robótico.

Regras importantes:
- Texto curto e objetivo (máximo 3 parágrafos)
- Tom humano, profissional e próximo
- Sem listas, sem emojis, sem perguntas
- Finalize convidando o cliente a continuar a conversa

${historicoTexto}
Projeto:
${job}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // estável e rápido na Vercel
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: "OpenAI error",
        details: data,
      });
    }

    return res.status(200).json({
      proposal: data.choices[0].message.content,
    });

  } catch (err) {
    return res.status(500).json({
      error: "Server error",
      message: err.message,
    });
  }
}

