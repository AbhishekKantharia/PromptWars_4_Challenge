import { NextRequest, NextResponse } from 'next/server';
import { chatMessageSchema } from '@/utils/validation';
import { detectPromptInjection, sanitizeInput } from '@/utils/security';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limiter';
import { fetchWeather, VENUES, getWeatherImpact, type WeatherData } from '@/lib/realtime-data';
import type { Language } from '@/types';

interface TemplateMatch {
  patterns: RegExp[];
  handler: (matches: RegExpMatchArray, ctx: TemplateContext) => string | Promise<string>;
}

interface TemplateContext {
  weather: WeatherData | null;
  venue: typeof VENUES[0];
  lang: Language;
}

const GREETINGS: Record<Language, string[]> = {
  en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
  es: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches'],
  fr: ['bonjour', 'salut', 'bonsoir'],
  pt: ['ola', 'bom dia', 'boa tarde', 'boa noite'],
  ar: ['marhaba', 'ahlan', 'sabah alkhayr'],
  hi: ['namaste', 'namaskar', 'kaise ho'],
  ja: ['konnichiwa', 'ohayou', 'konbanwa'],
  de: ['hallo', 'guten tag', 'guten morgen'],
  it: ['ciao', 'buongiorno', 'buonasera'],
  zh: ['nihao', 'zao shang hao', 'wan shang hao'],
};

const LANG_NAMES: Record<Language, string> = {
  en: 'English', es: 'Spanish', fr: 'French', pt: 'Portuguese', ar: 'Arabic',
  hi: 'Hindi', ja: 'Japanese', de: 'German', it: 'Italian', zh: 'Chinese',
};

