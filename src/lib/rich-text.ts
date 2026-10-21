/**
 * Content strings may mark recruiter keywords with **double asterisks**.
 * This is deliberately the only markup supported: it keeps the JSON readable
 * and makes it impossible for content to inject arbitrary HTML.
 */

const KEYWORD = /\*\*(.+?)\*\*/g;

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Safe HTML with keywords wrapped in <strong class="kw">. */
export const richTextToHtml = (text: string) =>
  escapeHtml(text).replace(KEYWORD, '<strong class="kw">$1</strong>');

/** Plain text for meta tags, JSON-LD and llms.txt. */
export const richTextToPlain = (text: string) => text.replace(KEYWORD, '$1');

/** Splits a description into paragraphs on blank lines. */
export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
