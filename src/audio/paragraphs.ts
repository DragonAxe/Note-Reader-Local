import type { SpeechChunk } from "./types";

/**
 * Where paragraphs begin, worked out from the chunks alone.
 *
 * Chunks are sentences, and none of them records which paragraph it came from,
 * so a paragraph is recognised by its edges: a chunk starts one when it is the
 * first, when the kind of block changes (a heading, then prose), or when more
 * than a single separator character lies between it and the previous chunk in
 * the note - a blank line, or a list or quote marker. Sentences inside a
 * paragraph are separated by a space or one line break.
 */
export function startsParagraph(chunks: readonly SpeechChunk[], index: number): boolean {
	if (index <= 0) return true;
	const chunk = chunks[index];
	const before = chunks[index - 1];
	if (!chunk || !before) return true;
	return chunk.blockType !== before.blockType || chunk.sourceStart - before.sourceEnd >= 2;
}

/** The first paragraph start after `from`, or null when `from` is in the last paragraph. */
export function nextParagraphStart(chunks: readonly SpeechChunk[], from: number): number | null {
	for (let i = Math.max(0, from + 1); i < chunks.length; i += 1) {
		if (startsParagraph(chunks, i)) return i;
	}
	return null;
}

/**
 * The start of the paragraph `from` is in, or, when already at that start, of
 * the one before it. Null when there is nowhere earlier to go.
 *
 * With `restartCurrent` false the current paragraph's start is not an answer:
 * the result is always the paragraph before. That is for a second press in
 * quick succession, when reading has already moved a sentence or two into the
 * paragraph the first press landed on.
 */
export function previousParagraphStart(
	chunks: readonly SpeechChunk[],
	from: number,
	restartCurrent = true,
): number | null {
	let i = Math.min(from, chunks.length - 1);
	if (i < 0) return null;
	while (i > 0 && !startsParagraph(chunks, i)) i -= 1;
	if (restartCurrent && i !== from) return i;
	for (i -= 1; i >= 0; i -= 1) {
		if (startsParagraph(chunks, i)) return i;
	}
	return null;
}
