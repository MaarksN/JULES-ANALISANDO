import React, { useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import * as Icons from 'lucide-react';

interface SmartEditorProps {
    content: string;
    onUpdate: (content: string) => void;
    isEditable?: boolean;
    suggestion?: string; // AI Autocomplete suggestion
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    return (
        <div className="flex gap-1 p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 items-center overflow-x-auto sticky top-0 z-10">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bold') ? 'is-active bg-slate-300 dark:bg-slate-600' : ''}`}
                title="Negrito"
            >
                <Icons.Bold className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('italic') ? 'is-active bg-slate-300 dark:bg-slate-600' : ''}`}
                title="Itálico"
            >
                <Icons.Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('heading', { level: 1 }) ? 'is-active bg-slate-300 dark:bg-slate-600' : ''}`}
            >
                <Icons.Heading1 className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('heading', { level: 2 }) ? 'is-active bg-slate-300 dark:bg-slate-600' : ''}`}
            >
                <Icons.Heading2 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('bulletList') ? 'is-active bg-slate-300 dark:bg-slate-600' : ''}`}
            >
                <Icons.List className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${editor.isActive('orderedList') ? 'is-active bg-slate-300 dark:bg-slate-600' : ''}`}
            >
                <Icons.ListOrdered className="w-4 h-4" />
            </button>
            <div className="flex-1"></div>
            <button
                onClick={() => editor.chain().focus().undo().run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                disabled={!editor.can().undo()}
            >
                <Icons.Undo className="w-4 h-4" />
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                disabled={!editor.can().redo()}
            >
                <Icons.Redo className="w-4 h-4" />
            </button>
        </div>
    );
};

const SmartEditor: React.FC<SmartEditorProps> = ({ content, onUpdate, isEditable = true, suggestion }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Typography,
            Placeholder.configure({
                placeholder: 'Comece a escrever sua petição...',
            }),
        ],
        content: content, // Initialize with Markdown (Tiptap handles HTML, we might need a converter if `content` is purely MD)
        editable: isEditable,
        onUpdate: ({ editor }) => {
            // For now, we return HTML. In a real advanced app, we'd sync JSON.
            // Converting HTML back to Markdown might be needed for the rest of the app compatibility
            // OR we just switch to HTML storage. Let's assume HTML storage for this module upgrade.
            onUpdate(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[500px] p-8',
            },
        },
    });

    // Sync content if it changes externally (e.g. AI generation)
    useEffect(() => {
        if (editor && content && editor.getHTML() !== content) {
             // Basic check to avoid cursor jumping loop.
             // Ideally we compare semantic content or use Yjs.
             // For this MVP, we only update if length differs significantly or it's empty
             if (Math.abs(editor.getText().length - content.length) > 10) {
                 editor.commands.setContent(content);
             }
        }
    }, [content, editor]);

    return (
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-full relative">
            {isEditable && <MenuBar editor={editor} />}
            <div className="flex-1 overflow-y-auto cursor-text bg-white dark:bg-slate-950" onClick={() => editor?.commands.focus()}>
                <EditorContent editor={editor} />
                {suggestion && (
                    <div className="absolute bottom-4 right-4 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-lg animate-fade-in-up max-w-sm pointer-events-none">
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center">
                            <Icons.Sparkles className="w-3 h-3 mr-1" /> Sugestão IA (Tab para aceitar)
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                            {suggestion}...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartEditor;
