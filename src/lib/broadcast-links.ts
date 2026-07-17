export interface BroadcastLink {
  label: string;
  url: string;
  icon: string;
}

export function getBroadcastLinks(homeTeam: string, awayTeam: string): BroadcastLink[] {
  const query = encodeURIComponent(`${homeTeam} vs ${awayTeam} FIFA World Cup 2026 highlights`);
  const fullQuery = encodeURIComponent(`${homeTeam} vs ${awayTeam} FIFA World Cup 2026 full match`);

  return [
    {
      label: 'YouTube Highlights',
      url: `https://www.youtube.com/results?search_query=${query}`,
      icon: '▶',
    },
    {
      label: 'YouTube Full Match',
      url: `https://www.youtube.com/results?search_query=${fullQuery}`,
      icon: '📺',
    },
    {
      label: 'FIFA+',
      url: 'https://www.fifa.com/fifaplus/en/watch/tournaments/189/mens-fifa-world-cup-2026',
      icon: '🏟',
    },
    {
      label: 'Fox Sports',
      url: `https://www.foxsports.com/search?query=${homeTeam}+vs+${awayTeam}`,
      icon: '🦊',
    },
  ];
}

export function getYouTubeEmbedUrl(homeTeam: string, awayTeam: string): string {
  const query = encodeURIComponent(`${homeTeam} vs ${awayTeam} FIFA World Cup 2026 highlights`);
  return `https://www.youtube.com/embed?listType=search&list=${query}`;
}
