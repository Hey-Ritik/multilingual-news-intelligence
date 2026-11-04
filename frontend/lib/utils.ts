const namedEntities: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  nbsp: ' ',
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#(?:x[\da-f]+|\d+)|[a-z][\da-z]+);/gi, (entity, reference: string) => {
    if (reference[0] !== '#') {
      return namedEntities[reference.toLowerCase()] ?? entity;
    }

    const isHex = reference[1]?.toLowerCase() === 'x';
    const codePoint = Number.parseInt(reference.slice(isHex ? 2 : 1), isHex ? 16 : 10);
    if (
      !Number.isInteger(codePoint) ||
      codePoint < 0 ||
      codePoint > 0x10ffff ||
      (codePoint >= 0xd800 && codePoint <= 0xdfff)
    ) {
      return '\uFFFD';
    }

    return String.fromCodePoint(codePoint);
  });
}

export function stripHtmlAndEntities(value: string | null | undefined): string {
  if (typeof value !== 'string' || value.length === 0) {
    return '';
  }

  const withoutMarkup = value
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/?[a-z][^>]*>|<![^>]*>/gi, ' ');

  return decodeHtmlEntities(withoutMarkup).replace(/\s+/g, ' ').trim();
}
