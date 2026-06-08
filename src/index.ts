interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Horoscope MCP — wraps the keyless Horoscope App API.
 * https://horoscope-app-api.vercel.app
 */


const BASE = 'https://horoscope-app-api.vercel.app/api/v1';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

const tools: McpToolExport['tools'] = [
  {
    name: 'daily_horoscope',
    description:
      'Get the daily horoscope for a zodiac sign. Returns the prediction text for a given day (today, tomorrow, yesterday, or a specific YYYY-MM-DD date). Useful for "what is my horoscope today" style questions.',
    inputSchema: {
      type: 'object',
      properties: {
        sign: {
          type: 'string',
          description:
            'Zodiac sign (case-insensitive). One of: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces.',
        },
        day: {
          type: 'string',
          description:
            'Day to fetch. One of TODAY, TOMORROW, YESTERDAY, or a date in YYYY-MM-DD format. Defaults to TODAY.',
        },
      },
      required: ['sign'],
    },
  },
  {
    name: 'weekly_horoscope',
    description:
      'Get the weekly horoscope for a zodiac sign. Returns the prediction text covering the current week.',
    inputSchema: {
      type: 'object',
      properties: {
        sign: {
          type: 'string',
          description:
            'Zodiac sign (case-insensitive). One of: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces.',
        },
      },
      required: ['sign'],
    },
  },
  {
    name: 'monthly_horoscope',
    description:
      'Get the monthly horoscope for a zodiac sign. Returns the prediction text for the current month plus challenging and standout days.',
    inputSchema: {
      type: 'object',
      properties: {
        sign: {
          type: 'string',
          description:
            'Zodiac sign (case-insensitive). One of: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces.',
        },
      },
      required: ['sign'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'daily_horoscope':
      return dailyHoroscope(args);
    case 'weekly_horoscope':
      return weeklyHoroscope(args);
    case 'monthly_horoscope':
      return monthlyHoroscope(args);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function dailyHoroscope(args: Record<string, unknown>): Promise<unknown> {
  const sign = normalizeSign(args.sign);
  if (!sign) return invalidSign();

  let day = (typeof args.day === 'string' ? args.day : '').trim();
  if (!day) day = 'TODAY';
  // TODAY/TOMORROW/YESTERDAY are keywords; YYYY-MM-DD dates pass through as-is.
  if (/^(today|tomorrow|yesterday)$/i.test(day)) day = day.toUpperCase();

  const url = `${BASE}/get-horoscope/daily?sign=${capitalize(sign)}&day=${encodeURIComponent(day)}`;
  const res = await getJson(url);
  if ('error' in res) return res;
  const data = (res.data ?? {}) as Record<string, unknown>;
  return {
    sign,
    period: 'daily',
    date: data.date ?? null,
    day,
    horoscope: data.horoscope ?? null,
  };
}

async function weeklyHoroscope(args: Record<string, unknown>): Promise<unknown> {
  const sign = normalizeSign(args.sign);
  if (!sign) return invalidSign();

  const url = `${BASE}/get-horoscope/weekly?sign=${capitalize(sign)}`;
  const res = await getJson(url);
  if ('error' in res) return res;
  const data = (res.data ?? {}) as Record<string, unknown>;
  return {
    sign,
    period: 'weekly',
    week: data.week ?? null,
    date: data.date ?? null,
    horoscope: data.horoscope_data ?? null,
  };
}

async function monthlyHoroscope(args: Record<string, unknown>): Promise<unknown> {
  const sign = normalizeSign(args.sign);
  if (!sign) return invalidSign();

  const url = `${BASE}/get-horoscope/monthly?sign=${capitalize(sign)}`;
  const res = await getJson(url);
  if ('error' in res) return res;
  const data = (res.data ?? {}) as Record<string, unknown>;
  return {
    sign,
    period: 'monthly',
    date: data.date ?? null,
    challenging_days: data.challenging_days ?? null,
    standout_days: data.standout_days ?? null,
    horoscope: data.horoscope_data ?? null,
  };
}

function normalizeSign(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  return (SIGNS as readonly string[]).includes(s) ? s : null;
}

function invalidSign(): { error: string; valid_signs: string[] } {
  return { error: 'invalid sign', valid_signs: [...SIGNS] };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function getJson(url: string): Promise<Record<string, unknown> & { error?: string }> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (!res.ok) {
      const body = await res.text().then((t) => t.slice(0, 200)).catch(() => '');
      return { error: `Horoscope API: ${res.status} ${body}` };
    }
    const json = (await res.json()) as Record<string, unknown>;
    return json;
  } catch (e) {
    return { error: `Horoscope API request failed: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
