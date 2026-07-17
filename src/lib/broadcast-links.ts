export interface BroadcastLink {
  label: string;
  url: string;
  icon: string;
}

export function getBroadcastLinks(homeTeam: string, awayTeam: string): BroadcastLink[] {
  const query = encodeURIComponent(`${homeTeam} vs ${awayTeam}`);

  return [
    {
      label: 'Watch Live',
      url: `https://livetv.sx/enx/`,
      icon: '📺',
    },
    {
      label: 'YouTube Highlights',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${homeTeam} vs ${awayTeam} FIFA World Cup 2026 highlights`)}`,
      icon: '▶',
    },
    {
      label: 'FIFA+',
      url: 'https://www.fifa.com/fifaplus/en/watch/tournaments/189/mens-fifa-world-cup-2026',
      icon: '🏟',
    },
  ];
}
