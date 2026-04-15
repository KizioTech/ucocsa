import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { 
  Bold, Italic, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Code, Link as LinkIcon, 
  Image as ImageIcon, Table as TableIcon, Eye, Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MarkdownEditor = ({ value, onChange, placeholder }: MarkdownEditorProps) => {
  const [isPreview, setIsPreview] = useState(false);
  const [dialogOpen, setDialogOpen] = useState<"link" | "image" | "table" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Dialog states
  const [linkData, setLinkData] = useState({ text: "", url: "" });
  const [imageData, setImageData] = useState({ alt: "", url: "" });
  const [tableData, setTableData] = useState({ 
    rows: 3, 
    cols: 3, 
    data: Array(4).fill(null).map(() => Array(3).fill(""))
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleTableDimensionChange = (type: 'rows' | 'cols', value: number) => {
    const newVal = Math.max(1, Math.min(value, 15));
    setTableData(prev => {
      const newRows = type === 'rows' ? newVal : prev.rows;
      const newCols = type === 'cols' ? newVal : prev.cols;
      
      const newData = Array(newRows + 1).fill(null).map((_, rIdx) => 
        Array(newCols).fill("").map((_, cIdx) => 
          prev.data[rIdx]?.[cIdx] || ""
        )
      );
      return { rows: newRows, cols: newCols, data: newData };
    });
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const newData = [...tableData.data];
    newData[rIdx] = [...newData[rIdx]];
    newData[rIdx][cIdx] = val;
    setTableData(prev => ({ ...prev, data: newData }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `markdown/${fileName}`;

      const { data, error } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(data.path);

      setImageData(prev => ({ ...prev, url: publicUrl }));
      toast.success("Image uploaded!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const insertAtCursor = (textBefore: string, textAfter: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newValue = 
      value.substring(0, start) + 
      textBefore + 
      (selectedText || "") + 
      textAfter + 
      value.substring(end);

    onChange(newValue);
    setDialogOpen(null);
    setImageData({ alt: "", url: "" });
    setLinkData({ text: "", url: "" });
    
    // Set timeout to return focus to textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + textBefore.length + (selectedText?.length || 0) + textAfter.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const wrapText = (symbol: string) => {
    insertAtCursor(symbol, symbol);
  };

  const addTable = () => {
    let table = "\n";
    // Header
    table += "| " + tableData.data[0].map(c => c || "Header").join(" | ") + " |\n";
    // Separator
    table += "| " + Array(tableData.cols).fill("---").join(" | ") + " |\n";
    // Rows
    for (let i = 1; i <= tableData.rows; i++) {
      table += "| " + tableData.data[i].map(c => c || "Cell").join(" | ") + " |\n";
    }
    table += "\n";
    insertAtCursor(table);
  };

  return (
    <div className="flex flex-col w-full border border-border rounded-lg overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 border-b border-border">
        <Button variant="ghost" size="icon" type="button" onClick={() => wrapText("**")} title="Bold">
          <Bold size={16} />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => wrapText("*")} title="Italic">
          <Italic size={16} />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button variant="ghost" size="icon" type="button" onClick={() => insertAtCursor("# ")} title="H1">
          <Heading1 size={16} />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => insertAtCursor("## ")} title="H2">
          <Heading2 size={16} />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => insertAtCursor("### ")} title="H3">
          <Heading3 size={16} />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button variant="ghost" size="icon" type="button" onClick={() => insertAtCursor("- ")} title="Unordered List">
          <List size={16} />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => insertAtCursor("1. ")} title="Ordered List">
          <ListOrdered size={16} />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => insertAtCursor("> ")} title="Quote">
          <Quote size={16} />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => wrapText("`")} title="Code">
          <Code size={16} />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button variant="ghost" size="icon" type="button" onClick={() => setDialogOpen("link")} title="Link">
          <LinkIcon size={16} />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => setDialogOpen("image")} title="Image">
          <ImageIcon size={16} />
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={() => setDialogOpen("table")} title="Table">
          <TableIcon size={16} />
        </Button>
        <div className="flex-1" />
        <Button 
          variant={isPreview ? "secondary" : "ghost"} 
          size="sm" 
          type="button" 
          onClick={() => setIsPreview(!isPreview)}
          className="gap-2"
        >
          {isPreview ? <><Edit3 size={16} /> Edit</> : <><Eye size={16} /> Preview</>}
        </Button>
      </div>

      {/* Editor/Preview Area */}
      <div className="min-h-[400px]">
        {isPreview ? (
          <div className="p-6 prose prose-zinc dark:prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={{
                table: ({node, ...props}) => (
                  <div className="w-full overflow-x-auto pb-4 mb-4 border border-border/40 rounded-xl">
                    <table className="min-w-full m-0" {...props} />
                  </div>
                )
              }}
            >
              {value || "_Nothing to preview_"}
            </ReactMarkdown>
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[400px] p-4 border-0 focus-visible:ring-0 resize-none font-mono text-sm leading-relaxed"
          />
        )}
      </div>

      {/* Helper Dialogs */}
      <Dialog open={dialogOpen === "link"} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert Link</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Link Text</Label>
              <Input value={linkData.text} onChange={(e) => setLinkData({...linkData, text: e.target.value})} placeholder="e.g. Read more" />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={linkData.url} onChange={(e) => setLinkData({...linkData, url: e.target.value})} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(null)}>Cancel</Button>
            <Button onClick={() => insertAtCursor(`[${linkData.text || "link"}](${linkData.url || "https://"})`)}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen === "image"} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert Image</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div 
                onClick={() => imageInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : imageData.url ? (
                  <img src={imageData.url} alt="Preview" className="h-24 w-auto object-cover rounded shadow-sm" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload from your computer</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={imageInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or use URL</span></div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={imageData.url} onChange={(e) => setImageData({...imageData, url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Alt Text (Optional)</Label>
                <Input value={imageData.alt} onChange={(e) => setImageData({...imageData, alt: e.target.value})} placeholder="e.g. Illustration" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(null)}>Cancel</Button>
            <Button 
              disabled={!imageData.url || isUploading} 
              onClick={() => insertAtCursor(`![${imageData.alt || "image"}](${imageData.url})`)}
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen === "table"} onOpenChange={(open) => !open && setDialogOpen(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Insert Content Table</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Rows (excluding header)</Label>
              <Input type="number" min="1" max="15" value={tableData.rows} onChange={(e) => handleTableDimensionChange('rows', parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-2">
              <Label>Columns</Label>
              <Input type="number" min="1" max="10" value={tableData.cols} onChange={(e) => handleTableDimensionChange('cols', parseInt(e.target.value) || 1)} />
            </div>
          </div>
          
          <div className="space-y-0 overflow-x-auto border border-border rounded-lg bg-card">
             {tableData.data.map((row, rIdx) => (
                <div key={rIdx} className={`flex min-w-max divide-x divide-border border-b border-border last:border-b-0 ${rIdx === 0 ? 'bg-muted/50' : ''}`}>
                    {row.map((cell, cIdx) => (
                        <div key={cIdx} className="p-1 min-w-[120px] max-w-[200px] flex-1">
                            <Input 
                                value={cell} 
                                onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)} 
                                placeholder={rIdx === 0 ? `Header ${cIdx + 1}` : `Row ${rIdx} Cell ${cIdx + 1}`}
                                className={`border-none shadow-none h-9 hover:bg-muted/30 focus-visible:ring-1 focus-visible:bg-transparent ${rIdx === 0 ? 'font-bold uppercase tracking-wider text-xs' : 'text-sm'}`}
                            />
                        </div>
                    ))}
                </div>
             ))}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(null)}>Cancel</Button>
            <Button onClick={addTable}>Insert Data into Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarkdownEditor;
