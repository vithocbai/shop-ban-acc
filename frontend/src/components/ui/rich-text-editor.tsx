import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { 
    Bold, 
    Italic, 
    Underline as UnderlineIcon,
    Strikethrough,
    Quote, 
    Code,
    Unlink,
    List, 
    ListOrdered, 
    ListTodo,
    AlignLeft,
    AlignCenter,
    Link as LinkIcon,
    Image as ImageIcon,
    Video as YoutubeIcon,
    Table as TableIcon,
    MoreHorizontal
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            ImageExtension.configure({
                inline: true,
                allowBase64: true,
            }),
            Underline,
            LinkExtension.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Youtube.configure({
                inline: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 text-sm text-gray-700',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = window.prompt('Nhập URL ảnh:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('Nhập URL liên kết:', previousUrl)
        if (url === null) return
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    };

    const addYoutube = () => {
        const url = prompt('Nhập URL Youtube video:')
        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: Math.max(320, parseInt('640', 10)) || 640,
                height: Math.max(180, parseInt('480', 10)) || 480,
            })
        }
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    // Determine current block type for Select
    let blockType = 'paragraph';
    if (editor.isActive('heading', { level: 1 })) blockType = 'heading1';
    else if (editor.isActive('heading', { level: 2 })) blockType = 'heading2';
    else if (editor.isActive('heading', { level: 3 })) blockType = 'heading3';

    return (
        <div className="border border-gray-200 rounded-md bg-white overflow-hidden flex flex-col shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 p-2 bg-white text-gray-600">
                
                {/* Đoạn (Paragraph/Heading Select) */}
                <div className="mr-2">
                    <Select 
                        value={blockType} 
                        onValueChange={(val) => {
                            if (val === 'paragraph') editor.chain().focus().setParagraph().run();
                            else if (val === 'heading1') editor.chain().focus().toggleHeading({ level: 1 }).run();
                            else if (val === 'heading2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                            else if (val === 'heading3') editor.chain().focus().toggleHeading({ level: 3 }).run();
                        }}
                    >
                        <SelectTrigger className="w-[110px] h-8 bg-transparent border-gray-200 text-sm font-semibold rounded-md shadow-none focus:ring-0">
                            <SelectValue placeholder="Đoạn" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="paragraph">Đoạn</SelectItem>
                            <SelectItem value="heading1">Tiêu đề 1</SelectItem>
                            <SelectItem value="heading2">Tiêu đề 2</SelectItem>
                            <SelectItem value="heading3">Tiêu đề 3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Text Formatting */}
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <Bold className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <Italic className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <UnderlineIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <Strikethrough className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>

                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <Quote className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('code') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <Code className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    disabled={!editor.isActive('link')}
                    className="h-8 w-8 p-0 hover:bg-gray-100 opacity-70 hover:opacity-100"
                >
                    <Unlink className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Lists */}
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <List className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <ListOrdered className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('taskList') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <ListTodo className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Alignment */}
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <AlignLeft className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <AlignCenter className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Insertions */}
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={addLink}
                    className={`h-8 w-8 p-0 hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-100 text-gray-900' : ''}`}
                >
                    <LinkIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={addImage}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                    <ImageIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={addYoutube}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                    <YoutubeIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost" size="sm" type="button"
                    onClick={addTable}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                    <TableIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* More / Undo Redo placeholders if needed */}
                <Button
                    variant="ghost" size="sm" type="button"
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                    <MoreHorizontal className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
            </div>
            
            {/* Editor Area */}
            <div className="flex-1 bg-white cursor-text" onClick={() => editor.chain().focus().run()}>
                <EditorContent 
                    editor={editor} 
                    placeholder={placeholder}
                />
                {!editor.getText() && placeholder && (
                    <div className="absolute top-[60px] left-4 text-gray-400 pointer-events-none text-sm">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    );
}
