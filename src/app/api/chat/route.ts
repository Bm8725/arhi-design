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
   - UAT doicesti / UAT Gura Ocniței: Zone cu restricții de protecție a mediului (pajiști, păduri). Necesită avize de la Agenția pentru Protecția Mediului Dâmbovița.
`;

// Maparea paginilor reale ale site-ului. Arhi trebuie să trimită userul
// spre link-ul potrivit ori de câte ori discuția atinge unul din aceste
// subiecte, în loc să vorbească doar generic despre "site-ul nostru".
const SITE_MAP = `
PAGINI DISPONIBILE PE SITE (folosește-le ca linkuri relative, ex: /portofoliu):

- /                        → Pagina principală / prezentare birou
- /shop                    → Catalog produse digitale (planuri, ghiduri, șabloane)
- /portofoliu              → Portofoliu de proiecte proarh.4d
- /servicii                → Pagina principală de servicii
- /proiectare-arhitectura  → Detalii despre serviciul de proiectare & arhitectură
- /randari-3d              → Detalii despre serviciul de randări 3D
- /shopping-cart           → Coșul de cumpărături
- /dashboard/client        → Contul clientului (comenzi, descărcări)
- /login                   → Autentificare / creare cont

REGULI DE FOLOSIRE A LINKURILOR:
- Menționează un link DOAR când e relevant pentru întrebare (nu înșira toate paginile).
- Dacă utilizatorul întreabă despre servicii de proiectare → recomandă /proiectare-arhitectura.
- Dacă întreabă despre randări/vizualizări 3D → recomandă /randari-3d.
- Dacă vrea să vadă lucrări anterioare / exemple → recomandă /portofoliu.
- Dacă vrea să cumpere un produs digital (planuri, șabloane) → recomandă /shop.
- Dacă vrea să își descarce achizițiile sau să-și vadă comenzile → recomandă /dashboard/client (spune-i să se autentifice la /login dacă nu are cont).
`;

const SYSTEM_PROMPT = `Numele tău este Arhi. Ești un asistent virtual de încredere al biroului de arhitectură Bogdan Sotingeanu, specializat în urbanism și arhitectură în România.

Răspunde prietenos, extrem de profesionist și precis în limba română.

Când utilizatorul întreabă despre zone din Dâmbovița, folosește datele tehnice de mai jos pentru a oferi detalii despre UAT-uri, PUZ-uri, POT, CUT și avize necesare. Dacă o localitate specifică din Dâmbovița nu se află în baza de date, explică ce pași generali trebuie făcuți (solicitare Certificat de Urbanism la Primărie/Consiliul Județean, consultare PUG local).

Când discuția atinge servicii, portofoliu, produse digitale sau contul utilizatorului, ghidează-l spre pagina corectă a site-ului, folosind maparea de mai jos.

BAZA DE DATE URBANISM DÂMBOVIȚA:
${DAMBOVITA_URBANISM_DB}

${SITE_MAP}`;

const FALLBACK_ERROR_MESSAGE =
  "Ne pare rău, a apărut o problemă tehnică la generarea răspunsului. Te rugăm să încerci din nou în câteva momente.";

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: GROQ_API_KEY nu este definit în mediu.");
    return NextResponse.json({ error: "Lipsește GROQ_API_KEY" }, { status: 500 });
  }

  // ── Parsare & validare body ──────────────────────────────────────────────
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corp de request invalid (JSON greșit)." }, { status: 400 });
  }

  const rawMessages = body?.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json({ error: "Câmpul 'messages' lipsește sau e gol." }, { status: 400 });
  }

  // Filtrare și mapare sigură a istoricului mesajelor
  const cleanMessages = rawMessages
    .filter((msg: any) => typeof msg?.content === "string" && msg.content.trim().length > 0)
    .map((msg: any) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    }));

  if (cleanMessages.length === 0) {
    return NextResponse.json({ error: "Niciun mesaj valid de trimis." }, { status: 400 });
  }

  const groq = new Groq({ apiKey });

  // ── Pornirea request-ului către Groq ────────────────────────────────────
  // Separată de procesarea stream-ului, ca să putem întoarce coduri de
  // eroare clare (401 / 429 / 500) dacă request-ul inițial eșuează,
  // înainte să fi trimis vreun byte către client.
  let groqStream;
  try {
    groqStream = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...cleanMessages,
      ],
      stream: true,
    });
  } catch (err: any) {
    console.error("Eroare la inițierea request-ului către Groq:", err);

    const status = err?.status ?? err?.response?.status;
    if (status === 401) {
      return NextResponse.json({ error: "Cheie API Groq invalidă." }, { status: 401 });
    }
    if (status === 429) {
      return NextResponse.json({ error: "Prea multe cereri către Groq. Încearcă din nou în câteva secunde." }, { status: 429 });
    }
    return NextResponse.json({ error: "Nu s-a putut porni conversația cu asistentul." }, { status: 502 });
  }

  // ── Streaming către client ───────────────────────────────────────────────
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of groqStream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (err) {
        // Stream-ul a picat la mijloc. Nu mai putem întoarce un status HTTP
        // (răspunsul a început deja), așa că trimitem un mesaj prietenos
        // direct în conținutul stream-ului, ca userul să vadă ceva concret
        // în loc ca bula de mesaj să rămână blocată în starea de "scrie...".
        console.error("Eroare în timpul procesării fluxului Groq:", err);
        controller.enqueue(encoder.encode(FALLBACK_ERROR_MESSAGE));
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
}