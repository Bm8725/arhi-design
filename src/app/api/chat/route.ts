import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const DAMBOVITA_URBANISM_DB = `
REGLEMENTĂRI URBANISTICE VERIFICATE - JUDEȚUL DÂMBOVIȚA (2026):

INFORMAȚII GENERALE JUDEȚ:
- Consiliul Județean Dâmbovița gestionează avizarea pentru PUZ-urile din afara intravilanului sau care trec de competența UAT-urilor mici.
- Documentații frecvente: Plan Urbanistic Zonal (PUZ), Plan Urbanistic General (PUG), Certificat de Urbanism (CU).

DATE SPECIFICE PE UAT-URI (UNITĂȚI ADMINISTRATIV-TERITORIALE):

1. UAT TÂRGOVIȘTE (Municipiu reședință de județ):
   - Zona Centrală (ZCP): Restricții majore de monumente istorice. Necesită aviz de la Direcția Județeană pentru Cultură Dâmbovița.
   - Zone Rezidențiale noi (ex: Aleea Mănăstirii / Priseaca): Regim mediu P+2E. POT max: 35%, CUT max: 1.05.
   - Zonă Industrială (Calea Ploiești / Șoseaua Găești): Destinație exclusiv industrială/depozitare. POT max: 60%, CUT max: 1.2. Retragere minimă față de aliniament: 6m.

2. UAT MORENI (Municipiu):
   - Specific: Multe zone cu restricții din cauza fostelor exploatări petroliere sau rețele subterane de conducte. Necesită avize speciale de la deținătorii de utilități petro-chimice.
   - POT mediu în zone de locuințe individuale: 30-35%.

3. UAT PUCIOASA / FIENI (Zone balneare / industriale montane):
   - Pucioasa: Restricții privind protecția stațiunii balneoclimaterice.
   - Fieni: Zone de impact industrial (fabrica de ciment). Zonele rezidențiale au restricții de poluare/zgomot.

4. UAT-URI PERIURBANE / COMUNE MARI (ex: Răzvad, Ulmi, Aninoasa, Doicești):
   - UAT Ulmi: Dezvoltare industrială masivă recentă (zona Arctic). PUZ-urile industriale de aici au POT până la 60%.
   - UAT Aninoasa / Răzvad: Zone de extindere rezidențială. Terenurile din extravilan necesită obligatoriu PUZ de introducere în intravilan. Retrageri standard: minim 3m față de limitele laterale, minim 5m față de axul drumurilor comunale dacă nu există aliniament stabilit.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("CRITICAL: GROQ_API_KEY nu este definit în mediu.");
      return NextResponse.json({ error: "Lipsește GROQ_API_KEY" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    // Filtrare și mapare sigură a istoricului mesajelor
    const cleanMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content || '',
    }));

    const systemPrompt = `Numele tău este Arhi. Ești un asistent virtual de încredere al biroului de arhitectură Bogdan Sotingeanu, specializat în urbanism și arhitectură în România.
    
    Răspunde prietenos, extrem de profesionist și precis în limba română.
    Când utilizatorul întreabă despre zone din Dâmbovița, folosește datele tehnice de mai jos pentru a oferi detalii despre UAT-uri, PUZ-uri, POT, CUT și avize necesare. Dacă o localitate specifică din Dâmbovița nu se află în baza de date, explică ce pași generali trebuie făcuți (solicitare Certificat de Urbanism la Primărie/Consiliul Județean, consultare PUG local).

    BAZA DE DATE URBANISM DÂMBOVIȚA:
    ${DAMBOVITA_URBANISM_DB}`;

    const groqStream = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        ...cleanMessages
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of groqStream) {
            // CORECTAT: Preluarea proprietății delta se face prin indexarea specifică matricilor JavaScript [0]
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error("Eroare în timpul procesării fluxului Groq:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });

  } catch (error: any) {
    console.error("Groq Global Route Error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
