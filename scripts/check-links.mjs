import { programs } from '../lib/programs.ts';
import { writeFile } from 'node:fs/promises';

// Connectivity is separate from editorial verification. A 200 or year match is not proof.
const queue = [...programs];
const results = [];
await Promise.all(Array.from({ length: 5 }, async () => {
  while (queue.length) {
    const p = queue.shift();
    try {
      const response = await fetch(p.sourceUrl, { signal: AbortSignal.timeout(20000) });
      const bytes = await response.arrayBuffer();
      let html = new TextDecoder().decode(bytes);
      if (/charset\s*=\s*["']?gb/i.test(html)) html = new TextDecoder('gb18030').decode(bytes);
      const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? '';
      const challenge = /captcha|验证码|环境异常/.test(response.url + html);
      const finalUrl = new URL(response.url); finalUrl.search = ''; finalUrl.hash = '';
      results.push({ id: p.id, school: p.school, sourceUrl: p.sourceUrl, finalUrl: finalUrl.href, httpStatus: response.status, title, contains2027: html.includes('2027'), result: challenge ? 'challenge_needs_manual_review' : response.ok ? 'reachable_needs_content_review' : 'http_error' });
    } catch (error) {
      results.push({ id: p.id, school: p.school, sourceUrl: p.sourceUrl, result: 'unreachable_in_this_environment', error: error.message });
    }
  }
}));
results.sort((a,b) => a.id.localeCompare(b.id));
await writeFile('docs/link-audit.json', JSON.stringify({ checkedAt: new Date().toISOString(), note: 'HTTP checks do not verify publisher, admission eligibility or dates; failures do not prove the notice is absent.', results }, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
