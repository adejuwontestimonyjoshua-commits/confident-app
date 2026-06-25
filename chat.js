export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, systemExtra } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const SYSTEM_PROMPT = `You are a growth advisor for Testimony, a Nigerian female entrepreneur selling "The Confident V Complete Bundle" — a women's feminine health ebook bundle priced at ₦8,500 on Selar.co. The bundle includes: the main guide (why toilet infections keep recurring + remedies), a Symptom Checker, a 7-Day Reset Protocol, a Foods That Fight reference card, and a Never Do This hygiene habit audit. Target audience: Nigerian women aged 18–45 dealing with recurring vaginal infections. Testimony has zero advertising budget and needs her first 20 sales through organic Facebook/Instagram marketing and free micro-influencer collaborations. Always give practical, specific, Nigeria-relevant advice. Be concise and actionable.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT + (systemExtra || ''),
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({ text: data.content?.[0]?.text || 'No response received.' });

  } catch (error) {
    return res.status(500).json({ error: 'Failed to reach AI. Check your connection.' });
  }
}
