import sanitize from 'sanitize-html';

const ALLOWED_TAGS = [
	'p',
	'br',
	'strong',
	'em',
	'u',
	's',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'ul',
	'ol',
	'li',
	'a',
	'img',
	'blockquote',
	'code',
	'pre',
	'hr',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td',
	'span',
	'div'
];

const ALLOWED_ATTR = ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'];

export function sanitizeHtml(dirty: string): string {
	return sanitize(dirty, {
		allowedTags: ALLOWED_TAGS,
		allowedAttributes: {
			'*': ALLOWED_ATTR
		}
	});
}

export function sanitizePlain(text: string): string {
	return sanitize(text, {
		allowedTags: [],
		allowedAttributes: {}
	});
}