const TEMPLATES: TemplateMatch[] = [
  {
    patterns: [/weather|rain|cold|hot|temperature|sunny|wind|storm|forecast/i],
    handler: (_m, ctx) => {
      if (!ctx.weather) return 'Weather data is currently unavailable. Please check your local forecast.';
      const impact = getWeatherImpact(ctx.weather);
      let response = `Current weather at ${ctx.venue.name}: ${ctx.weather.condition}, ${Math.round(ctx.weather.temperature)} degrees Celsius, humidity ${ctx.weather.humidity}%, wind ${Math.round(ctx.weather.windSpeed)} km/h.`;
      if (impact.safetyNotes.length > 0) {
        response += ` Important notes: ${impact.safetyNotes.join('. ')}.`;
      }
      response += ` Crowd impact: ${impact.crowdImpact}. Transport impact: ${impact.transportImpact}.`;
      return response;
    },
  },
  {
    patterns: [/gate\s*(\w+)/i, /entrance\s*(\w*)/i, /where.*gate/i, /find.*gate/i, /gate\s*(north|south|east|west|a|b|c|d|e|f)/i],
    handler: (_m, ctx) => {
      const gate = _m[1] || 'your nearest';
      return `To find ${gate} Gate at ${ctx.venue.name}, look for the overhead gate signs from the main concourse. The North and South gates are the main entrances. Gates are clearly marked with large letter signs and illuminated indicators. Follow the directional signs from any concourse level. If you need step-by-step directions, try the Navigation tab for an interactive map with walking routes.`;
    },
  },
  {
    patterns: [/restroom|toilet|bathroom|wc/i],
    handler: (_m, ctx) => {
      const restrooms = ctx.weather?.temperature ? `Restrooms are located on every concourse level at ${ctx.venue.name}. The nearest accessible restrooms are near sections 100, 200, and 300. Look for the standard restroom signs.` : `Restrooms are available on all concourse levels.`;
      return `${restrooms} If you need an accessible restroom, ask any staff member or check the Navigation tab for the nearest one on the interactive map.`;
    },
  },
  {
    patterns: [/food|eat|restaurant|concession|hungry|snack|dining|menu|pizza|burger|hotdog|nachos/i],
    handler: (_m, ctx) => {
      const temp = ctx.weather?.temperature;
      const hot = temp && temp > 30 ? ' Given the warm weather, cold drinks and ice cream are available at most stands.' : '';
      return `Food and beverage options at ${ctx.venue.name} include multiple concession stands on every concourse level. You can find burgers, hot dogs, pizza, nachos, and local specialties. Bottled water and non-alcoholic drinks are available throughout. Alcohol is served at designated areas with a 2-drink maximum per purchase.${hot} Check the interactive map for the nearest food court.`;
    },
  },
  {
    patterns: [/parking|car|drive|lot/i],
    handler: (_m, ctx) => {
      return `Parking at ${ctx.venue.name} is available in several lots surrounding the stadium. General parking opens 4 hours before kickoff. VIP and accessible parking are closest to the main entrances. Expect to pay $30-60 depending on the lot. We strongly recommend public transit as parking fills up quickly on match days. The lots are marked on the interactive map.`;
    },
  },
  {
    patterns: [/metro|train|rail|subway|transit|bus/i],
    handler: (_m, ctx) => {
      return `Public transit is the best way to reach ${ctx.venue.name}. Trains run every 8-15 minutes on match days. Bus routes connect from major transit hubs. Check the Transport tab for real-time schedules and nearby stop locations. Plan to arrive at least 90 minutes before kickoff to account for walk time from the station.`;
    },
  },
  {
    patterns: [/emergency|help|911|ambulance|fire|medical/i],
    handler: (_m, ctx) => {
      const weatherAlert = ctx.weather && ctx.weather.weatherCode >= 95 ? ' Thunderstorm warning is active. Seek shelter immediately.' : '';
      return `For emergencies at ${ctx.venue.name}, call 911 immediately. First aid stations are located at sections 100, 200, and near the main gates. Medical staff are stationed throughout the venue. Look for the green cross signs. If you see something suspicious, report it to the nearest staff member or use the Emergency tab.${weatherAlert}`;
    },
  },
  {
    patterns: [/lost.*child|child.*lost|missing.*kid|kid.*missing/i],
    handler: (_m, ctx) => {
      return `If a child is lost at ${ctx.venue.name}, immediately notify the nearest staff member or security personnel. They will activate the lost child protocol. Stay in the area where the child was last seen. Do not leave the venue. Staff will broadcast a description over the PA system. The nearest Guest Services desk is at the main entrance. You can also use the Emergency tab to file a formal report.`;
    },
  },
  {
    patterns: [/wheelchair|accessib|disab|elevator|lift|ramp|special.*need/i],
    handler: (_m, ctx) => {
      return `${ctx.venue.name} is fully accessible. Wheelchair viewing areas are available in all sections. Elevators are located at the north and south ends of the stadium. Accessible entrances have ramp access. Companion seats are available next to wheelchair spaces. If you need assistance, ask any staff member or check the Accessibility tab for detailed information about accessible routes and services.`;
    },
  },
  {
    patterns: [/lost.*found|lost.*and.*found|found.*item|found.*object/i],
    handler: (_m, ctx) => {
      return `The Lost and Found desk at ${ctx.venue.name} is located near the main Guest Services entrance. If you have lost an item, visit the desk with a description of the item and your section/seat number. For items lost during the match, check after the game ends. You can also report a lost item through the Volunteer tab.`;
    },
  },
  {
    patterns: [/security|bag|prohibited|allowed|weapon|knife/i],
    handler: (_m, ctx) => {
      return `${ctx.venue.name} has a clear bag policy. Only clear bags up to 12x6x12 inches or small clutch bags up to 4.5x6.5 inches are allowed. Prohibited items include weapons, outside food and drinks, umbrellas, laser pointers, and professional cameras. All guests go through metal detection screening. Arrive early to allow time for security checks.`;
    },
  },
  {
    patterns: [/score|match|game|kickoff|start.*time|when.*match|fixture/i],
    handler: async (_m, _ctx) => {
      try {
        const res = await fetch('https://worldcup26.ir/get/games', { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          const games = data?.data || [];
          const live = games.filter((g: Record<string, unknown>) =>
            ['1ST HALF', '2ND HALF', 'HT', 'ET', 'PEN'].includes((g.time_elapsed as string) || '')
          );
          if (live.length > 0) {
            return live.map((g: Record<string, unknown>) => {
              const home = (g.home_team_en as string) || (g.home_team as string) || 'TBD';
              const away = (g.away_team_en as string) || (g.away_team as string) || 'TBD';
              const hs = g.home_score != null ? g.home_score : '—';
              const as = g.away_score != null ? g.away_score : '—';
              const status = (g.time_elapsed as string) || '';
              return `${home} ${hs} - ${as} ${away} (${status})`;
            }).join('\n');
          }
          const finished = games.filter((g: Record<string, unknown>) => g.time_elapsed === 'finished').slice(-3);
          if (finished.length > 0) {
            return 'Recent results:\n' + finished.map((g: Record<string, unknown>) => {
              const home = (g.home_team_en as string) || 'TBD';
              const away = (g.away_team_en as string) || 'TBD';
              return `${home} ${g.home_score ?? '—'} - ${g.away_score ?? '—'} ${away}`;
            }).join('\n') + '\n\nFor live scores and fixtures, visit the Matches tab.';
          }
        }
      } catch {}
      return `Check the Matches tab for the latest World Cup 2026 scores, fixtures, and results. You can also ask me about a specific team or group.`;
    },
  },
  {
    patterns: [/exit|leave|go.*home|after.*match|post.*match/i],
    handler: (_m, ctx) => {
      return `After the match at ${ctx.venue.name}, follow the exit signs to the nearest gate. For the fastest exit, use gates opposite to your section. Public transit stations are a 5-10 minute walk. Ride-share pickup points are designated in Lot C. Expect heavy traffic for 30-60 minutes after the final whistle. Walking to distant parking lots may be faster than waiting in traffic.`;
    },
  },
  {
    patterns: [/sustain|green|eco|carbon|recycle|environment/i],
    handler: (_m, ctx) => {
      return `${ctx.venue.name} is committed to sustainability. Recycling and compost bins are available throughout the venue. Reusable cups are available at all beverage stands. Water refill stations are marked on the map. Public transit reduces your carbon footprint by up to 60% compared to driving. Check the Sustainability tab for live environmental metrics.`;
    },
  },
  {
    patterns: [/volunteer|help.*out|sign.*up|join|contribute/i],
    handler: (_m, ctx) => {
      return `Volunteers at ${ctx.venue.name} play a crucial role in fan experience. Current tasks include gate ushering, food court monitoring, accessibility guiding, and first aid support. Check the Volunteer tab for available tasks and your schedule. If you need to report an incident, use the incident report form in the Volunteer section.`;
    },
  },
  {
    patterns: [/transport|taxi|uber|lyft|rideshare|cab/i],
    handler: (_m, ctx) => {
      return `Ride-share pickup and drop-off at ${ctx.venue.name} is designated in Lot C, a 10-minute walk from the stadium. Taxi stands are at the main gate. For the best experience, set your pickup point to a nearby side street to avoid post-match congestion. The Transport tab shows real-time traffic conditions and all available transport options.`;
    },
  },
  {
    patterns: [/thank|thanks|thx|appreciate/i],
    handler: (_m, ctx) => {
      return `You are welcome! Enjoy your time at ${ctx.venue.name}. If you need anything else, just ask. Have a great match!`;
    },
  },
  {
    patterns: [/who.*are|what.*are.*you|your.*name|about.*you/i],
    handler: (_m, ctx) => {
      return `I am the StadiumIQ assistant for ${ctx.venue.name}. I can help you with navigation, food, transport, emergencies, accessibility, and more. I use real-time weather data and venue information to give you accurate answers. How can I help you today?`;
    },
  },
  {
    patterns: [/translate|language|speak.*spanish|speak.*french|espanol|francais/i],
    handler: (_m, ctx) => {
      return ctx.lang !== 'en'
        ? `I can respond in ${LANG_NAMES[ctx.lang]}. Use the language selector in the header to change languages at any time. All my responses will be in your selected language.`
        : `I support 10 languages including English, Spanish, French, Portuguese, Arabic, Hindi, Japanese, German, Italian, and Chinese. Use the language selector in the header to switch languages.`;
    },
  },
];

async function matchTemplate(input: string, ctx: TemplateContext): Promise<string | null> {
  const lower = input.toLowerCase().trim();

  for (const tmpl of TEMPLATES) {
    for (const pattern of tmpl.patterns) {
      const match = lower.match(pattern);
      if (match) {
        return await tmpl.handler(match, ctx);
      }
    }
  }
  return null;
}

function getFallbackResponse(input: string, ctx: TemplateContext): string {
  const lower = input.toLowerCase();
  if (lower.length < 5) return `How can I help you at ${ctx.venue.name}? You can ask about gates, food, transport, accessibility, weather, or emergencies.`;
  return `I can help with navigation, food and drinks, transport, accessibility, weather, security, emergencies, and more at ${ctx.venue.name}. Could you be more specific about what you need? For example, ask about gates, parking, restrooms, or the weather.`;
}

function getLocalizedGreeting(lang: Language): string {
  const now = new Date();
  const hour = now.getHours();
  const greetings = GREETINGS[lang] || GREETINGS.en;
  if (hour < 12) return greetings[1] || greetings[0];
  if (hour < 18) return greetings[2] || greetings[0];
  return greetings[3] || greetings[0];
}

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request);
  const rl = rateLimit(clientId, 'chat');
  if (!rl.success) return rl.response!;

  try {
    const body = await request.json();
    const parsed = chatMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { message, language } = parsed.data;

    if (detectPromptInjection(message)) {
      return NextResponse.json({ error: 'Your message contains content that cannot be processed.' }, { status: 400 });
    }

    const sanitized = sanitizeInput(message);
    const venue = VENUES[0];
    let weather: WeatherData | null = null;

    try {
      weather = await fetchWeather(venue.lat, venue.lon);
    } catch {
      // Weather unavailable, continue without it
    }

    const ctx: TemplateContext = { weather, venue, lang: (language as Language) || 'en' };

    const greetingPatterns = GREETINGS[ctx.lang] || GREETINGS.en;
    const isGreeting = greetingPatterns.some(g => sanitized.toLowerCase().startsWith(g));
    if (isGreeting && sanitized.split(/\s+/).length <= 3) {
      return NextResponse.json({
        response: `${getLocalizedGreeting(ctx.lang)} Welcome to ${ctx.venue.name}! I can help you with navigation, food, transport, weather, accessibility, or emergencies. What do you need?`,
        metadata: { source: 'template', tokenUsage: 0 },
        language: ctx.lang,
      });
    }

    const templateResponse = await matchTemplate(sanitized, ctx);
    if (templateResponse) {
      return NextResponse.json({
        response: templateResponse,
        metadata: { source: 'template', tokenUsage: 0 },
        language: ctx.lang,
      });
    }

    const fallback = getFallbackResponse(sanitized, ctx);
    return NextResponse.json({
      response: fallback,
      metadata: { source: 'template-fallback', tokenUsage: 0 },
      language: ctx.lang,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process your request.' }, { status: 500 });
  }
}
