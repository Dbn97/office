import { useState, useRef, useCallback } from 'react';

interface Props {
  onBack: () => void;
}

export default function WordEditor({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState('home');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [fontSize, setFontSize] = useState('11');
  const [fontName, setFontName] = useState('Calibri');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontColor, setFontColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [align, setAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const tabs = ['home', 'insert', 'design', 'layout', 'references', 'mailings', 'review', 'view'];

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const handleBold = () => { setIsBold(!isBold); execCommand('bold'); };
  const handleItalic = () => { setIsItalic(!isItalic); execCommand('italic'); };
  const handleUnderline = () => { setIsUnderline(!isUnderline); execCommand('underline'); };
  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    setAlign(alignment);
    execCommand(`justify${alignment.charAt(0).toUpperCase() + alignment.slice(1)}`);
  };

  const colors = [
    '#000000', '#44546a', '#4472c4', '#ed7d31', '#a5a5a5', '#ffc000', '#5b9bd5', '#70ad47',
    '#ffffff', '#e7e6e6', '#d9e2f3', '#fce4d6', '#ededed', '#fff2cc', '#deeaf6', '#e2efd9',
    '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0',
    '#7030a0', '#ff00ff', '#bf8f00', '#808000', '#008000', '#008080', '#0000ff', '#800080',
  ];

  const renderRibbon = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            {/* Clipboard Group */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 mb-1">
                <button className="ribbon-btn" onClick={() => execCommand('paste')}>
                  <span className="text-xl">📋</span>
                  <span>Paste</span>
                </button>
              </div>
              <div className="flex gap-1">
                <button className="ribbon-btn-small" onClick={() => execCommand('cut')}>✂️ Cut</button>
                <button className="ribbon-btn-small" onClick={() => execCommand('copy')}>📄 Copy</button>
                <button className="ribbon-btn-small">🖌️ Format</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Clipboard</span>
            </div>

            {/* Font Group */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 mb-1 items-center">
                <select
                  value={fontName}
                  onChange={(e) => setFontName(e.target.value)}
                  className="h-6 text-xs border border-gray-300 rounded px-1 w-28"
                >
                  <option>Calibri</option>
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                  <option>Verdana</option>
                  <option>Georgia</option>
                  <option>Tahoma</option>
                  <option>Comic Sans MS</option>
                  <option>Impact</option>
                  <option>Trebuchet MS</option>
                </select>
                <select
                  value={fontSize}
                  onChange={(e) => { setFontSize(e.target.value); execCommand('fontSize', e.target.value); }}
                  className="h-6 text-xs border border-gray-300 rounded px-1 w-12"
                >
                  {['8','9','10','11','12','14','16','18','20','24','28','32','36','48','72'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button className="w-5 h-6 flex items-center justify-center border border-gray-300 text-xs" onClick={() => execCommand('decreaseFontSize')}>A-</button>
                <button className="w-5 h-6 flex items-center justify-center border border-gray-300 text-xs font-bold" onClick={() => execCommand('increaseFontSize')}>A+</button>
              </div>
              <div className="flex gap-0.5">
                <button className={`ribbon-btn-small ${isBold ? 'bg-blue-100 border-blue-300' : ''}`} onClick={handleBold}>
                  <span className="font-bold">B</span>
                </button>
                <button className={`ribbon-btn-small ${isItalic ? 'bg-blue-100 border-blue-300' : ''}`} onClick={handleItalic}>
                  <span className="italic">I</span>
                </button>
                <button className={`ribbon-btn-small ${isUnderline ? 'bg-blue-100 border-blue-300' : ''}`} onClick={handleUnderline}>
                  <span className="underline">U</span>
                </button>
                <button className="ribbon-btn-small" onClick={() => execCommand('strikeThrough')}>
                  <span className="line-through">ab</span>
                </button>
                <button className="ribbon-btn-small" onClick={() => execCommand('subscript')}>
                  <span>x₂</span>
                </button>
                <button className="ribbon-btn-small" onClick={() => execCommand('superscript')}>
                  <span>x²</span>
                </button>
                <div className="relative">
                  <button className="ribbon-btn-small" onClick={() => setShowColorPicker(showColorPicker === 'font' ? null : 'font')}>
                    <span style={{ borderBottom: `3px solid ${fontColor}` }}>A</span>
                    <span className="text-[8px]">▼</span>
                  </button>
                  {showColorPicker === 'font' && (
                    <div className="absolute top-full left-0 bg-white border border-gray-300 shadow-lg z-50 p-2">
                      <div className="color-grid">
                        {colors.map(c => (
                          <div key={c} className="color-swatch" style={{ backgroundColor: c }} onClick={() => { setFontColor(c); execCommand('foreColor', c); setShowColorPicker(null); }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button className="ribbon-btn-small" onClick={() => setShowColorPicker(showColorPicker === 'highlight' ? null : 'highlight')}>
                    <span style={{ backgroundColor: highlightColor }}>🖍</span>
                    <span className="text-[8px]">▼</span>
                  </button>
                  {showColorPicker === 'highlight' && (
                    <div className="absolute top-full left-0 bg-white border border-gray-300 shadow-lg z-50 p-2">
                      <div className="color-grid">
                        {colors.map(c => (
                          <div key={c} className="color-swatch" style={{ backgroundColor: c }} onClick={() => { setHighlightColor(c); execCommand('hiliteColor', c); setShowColorPicker(null); }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Font</span>
            </div>

            {/* Paragraph Group */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-0.5 mb-1">
                <button className="ribbon-btn-small" onClick={() => execCommand('insertUnorderedList')}>• ≡</button>
                <button className="ribbon-btn-small" onClick={() => execCommand('insertOrderedList')}>1. ≡</button>
                <button className="ribbon-btn-small" onClick={() => handleAlign('left')}>≡←</button>
                <button className="ribbon-btn-small" onClick={() => handleAlign('center')}>≡↔</button>
                <button className="ribbon-btn-small" onClick={() => handleAlign('right')}>≡→</button>
                <button className="ribbon-btn-small" onClick={() => handleAlign('justify')}>☰</button>
              </div>
              <div className="flex gap-0.5">
                <button className="ribbon-btn-small" onClick={() => execCommand('outdent')}>⇤</button>
                <button className="ribbon-btn-small" onClick={() => execCommand('indent')}>⇥</button>
                <button className="ribbon-btn-small" title="Line Spacing">↕</button>
                <button className="ribbon-btn-small" title="Sort">🔤</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Paragraph</span>
            </div>

            {/* Styles Group */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 mb-1">
                <button className="px-3 py-1 border border-gray-300 text-xs font-semibold hover:bg-blue-50" style={{ fontFamily: 'Calibri', fontSize: '16px' }} onClick={() => execCommand('formatBlock', 'h1')}>Heading 1</button>
                <button className="px-3 py-1 border border-gray-300 text-xs hover:bg-blue-50" style={{ fontFamily: 'Calibri', fontSize: '13px', color: '#2b579a' }} onClick={() => execCommand('formatBlock', 'h2')}>Heading 2</button>
                <button className="px-3 py-1 border border-gray-300 text-xs hover:bg-blue-50" onClick={() => execCommand('formatBlock', 'p')}>Normal</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Styles</span>
            </div>

            {/* Editing Group */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small" onClick={() => execCommand('undo')}>↩ Undo</button>
                <button className="ribbon-btn-small" onClick={() => execCommand('redo')}>↪ Redo</button>
                <button className="ribbon-btn-small" onClick={() => execCommand('find')}>🔍 Find</button>
                <button className="ribbon-btn-small" onClick={() => execCommand('selectAll')}>☐ Select</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Editing</span>
            </div>
          </div>
        );

      case 'insert':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <button className="ribbon-btn-large" onClick={() => execCommand('insertTable', '3,3')}>
                <span className="icon">📊</span>
                <span>Table</span>
              </button>
              <span className="text-[10px] text-gray-500 mt-1">Tables</span>
            </div>
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 mb-1">
                <button className="ribbon-btn-large" onClick={() => { const input = document.createElement('input'); input.type='file'; input.accept='image/*'; input.click(); }}>
                  <span className="icon">🖼️</span>
                  <span>Picture</span>
                </button>
                <button className="ribbon-btn-large">
                  <span className="icon">📐</span>
                  <span>Shapes</span>
                </button>
              </div>
              <div className="flex gap-1">
                <button className="ribbon-btn-small">📈 Chart</button>
                <button className="ribbon-btn-small">🔗 Link</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Illustrations</span>
            </div>
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 mb-1">
                <button className="ribbon-btn-small">📄 Header</button>
                <button className="ribbon-btn-small">📄 Footer</button>
                <button className="ribbon-btn-small" onClick={() => execCommand('insertHorizontalRule')}>─ Line</button>
              </div>
              <div className="flex gap-1">
                <button className="ribbon-btn-small" onClick={() => execCommand('insertHTML', '<br><div style="page-break-before:always"></div>')}>📃 Page Break</button>
                <button className="ribbon-btn-small">🔢 Page Number</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Header & Footer</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small" onClick={() => execCommand('insertHTML', '<div contenteditable="true" style="border:1px dashed #ccc;padding:10px;margin:5px 0;">Text Box</div>')}>📝 Text Box</button>
                <button className="ribbon-btn-small" onClick={() => execCommand('insertHTML', '<blockquote style="border-left:3px solid #2b579a;padding-left:10px;color:#555;margin:10px 0;">Quote</blockquote>')}>❝ WordArt</button>
                <button className="ribbon-btn-small">📅 Date</button>
                <button className="ribbon-btn-small">🔣 Symbol</button>
                <button className="ribbon-btn-small" onClick={() => execCommand('insertHTML', '<div style="background:#f0f0f0;padding:8px;border-radius:4px;margin:5px 0;font-family:monospace;">Equation</div>')}>∑ Equation</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Text</span>
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 mb-1">
                <button className="ribbon-btn-large" onClick={() => execCommand('formatBlock', 'p')}>
                  <span className="icon">📄</span>
                  <span>Normal</span>
                </button>
                <button className="ribbon-btn-large">
                  <span className="icon">📰</span>
                  <span>Newsletter</span>
                </button>
                <button className="ribbon-btn-large">
                  <span className="icon">📋</span>
                  <span>Formal</span>
                </button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Document Formatting</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small">🎨 Page Color</button>
                <button className="ribbon-btn-small">🖼️ Page Borders</button>
                <button className="ribbon-btn-small">📏 Watermark</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Page Background</span>
            </div>
          </div>
        );

      case 'layout':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1">
                <button className="ribbon-btn-small">📐 Margins</button>
                <button className="ribbon-btn-small">↕ Orientation</button>
                <button className="ribbon-btn-small">📏 Size</button>
                <button className="ribbon-btn-small">📄 Columns</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Page Setup</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex gap-1">
                <button className="ribbon-btn-small">⇤ Indent Left</button>
                <button className="ribbon-btn-small">⇥ Indent Right</button>
                <button className="ribbon-btn-small">↕ Spacing</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Paragraph</span>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small">🔤 Spelling</button>
                <button className="ribbon-btn-small">📖 Thesaurus</button>
                <button className="ribbon-btn-small">🌐 Translate</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Proofing</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small">💬 New Comment</button>
                <button className="ribbon-btn-small">🔀 Track Changes</button>
                <button className="ribbon-btn-small">✅ Accept</button>
                <button className="ribbon-btn-small">❌ Reject</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Comments</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Tab "{activeTab}" - Coming soon
          </div>
        );
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#f3f3f3]">
      {/* Title Bar */}
      <div className="h-8 bg-[#2b579a] flex items-center px-3 text-white text-xs shrink-0">
        <button onClick={onBack} className="mr-2 hover:bg-white/20 px-2 py-0.5 rounded">← </button>
        <div className="flex items-center gap-2">
          <span className="text-sm">📝</span>
          <span className="font-medium">Document1 - Word</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center bg-white/10 rounded px-3 py-0.5">
            <span className="text-[11px]">📁 Document1 - Saved</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="w-10 h-8 hover:bg-white/10 flex items-center justify-center text-sm">─</button>
          <button className="w-10 h-8 hover:bg-white/10 flex items-center justify-center text-sm">□</button>
          <button className="w-10 h-8 hover:bg-red-600 flex items-center justify-center text-sm">✕</button>
        </div>
      </div>

      {/* Quick Access Toolbar */}
      <div className="h-6 bg-[#2b579a] flex items-center px-2 gap-1 border-b border-[#1a3a6b] shrink-0">
        <button className="text-white/80 hover:text-white text-xs px-1" onClick={() => execCommand('undo')}>↩</button>
        <button className="text-white/80 hover:text-white text-xs px-1" onClick={() => execCommand('redo')}>↪</button>
        <button className="text-white/80 hover:text-white text-xs px-1">💾</button>
      </div>

      {/* Ribbon Tabs */}
      <div className="h-7 bg-[#f3f3f3] flex items-end px-2 border-b border-[#d4d4d4] shrink-0">
        <button
          className={`ribbon-tab ${showFileMenu ? 'bg-[#2b579a] text-white' : ''}`}
          onClick={() => setShowFileMenu(!showFileMenu)}
          style={showFileMenu ? {} : {}}
        >
          File
        </button>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`ribbon-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setShowFileMenu(false); }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Ribbon Content */}
      <div className="h-[95px] bg-[#f3f3f3] border-b border-[#d4d4d4] overflow-hidden shrink-0">
        {renderRibbon()}
      </div>

      {/* Ruler */}
      <div className="h-5 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
        <div className="flex-1 flex items-center">
          {Array.from({ length: 60 }, (_, i) => (
            <div key={i} className="flex-shrink-0 flex items-end" style={{ width: '14px' }}>
              <div className={`w-px ${i % 5 === 0 ? 'h-3 bg-gray-400' : 'h-1.5 bg-gray-300'}`}></div>
              {i % 5 === 0 && <span className="text-[8px] text-gray-400 ml-0.5">{i / 5}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-auto bg-[#e8e8e8] p-4">
        <div
          ref={editorRef}
          className="word-page"
          contentEditable
          suppressContentEditableWarning
          style={{
            fontFamily: fontName,
            fontSize: `${fontSize}pt`,
            textAlign: align,
            color: fontColor,
          }}
          dangerouslySetInnerHTML={{
            __html: '<p>Start typing your document here...</p><p><br></p><p>This is a Microsoft Word-like editor with full ribbon interface support. You can:</p><ul><li>Format text with <b>bold</b>, <i>italic</i>, and <u>underline</u></li><li>Change fonts and sizes</li><li>Apply colors and highlighting</li><li>Align paragraphs</li><li>Insert lists, tables, and more</li></ul>'
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="status-bar shrink-0">
        <div className="flex items-center gap-4">
          <span>Page 1 of 1</span>
          <span>Words: 45</span>
          <span>English (United States)</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="hover:bg-white/20 px-2 py-0.5 text-xs">📖</button>
          <input type="range" min="50" max="200" defaultValue="100" className="w-24 h-1" />
          <span className="text-xs">100%</span>
        </div>
      </div>

      {/* File Menu Overlay */}
      {showFileMenu && (
        <div className="file-menu fade-in">
          <div className="file-menu-sidebar">
            <button onClick={() => setShowFileMenu(false)} className="w-full text-left px-6 py-3 hover:bg-white/10 text-lg">
              ← Back
            </button>
            <div className="mt-4">
              {['New', 'Open', 'Save', 'Save As', 'Print', 'Share', 'Export', 'Close'].map(item => (
                <button key={item} className="w-full text-left px-6 py-3 hover:bg-white/10 text-sm">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="file-menu-content">
            <h2 className="text-2xl font-semibold text-[#2b579a] mb-6">Document1</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-600">Info</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📄 Type: Word Document</p>
                  <p>📏 Size: 24 KB</p>
                  <p>📅 Created: Today</p>
                  <p>✏️ Modified: Just now</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-600">Protect Document</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <button className="block text-[#2b579a] hover:underline">🔒 Mark as Final</button>
                  <button className="block text-[#2b579a] hover:underline">🔐 Encrypt with Password</button>
                  <button className="block text-[#2b579a] hover:underline">🚫 Restrict Editing</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
