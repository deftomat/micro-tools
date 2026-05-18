import { XMLParser } from 'fast-xml-parser';

// todo: rename
export async function parse() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xml,application/xml,text/xml';

  const file = await new Promise<File | null>((resolve) => {
    input.addEventListener('change', () => resolve(input.files?.[0] ?? null), {
      once: true,
    });
    input.click();
  });

  if (!file) return '';

  const xml = await file.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    isArray: (name) => name === 'act:accountingItem',
  });

  const parsed = parser.parse(xml);

  const items = findAccountingItems(parsed);

  const slspMap = new Map();
  const otherMap = new Map();
  let total = 0;

  for (const item of items) {
    const credit = item['act:accounting']?.['act:credit'];
    const debit = item['act:accounting']?.['act:debit'];
    if (String(credit) !== '335100' && String(debit) !== '335100') continue;

    total++;
    const numberRequested = item['act:number']?.['typ:numberRequested'];

    const priceSum = Math.round(item['act:homeCurrency']?.['typ:priceSum'] * 100);

    // if(numberRequested === '26PK0008') console.log(priceSum);

    if (numberRequested === undefined || priceSum === undefined) continue;

    const key = String(numberRequested);

    if (key.startsWith('SLSP')) {
      slspMap.set(key, priceSum);
    } else {
      otherMap.set(key, (otherMap.get(key) ?? 0) + priceSum);
    }
  }

  const mismatches: Array<{
    readonly name: string;
    readonly value: number;
  }> = [];

  for (const [k, v] of slspMap) {
    const hasMatch = [...otherMap.values()].some((ov) => ov === v);

    if (hasMatch) continue;

    mismatches.push({ name: k, value: v / 100 });
  }

  return {
    totalCredit: otherMap.size,
    totalDebit: slspMap.size,
    mismatches,
  };
}

// Recursively find all act:accountingItem entries regardless of nesting depth
function findAccountingItems(obj) {
  if (!obj || typeof obj !== 'object') return [];
  if (Array.isArray(obj)) {
    return obj.flatMap((item) => findAccountingItems(item));
  }
  const results: any[] = [];
  for (const key of Object.keys(obj)) {
    if (key === 'act:accountingItem') {
      const items = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
      results.push(...items);
    } else {
      results.push(...findAccountingItems(obj[key]));
    }
  }
  return results;
}
