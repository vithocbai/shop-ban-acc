import React, { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CustomResizableImage } from "./resizable-image";
import Underline from "@tiptap/extension-underline";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Youtube from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
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
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Image as ImageIcon,
    Video as YoutubeIcon,
    Table as TableIcon,
    Trash2,
    ArrowUpToLine,
    ArrowDownToLine,
    ArrowLeftToLine,
    ArrowRightToLine,
    Combine,
    SplitSquareHorizontal,
    Loader2,
} from "lucide-react";
import api from "@/services/api";
import { toast } from "react-toastify";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            FontFamily,
            CustomResizableImage.configure({
                inline: false,
                allowBase64: true,
            }),
            Underline,
            LinkExtension.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ["heading", "paragraph", "image"],
                alignments: ["left", "center", "right", "justify"],
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
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 text-sm text-gray-700 w-full max-w-none",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await api.post("/upload/", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const url = res.data?.url;
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
        } catch (error) {
            toast.error("Lỗi upload ảnh. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const addLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Nhập URL liên kết:", previousUrl);
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const addYoutube = () => {
        const url = prompt("Nhập URL Youtube video:");
        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
                width: Math.max(320, parseInt("640", 10)) || 640,
                height: Math.max(180, parseInt("480", 10)) || 480,
            });
        }
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    // Determine current block type for Select
    let blockType = "paragraph";
    if (editor.isActive("heading", { level: 1 })) blockType = "heading1";
    else if (editor.isActive("heading", { level: 2 })) blockType = "heading2";
    else if (editor.isActive("heading", { level: 3 })) blockType = "heading3";

    return (
        <div className="border border-border-color rounded-md bg-white overflow-hidden flex flex-col shadow-sm">
            {/* Main Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 p-2 bg-gray-50 text-gray-600">
                <Select
                    value={editor.getAttributes("textStyle").fontFamily || "Arial"}
                    onValueChange={(font) => {
                        editor.chain().focus().setFontFamily(font).run();
                    }}
                >
                    <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Verdana">Verdana</SelectItem>
                        <SelectItem value="Tahoma">Tahoma</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                    </SelectContent>
                </Select>

                {/* Đoạn (Paragraph/Heading Select) */}
                <div className="mr-2">
                    <Select
                        value={blockType}
                        onValueChange={(val) => {
                            if (val === "paragraph") editor.chain().focus().setParagraph().run();
                            else if (val === "heading1") editor.chain().focus().toggleHeading({ level: 1 }).run();
                            else if (val === "heading2") editor.chain().focus().toggleHeading({ level: 2 }).run();
                            else if (val === "heading3") editor.chain().focus().toggleHeading({ level: 3 }).run();
                        }}
                    >
                        <SelectTrigger className="w-[120px] h-8 bg-white border-gray-200 text-sm font-semibold rounded-md focus:ring-1 focus:ring-primary/20 transition-all">
                            <SelectValue placeholder="Đoạn" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="paragraph">Văn bản</SelectItem>
                            <SelectItem value="heading1">Tiêu đề 1</SelectItem>
                            <SelectItem value="heading2">Tiêu đề 2</SelectItem>
                            <SelectItem value="heading3">Tiêu đề 3</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                {/* Text Formatting */}
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="In đậm"
                >
                    <Bold className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="In nghiêng"
                >
                    <Italic className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("underline") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Gạch chân"
                >
                    <UnderlineIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("strike") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Gạch ngang"
                >
                    <Strikethrough className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("blockquote") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Trích dẫn"
                >
                    <Quote className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("code") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Mã (Code)"
                >
                    <Code className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                {/* Alignment */}
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive({ textAlign: "left" }) ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Căn trái"
                >
                    <AlignLeft className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive({ textAlign: "center" }) ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Căn giữa"
                >
                    <AlignCenter className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive({ textAlign: "right" }) ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Căn phải"
                >
                    <AlignRight className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive({ textAlign: "justify" }) ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Căn đều"
                >
                    <AlignJustify className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                {/* Lists */}
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Danh sách dấu chấm"
                >
                    <List className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Danh sách số"
                >
                    <ListOrdered className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>

                <div className="w-px h-5 bg-gray-300 mx-1" />

                {/* Insertions */}
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={addLink}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("link") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Chèn liên kết"
                >
                    <LinkIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    disabled={!editor.isActive("link")}
                    className="h-8 w-8 p-0 hover:bg-gray-200 opacity-70 hover:opacity-100 disabled:opacity-30"
                    title="Bỏ liên kết"
                >
                    <Unlink className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 w-8 p-0 hover:bg-gray-200"
                        title="Tải ảnh lên"
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <ImageIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                        )}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={addYoutube}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                    title="Chèn video Youtube"
                >
                    <YoutubeIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={addTable}
                    className={`h-8 w-8 p-0 hover:bg-gray-200 ${editor.isActive("table") ? "bg-gray-200 text-gray-900 shadow-inner" : ""}`}
                    title="Chèn bảng"
                >
                    <TableIcon className="h-[18px] w-[18px] stroke-[2.5]" />
                </Button>
            </div>

            {/* Table Secondary Toolbar (only visible when table is active) */}
            {editor.isActive("table") && (
                <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 p-1.5 bg-blue-50/50 text-blue-800 animate-in fade-in slide-in-from-top-1">
                    <span className="text-xs font-semibold px-2 uppercase tracking-wide opacity-70">Bảng</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-7 w-7 p-0 hover:bg-blue-100/50"
                        title="Thêm dòng trên"
                        onClick={() => editor.chain().focus().addRowBefore().run()}
                    >
                        <ArrowUpToLine className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-7 w-7 p-0 hover:bg-blue-100/50"
                        title="Thêm dòng dưới"
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                    >
                        <ArrowDownToLine className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-7 w-7 p-0 hover:bg-red-100/50 text-red-600 hover:text-red-700"
                        title="Xóa dòng"
                        onClick={() => editor.chain().focus().deleteRow().run()}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-4 bg-blue-200/50 mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-7 w-7 p-0 hover:bg-blue-100/50"
                        title="Thêm cột bên trái"
                        onClick={() => editor.chain().focus().addColumnBefore().run()}
                    >
                        <ArrowLeftToLine className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-7 w-7 p-0 hover:bg-blue-100/50"
                        title="Thêm cột bên phải"
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                    >
                        <ArrowRightToLine className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-7 w-7 p-0 hover:bg-red-100/50 text-red-600 hover:text-red-700"
                        title="Xóa cột"
                        onClick={() => editor.chain().focus().deleteColumn().run()}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-4 bg-blue-200/50 mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-7 w-7 p-0 hover:bg-blue-100/50"
                        title="Gộp ô"
                        onClick={() => editor.chain().focus().mergeCells().run()}
                    >
                        <Combine className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-7 w-7 p-0 hover:bg-blue-100/50"
                        title="Tách ô"
                        onClick={() => editor.chain().focus().splitCell().run()}
                    >
                        <SplitSquareHorizontal className="h-4 w-4" />
                    </Button>

                    <div className="w-px h-4 bg-blue-200/50 mx-1" />

                    <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="h-7 px-2 hover:bg-red-100/50 text-red-600 hover:text-red-700 text-xs font-semibold gap-1"
                        title="Xóa toàn bộ bảng"
                        onClick={() => editor.chain().focus().deleteTable().run()}
                    >
                        <Trash2 className="h-3 w-3" />
                        Xóa bảng
                    </Button>
                </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 bg-white cursor-text" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} placeholder={placeholder} />
                {!editor.getText() && placeholder && (
                    <div className="absolute top-[60px] left-4 text-gray-400 pointer-events-none text-sm">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    );
}
