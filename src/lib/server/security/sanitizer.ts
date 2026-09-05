import xss, { type IFilterXSSOptions } from 'xss';

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

const xssHtmlOptions: IFilterXSSOptions = {
	whiteList: ALLOWED_TAGS.reduce(
		(acc, tag) => {
			acc[tag] = ALLOWED_ATTR;
			return acc;
		},
		{} as Record<string, string[]>
	),
	stripIgnoreTag: true,
	stripIgnoreTagBody: ['script', 'style']
};

const xssPlainOptions: IFilterXSSOptions = {
	whiteList: {},
	stripIgnoreTag: true,
	stripIgnoreTagBody: ['script', 'style']
};

export function sanitizeHtml(dirty: string): string {
	return xss(dirty, xssHtmlOptions);
}

export function sanitizePlain(text: string): string {
	return xss(text, xssPlainOptions);
}
