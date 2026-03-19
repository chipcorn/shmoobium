const HIGHLIGHT_CLASSES = ['shmoobium-highlight-marker', 'shmoobium-highlight-brush', 'shmoobium-highlight-solid'] as const;

function splitIntoLines(el: HTMLElement): string[] {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const textNodes: Text[] = [];
  let n: Text | null;
  while ((n = walker.nextNode() as Text | null)) textNodes.push(n);
  const fullText = el.textContent || '';
  if (!fullText || textNodes.length === 0) return [fullText];

  const range = document.createRange();
  const lines: string[] = [];
  let offset = 0;

  function setRangeTo(startOffset: number, endOffset: number) {
    let idx = 0;
    for (const node of textNodes) {
      const len = node.length;
      if (startOffset < idx + len) {
        range.setStart(node, Math.max(0, startOffset - idx));
        break;
      }
      idx += len;
    }
    idx = 0;
    for (const node of textNodes) {
      const len = node.length;
      if (endOffset <= idx + len) {
        range.setEnd(node, Math.min(len, endOffset - idx));
        break;
      }
      idx += len;
    }
  }

  while (offset < fullText.length) {
    let lineEnd = offset;
    while (lineEnd < fullText.length) {
      setRangeTo(offset, lineEnd + 1);
      if (range.getClientRects().length > 1) break;
      lineEnd++;
    }
    lines.push(fullText.slice(offset, lineEnd));
    offset = lineEnd;
  }
  return lines;
}

function wrapLines(el: HTMLElement, variant: (typeof HIGHLIGHT_CLASSES)[number], color: string) {
  const lines = splitIntoLines(el);
  if (lines.length <= 1) {
    el.classList.remove('shmoobium-highlight-container');
    el.classList.add(variant);
    el.style.setProperty('--shmoobium-highlight-color', color);
    return false;
  }
  el.textContent = '';
  const fragment = document.createDocumentFragment();
  el.classList.remove(variant);
  el.classList.add('shmoobium-highlight-container');
  el.dataset.shmoobiumHlVariant = variant;
  el.dataset.shmoobiumHlColor = color;
  lines.forEach((line, i) => {
    const span = document.createElement('span');
    span.className = variant;
    span.style.setProperty('--shmoobium-highlight-color', color);
    span.textContent = line;
    fragment.appendChild(span);
    if (i < lines.length - 1) fragment.appendChild(document.createElement('br'));
  });
  el.appendChild(fragment);
  return true;
}

function getFullText(el: HTMLElement): string {
  const spans = el.querySelectorAll(':scope > span');
  if (spans.length) return Array.from(spans).map(s => s.textContent || '').join('');
  return el.textContent || '';
}

function processElement(el: HTMLElement) {
  const variantClass = HIGHLIGHT_CLASSES.find(c => el.classList.contains(c));
  if (!variantClass) return;

  const color = el.classList.contains('shmoobium-highlight-container')
    ? el.dataset.shmoobiumHlColor || ''
    : getComputedStyle(el).getPropertyValue('--shmoobium-highlight-color').trim();

  if (!color) return;

  const fullText = getFullText(el);
  if (!fullText) return;

  el.textContent = fullText;
  wrapLines(el, variantClass, color);
}

function parseColorClasses(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[class]').forEach(el => {
    Array.from(el.classList).forEach(cls => {
      const match = cls.match(/^(shmoobium-highlight-(?:marker|brush|solid)):(.+)$/);
      if (match) {
        const [, variant, color] = match;
        el.classList.remove(cls);
        el.classList.add(variant);
        el.style.setProperty('--shmoobium-highlight-color', color);
      }
    });
  });
}

function processHighlights(root: ParentNode = document) {
  parseColorClasses(root);

  const selector = [...HIGHLIGHT_CLASSES.map(c => `.${c}`), '.shmoobium-highlight-container'].join(', ');
  root.querySelectorAll<HTMLElement>(selector).forEach(el => {
    if (!el.isConnected) return;
    if (el.closest('.shmoobium-highlight-container') && !el.classList.contains('shmoobium-highlight-container')) return;

    const variant = el.dataset.shmoobiumHlVariant || HIGHLIGHT_CLASSES.find(c => el.classList.contains(c));
    if (!variant) return;

    const color = el.dataset.shmoobiumHlColor || el.style.getPropertyValue('--shmoobium-highlight-color').trim();
    if (!color) return;

    const fullText = getFullText(el);
    if (!fullText) return;

    el.textContent = fullText;
    wrapLines(el, variant as (typeof HIGHLIGHT_CLASSES)[number], color);
  });
}

let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;

export function initHighlightFilter(): () => void {
  if (typeof document === 'undefined') return () => {};

  if (!document.getElementById('shmoobium-hl-brush') && document.body) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML =
      '<defs>' +
      '<filter id="shmoobium-hl-brush" x="-20%" y="-100%" width="140%" height="300%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.08 0.2" numOctaves="4" seed="12" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      '<filter id="shmoobium-hl-wobbly" x="-15%" y="-80%" width="130%" height="260%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.05 0.12" numOctaves="4" seed="5" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      '</defs>';
    document.body.prepend(svg);
  }

  processHighlights();

  resizeObserver = new ResizeObserver(() => processHighlights(document));
  resizeObserver.observe(document.body);

  mutationObserver = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1) processHighlights(node as Element);
      });
    });
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  return destroyHighlightFilter;
}

export function destroyHighlightFilter(): void {
  if (resizeObserver && document.body) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (mutationObserver && document.body) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
}
