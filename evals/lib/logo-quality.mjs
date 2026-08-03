const TRUSTED_ICON_SOURCES = new Set(['lucide', 'tabler', 'phosphor']);
const GENERIC_ICON_NAMES = new Set(['bolt', 'sparkles', 'zap']);

function parseAttrs(source) {
  const attrs = {};
  for (const match of source.matchAll(/([\w-]+)="([^"]*)"/g)) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

function findRoleTag(svg, tag, role) {
  const match = svg.match(new RegExp(`<${tag}\\b([^>]*data-role="${role}"[^>]*)>`, 'i'));
  return match ? parseAttrs(match[1]) : null;
}

export function checkLogoQuality(svg) {
  const logo = findRoleTag(svg, 'g', 'logo');
  const halo = findRoleTag(svg, 'circle', 'logo-halo');
  const tile = findRoleTag(svg, 'rect', 'logo-tile');
  const glyphMatch = svg.match(/<g\b([^>]*data-role="logo-glyph"[^>]*)>([\s\S]*?)<\/g>/i);
  const glyphAttrs = glyphMatch ? parseAttrs(glyphMatch[1]) : null;
  const glyphBody = glyphMatch?.[2] || '';

  const source = logo?.['data-icon-source']?.toLowerCase() || '';
  const iconName = logo?.['data-icon-name']?.toLowerCase() || '';
  const license = logo?.['data-icon-license'] || '';
  const intent = logo?.['data-logo-intent']?.trim() || '';
  const genericAllowed = logo?.['data-logo-allow-generic'] === 'true';
  const hasVectorGlyph = /<(?:path|line|polyline|polygon|circle)\b/i.test(glyphBody);
  const tileWidth = +(tile?.width || 0);
  const haloRadius = +(halo?.r || 0);

  return [
    {
      text: 'logo-semantic-intent',
      passed: intent.length >= 3 && (!GENERIC_ICON_NAMES.has(iconName) || genericAllowed),
      evidence: intent
        ? `intent="${intent}", icon="${iconName || 'missing'}"`
        : 'missing data-logo-intent',
    },
    {
      text: 'logo-library-attribution',
      passed: TRUSTED_ICON_SOURCES.has(source) && iconName.length > 0 && license.length > 0,
      evidence: source ? `${source}/${iconName || 'missing'} (${license || 'license missing'})` : 'icon source missing',
    },
    {
      text: 'logo-glyph-vector',
      passed: !!glyphAttrs && hasVectorGlyph,
      evidence: hasVectorGlyph ? 'vector glyph group present' : 'missing data-role="logo-glyph" vector content',
    },
    {
      text: 'logo-halo-proportion',
      passed: tileWidth > 0 && haloRadius > 0 && haloRadius <= tileWidth * 0.72,
      evidence: tileWidth > 0
        ? `halo radius ${haloRadius}, tile width ${tileWidth}, limit ${(tileWidth * 0.72).toFixed(1)}`
        : 'missing logo tile or halo dimensions',
    },
    {
      text: 'logo-accessible',
      passed: /<title\b[^>]*>[^<]+<\/title>/i.test(svg) && /<desc\b[^>]*>[^<]+<\/desc>/i.test(svg),
      evidence: 'SVG requires non-empty title and desc',
    },
  ];
}
