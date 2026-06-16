import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import React, { useRef, useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './button';

const ResizableImageNode = (props: any) => {
    const { node, updateAttributes, selected, editor, getPos } = props;
    const { src, alt, title, width, height } = node.attrs;
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [size, setSize] = useState({ 
        width: width || 'auto', 
        height: height || 'auto' 
    });
    const [isResizing, setIsResizing] = useState(false);

    // Sync state with props when attrs change from outside
    useEffect(() => {
        if (!isResizing) {
            setSize({ width: node.attrs.width || 'auto', height: node.attrs.height || 'auto' });
        }
    }, [node.attrs.width, node.attrs.height, isResizing]);

    const handleMouseDown = (e: React.MouseEvent, direction: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = imgRef.current?.offsetWidth || 0;
        const startHeight = imgRef.current?.offsetHeight || 0;

        const onMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault();
            let newWidth = startWidth;
            let newHeight = startHeight;
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (direction.includes('right')) newWidth = startWidth + deltaX;
            if (direction.includes('left')) newWidth = startWidth - deltaX;
            if (direction.includes('bottom')) newHeight = startHeight + deltaY;
            if (direction.includes('top')) newHeight = startHeight - deltaY;

            // Prevent becoming too small
            newWidth = Math.max(newWidth, 50);
            newHeight = Math.max(newHeight, 50);

            setSize({ width: `${newWidth}px`, height: `${newHeight}px` });
        };

        const onMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            // Save attributes to Tiptap
            if (imgRef.current) {
                updateAttributes({ 
                    width: imgRef.current.style.width, 
                    height: imgRef.current.style.height 
                });
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const insertBlock = (position: 'above' | 'below', e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getPos();
        if (typeof pos !== 'number') return;
        
        if (position === 'above') {
            editor.chain().focus().insertContentAt(pos, '<p></p>').run();
        } else {
            editor.chain().focus().insertContentAt(pos + node.nodeSize, '<p></p>').run();
        }
    };

    const textAlign = node.attrs.textAlign || 'left';
    const alignmentClass = textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start';

    return (
        <NodeViewWrapper className={`relative flex w-full my-1 ${alignmentClass}`}>
            <div className="relative inline-flex flex-col items-center max-w-full">
                {selected && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-200">
                    <Button size="sm" variant="secondary" className="h-8 rounded-full text-xs font-semibold shadow-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700" onClick={(e) => insertBlock('above', e)}>
                        <Plus className="w-4 h-4 mr-1 text-primary" /> Chèn dòng trên
                    </Button>
                </div>
            )}
            
            <div 
                ref={containerRef} 
                className={`relative max-w-full inline-block ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
                <img 
                    ref={imgRef}
                    src={src} 
                    alt={alt} 
                    title={title}
                    className="max-w-full rounded-md block m-0" 
                    style={{ width: size.width, height: size.height, minWidth: '50px', minHeight: '50px' }}
                />
                
                {selected && (
                    <>
                        {/* Handles for non-proportional resizing */}
                        <div className="absolute top-0 left-0 w-3 h-3 bg-white border-2 border-primary cursor-nwse-resize -translate-x-1.5 -translate-y-1.5 z-10 rounded-sm" onMouseDown={(e) => handleMouseDown(e, 'top-left')} />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-white border-2 border-primary cursor-nesw-resize translate-x-1.5 -translate-y-1.5 z-10 rounded-sm" onMouseDown={(e) => handleMouseDown(e, 'top-right')} />
                        <div className="absolute bottom-0 left-0 w-3 h-3 bg-white border-2 border-primary cursor-nesw-resize -translate-x-1.5 translate-y-1.5 z-10 rounded-sm" onMouseDown={(e) => handleMouseDown(e, 'bottom-left')} />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-white border-2 border-primary cursor-nwse-resize translate-x-1.5 translate-y-1.5 z-10 rounded-sm" onMouseDown={(e) => handleMouseDown(e, 'bottom-right')} />
                        
                        <div className="absolute top-0 left-1/2 w-3 h-3 bg-white border-2 border-primary cursor-ns-resize -translate-x-1.5 -translate-y-1.5 z-10 rounded-sm" onMouseDown={(e) => handleMouseDown(e, 'top')} />
                        <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white border-2 border-primary cursor-ns-resize -translate-x-1.5 translate-y-1.5 z-10 rounded-sm" onMouseDown={(e) => handleMouseDown(e, 'bottom')} />
                        <div className="absolute left-0 top-1/2 w-3 h-3 bg-white border-2 border-primary cursor-ew-resize -translate-x-1.5 -translate-y-1.5 z-10 rounded-sm" onMouseDown={(e) => handleMouseDown(e, 'left')} />
                        <div className="absolute right-0 top-1/2 w-3 h-3 bg-white border-2 border-primary cursor-ew-resize translate-x-1.5 -translate-y-1.5 z-10 rounded-sm" onMouseDown={(e) => handleMouseDown(e, 'right')} />
                    </>
                )}
            </div>

            {selected && (
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-200">
                    <Button size="sm" variant="secondary" className="h-8 rounded-full text-xs font-semibold shadow-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700" onClick={(e) => insertBlock('below', e)}>
                        <Plus className="w-4 h-4 mr-1 text-primary" /> Chèn dòng dưới
                    </Button>
                </div>
            )}
            </div>
        </NodeViewWrapper>
    );
};

export const CustomResizableImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: 'auto',
                renderHTML: attributes => {
                    return { width: attributes.width };
                }
            },
            height: {
                default: 'auto',
                renderHTML: attributes => {
                    return { height: attributes.height };
                }
            }
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageNode);
    }
});
