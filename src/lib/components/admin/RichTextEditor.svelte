<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Placeholder from '@tiptap/extension-placeholder';
	import Icon from '$lib/components/public/Icon.svelte';
	import { Button } from '$lib/components/ui/button';

	let {
		value = $bindable(''),
		placeholder = 'Write content here...',
		class: className = ''
	}: {
		value?: string;
		placeholder?: string;
		class?: string;
	} = $props();

	let element: HTMLDivElement;
	let editor: Editor | null = $state(null);

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit,
				Link.configure({
					openOnClick: false
				}),
				Placeholder.configure({
					placeholder
				})
			],
			content: value,
			onUpdate: ({ editor: ed }) => {
				value = ed.getHTML();
			}
		});
	});

	$effect(() => {
		if (editor && value !== undefined && editor.getHTML() !== value) {
			editor.commands.setContent(value);
		}
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleHeading(level: 1 | 2 | 3) {
		editor?.chain().focus().toggleHeading({ level }).run();
	}

	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}

	function toggleBlockquote() {
		editor?.chain().focus().toggleBlockquote().run();
	}

	function toggleCodeBlock() {
		editor?.chain().focus().toggleCodeBlock().run();
	}

	function insertHardBreak() {
		editor?.chain().focus().setHardBreak().run();
	}
</script>

<div
	class="flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground {className}"
>
	<!-- Toolbar -->
	<div class="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2">
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={toggleBold}
			class="h-8 w-8 p-0 {editor?.isActive('bold')
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground'}"
		>
			<Icon name="Bold" size={16} />
		</Button>

		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={toggleItalic}
			class="h-8 w-8 p-0 {editor?.isActive('italic')
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground'}"
		>
			<Icon name="Italic" size={16} />
		</Button>

		<div class="mx-1 h-5 w-px bg-border"></div>

		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={() => toggleHeading(2)}
			class="h-8 px-2 text-xs font-bold {editor?.isActive('heading', { level: 2 })
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground'}"
		>
			H2
		</Button>

		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={() => toggleHeading(3)}
			class="h-8 px-2 text-xs font-bold {editor?.isActive('heading', { level: 3 })
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground'}"
		>
			H3
		</Button>

		<div class="mx-1 h-5 w-px bg-border"></div>

		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={toggleBulletList}
			class="h-8 w-8 p-0 {editor?.isActive('bulletList')
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground'}"
		>
			<Icon name="List" size={16} />
		</Button>

		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={toggleOrderedList}
			class="h-8 w-8 p-0 {editor?.isActive('orderedList')
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground'}"
		>
			<Icon name="ListOrdered" size={16} />
		</Button>

		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={toggleBlockquote}
			class="h-8 w-8 p-0 {editor?.isActive('blockquote')
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground'}"
		>
			<Icon name="Quote" size={16} />
		</Button>

		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={toggleCodeBlock}
			class="h-8 w-8 p-0 {editor?.isActive('codeBlock')
				? 'bg-accent text-accent-foreground'
				: 'text-muted-foreground'}"
		>
			<Icon name="Code" size={16} />
		</Button>

		<div class="mx-1 h-5 w-px bg-border"></div>

		<Button
			type="button"
			variant="ghost"
			size="sm"
			onclick={insertHardBreak}
			class="h-8 px-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground"
			title="Insert Line Break (<br>)"
		>
			<Icon name="WrapText" size={16} class="mr-1" />
			<span>Line Break</span>
		</Button>
	</div>

	<!-- Content Area -->
	<div
		bind:this={element}
		class="prose prose-neutral dark:prose-invert min-h-[200px] max-w-none p-4 font-sans focus:outline-none [&_.tiptap]:min-h-[160px] [&_.tiptap]:focus:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
	></div>
</div>
