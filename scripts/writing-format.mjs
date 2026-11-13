export const escapeWriting = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e = escapeWriting;
const inline = value => e(value).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

// Source markdown is data, never executable HTML. Only this small block vocabulary is rendered.
export function writingMarkdown(markdown) {
  const lines = markdown.replace(/\[\[[^\]]*\]\]/g, '').trim().split('\n');
  const output = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim() || /^---$/.test(line)) { index++; continue; }
    if (/^#{1,4} /.test(line)) { output.push(`<h4>${inline(line.replace(/^#+ /, ''))}</h4>`); index++; continue; }
    if (line.startsWith('|')) {
      const rows = [];
      while (lines[index]?.startsWith('|')) rows.push(lines[index++].trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()));
      output.push(`<div class="writing-table"><table><thead><tr>${rows[0].map(cell => `<th scope="col">${inline(cell)}</th>`).join('')}</tr></thead><tbody>${rows.slice(2).map(row => `<tr>${row.map(cell => `<td>${inline(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^>/.test(line)) {
      const block = [];
      while (lines[index]?.startsWith('>')) block.push(lines[index++].replace(/^>\s?/, ''));
      output.push(`<blockquote>${block.map(inline).join('<br>')}</blockquote>`); continue;
    }
    if (/^(?:- |\d+\. )/.test(line)) {
      const ordered = /^\d/.test(line), items = [];
      while (/^(?:- |\d+\. )/.test(lines[index] || '')) items.push(`<li>${inline(lines[index++].replace(/^(?:- |\d+\. )/, ''))}</li>`);
      output.push(`<${ordered?'ol':'ul'}>${items.join('')}</${ordered?'ol':'ul'}>`); continue;
    }
    const paragraph = [line]; index++;
    while (lines[index]?.trim() && !/^(?:#|>|\||- |\d+\. )/.test(lines[index])) paragraph.push(lines[index++]);
    output.push(`<p>${inline(paragraph.join(' '))}</p>`);
  }
  return output.join('\n');
}
