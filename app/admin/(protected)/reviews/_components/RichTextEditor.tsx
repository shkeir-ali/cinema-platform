'use client'

import { useEditor, EditorContent, useEditorState } from '@tiptap/react'
import type { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CharacterCount from '@tiptap/extension-character-count'
import { memo, useEffect, useState } from 'react'

type Props = {
  defaultValue: string
  onHtmlChange: (html: string) => void
}

function RichTextEditor({ defaultValue, onHtmlChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false }),
      CharacterCount,
    ],
    content: defaultValue || '',
    onUpdate({ editor }) {
      onHtmlChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: [
          'min-height: 280px',
          'padding: 0.75rem',
          'outline: none',
          'font-family: inherit',
          'font-size: 0.9rem',
          'line-height: 1.7',
          'color: var(--text)',
        ].join(';'),
      },
    },
  })

  // On mount: report the initial HTML (wraps plain text in <p> tags)
  useEffect(() => {
    if (editor) onHtmlChange(editor.getHTML())
  }, [editor]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {editor && <Toolbar editor={editor} />}

      <div style={{
        background: 'var(--bg)',
        border: '1px solid rgba(142,59,78,0.2)',
        borderRadius: editor ? '0 0 0 0' : '5px',
        borderBottom: 'none',
      }}>
        <EditorContent editor={editor} />
      </div>

      {editor && <Footer editor={editor} />}
    </div>
  )
}

export default memo(RichTextEditor)

// ── Toolbar ───────────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold:        e.isActive('bold'),
      italic:      e.isActive('italic'),
      underline:   e.isActive('underline'),
      h2:          e.isActive('heading', { level: 2 }),
      h3:          e.isActive('heading', { level: 3 }),
      blockquote:  e.isActive('blockquote'),
      bulletList:  e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      link:        e.isActive('link'),
      canUndo:     e.can().undo(),
      canRedo:     e.can().redo(),
    }),
  })

  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '0.25rem',
      padding: '0.5rem 0.6rem',
      background: 'var(--surface)',
      border: '1px solid rgba(142,59,78,0.2)',
      borderBottom: 'none',
      borderRadius: '5px 5px 0 0',
    }}>
      <ToolBtn active={state.bold} title="Bold"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}>
        <strong>B</strong>
      </ToolBtn>
      <ToolBtn active={state.italic} title="Italic"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}>
        <em>I</em>
      </ToolBtn>
      <ToolBtn active={state.underline} title="Underline"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}>
        <span style={{ textDecoration: 'underline' }}>U</span>
      </ToolBtn>

      <Divider />

      <ToolBtn active={state.h2} title="Heading 2"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}>
        H2
      </ToolBtn>
      <ToolBtn active={state.h3} title="Heading 3"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run() }}>
        H3
      </ToolBtn>

      <Divider />

      <ToolBtn active={state.blockquote} title="Blockquote"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run() }}>
        ❝
      </ToolBtn>

      <Divider />

      <ToolBtn active={state.bulletList} title="Bullet list"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}>
        • —
      </ToolBtn>
      <ToolBtn active={state.orderedList} title="Numbered list"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}>
        1. —
      </ToolBtn>

      <Divider />

      <ToolBtn active={state.link} title="Add / remove link"
        onMouseDown={(e) => {
          e.preventDefault()
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run()
          } else {
            const url = window.prompt('Enter URL:')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }
        }}>
        🔗
      </ToolBtn>
      <ToolBtn active={false} title="Insert image"
        onMouseDown={(e) => {
          e.preventDefault()
          const url = window.prompt('Enter image URL:')
          if (url) editor.chain().focus().setImage({ src: url }).run()
        }}>
        🖼
      </ToolBtn>

      <Divider />

      <ToolBtn active={false} title="Horizontal rule"
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setHorizontalRule().run() }}>
        —
      </ToolBtn>
      <ToolBtn active={false} title="Clear formatting"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }}>
        ✕
      </ToolBtn>

      <Divider />

      <ToolBtn active={false} title="Undo" disabled={!state.canUndo}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().undo().run() }}>
        ↩
      </ToolBtn>
      <ToolBtn active={false} title="Redo" disabled={!state.canRedo}
        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().redo().run() }}>
        ↪
      </ToolBtn>
    </div>
  )
}

// ── Footer — word/char count ──────────────────────────────────────────────────

function Footer({ editor }: { editor: Editor }) {
  const [counts, setCounts] = useState({ words: 0, chars: 0 })

  useEffect(() => {
    const update = () => setCounts({
      words: editor.storage.characterCount.words(),
      chars: editor.storage.characterCount.characters(),
    })
    update()
    editor.on('update', update)
    return () => { editor.off('update', update) }
  }, [editor])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      padding: '0.35rem 0.75rem',
      background: 'var(--surface)',
      border: '1px solid rgba(142,59,78,0.2)',
      borderTop: '1px solid rgba(142,59,78,0.1)',
      borderRadius: '0 0 5px 5px',
      fontSize: '0.72rem',
      color: 'var(--muted)',
      letterSpacing: '0.03em',
    }}>
      <span>{counts.words.toLocaleString()} words</span>
      <span>{counts.chars.toLocaleString()} characters</span>
    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

type ToolBtnProps = {
  children: React.ReactNode
  active: boolean
  onMouseDown: (e: React.MouseEvent) => void
  title: string
  disabled?: boolean
}

function ToolBtn({ children, active, onMouseDown, title, disabled }: ToolBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={onMouseDown}
      disabled={disabled}
      style={{
        padding: '0.2rem 0.5rem',
        minWidth: 30,
        border: 'none',
        borderRadius: 3,
        background: active ? 'var(--rose)' : 'transparent',
        color: active ? '#fff' : disabled ? 'var(--muted)' : 'var(--text)',
        fontSize: '0.82rem',
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit',
        lineHeight: 1.4,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <div style={{
      width: 1,
      alignSelf: 'stretch',
      background: 'rgba(142,59,78,0.15)',
      margin: '0.1rem 0.2rem',
    }} />
  )
}
