import { useState, useRef } from 'react';

interface Props {
  onBack: () => void;
}

interface Slide {
  id: number;
  title: string;
  content: string;
  bgColor: string;
  textColor: string;
  layout: 'title' | 'content' | 'blank' | 'two-content' | 'title-only';
  notes: string;
}

export default function PowerPointEditor({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState('home');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([
    { id: 1, title: 'Click to add title', content: 'Click to add subtitle', bgColor: '#ffffff', textColor: '#333333', layout: 'title', notes: '' },
    { id: 2, title: 'Slide Title', content: '• Point 1\n• Point 2\n• Point 3', bgColor: '#ffffff', textColor: '#333333', layout: 'content', notes: '' },
    { id: 3, title: '', content: '', bgColor: '#ffffff', textColor: '#333333', layout: 'blank', notes: '' },
  ]);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'normal' | 'slide-sorter' | 'presentation'>('normal');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'title' | 'content' | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const tabs = ['home', 'insert', 'design', 'transitions', 'animations', 'slide show', 'review', 'view'];

  const colors = [
    '#000000', '#44546a', '#4472c4', '#ed7d31', '#a5a5a5', '#ffc000', '#5b9bd5', '#70ad47',
    '#ffffff', '#e7e6e6', '#d9e2f3', '#fce4d6', '#ededed', '#fff2cc', '#deeaf6', '#e2efd9',
    '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0',
    '#7030a0', '#ff00ff', '#bf8f00', '#808000', '#008000', '#008080', '#0000ff', '#800080',
  ];

  const addSlide = (layout: Slide['layout'] = 'content') => {
    const newSlide: Slide = {
      id: slides.length + 1,
      title: layout === 'title' ? 'Click to add title' : layout === 'blank' ? '' : 'Slide Title',
      content: layout === 'title' ? 'Click to add subtitle' : layout === 'blank' ? '' : '• Click to add text',
      bgColor: '#ffffff',
      textColor: '#333333',
      layout,
      notes: '',
    };
    setSlides([...slides, newSlide]);
    setSelectedSlide(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== selectedSlide);
    setSlides(newSlides);
    setSelectedSlide(Math.min(selectedSlide, newSlides.length - 1));
  };

  const duplicateSlide = () => {
    const slide = { ...slides[selectedSlide], id: slides.length + 1 };
    const newSlides = [...slides];
    newSlides.splice(selectedSlide + 1, 0, slide);
    setSlides(newSlides);
    setSelectedSlide(selectedSlide + 1);
  };

  const updateSlide = (field: keyof Slide, value: string) => {
    setSlides(prev => prev.map((s, i) => i === selectedSlide ? { ...s, [field]: value } : s));
  };

  const renderSlidePreview = (slide: Slide, index: number, isThumbnail = false) => {
    const scale = isThumbnail ? 0.22 : 1;
    return (
      <div
        key={index}
        className={`relative ${isThumbnail ? 'cursor-pointer hover:ring-2 hover:ring-blue-300' : ''} ${selectedSlide === index && !isThumbnail ? '' : ''}`}
        style={{
          width: isThumbnail ? 160 : 720,
          height: isThumbnail ? 90 : 405,
          backgroundColor: slide.bgColor,
          color: slide.textColor,
          transform: `scale(${isThumbnail ? scale : 1})`,
          transformOrigin: 'top left',
          marginBottom: isThumbnail ? -(90 * (1 - scale)) : 0,
        }}
        onClick={() => isThumbnail && setSelectedSlide(index)}
      >
        {slide.layout === 'title' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="text-3xl font-bold mb-4" contentEditable={editingField === 'title'} suppressContentEditableWarning
              onBlur={(e) => { updateSlide('title', e.currentTarget.textContent || ''); setEditingField(null); }}
              onFocus={() => setEditingField('title')}
            >{slide.title}</div>
            <div className="text-lg text-gray-500" contentEditable={editingField === 'content'} suppressContentEditableWarning
              onBlur={(e) => { updateSlide('content', e.currentTarget.textContent || ''); setEditingField(null); }}
              onFocus={() => setEditingField('content')}
            >{slide.content}</div>
          </div>
        )}
        {slide.layout === 'content' && (
          <div className="absolute inset-0 p-8">
            <div className="text-2xl font-bold mb-4 border-b-2 border-[#d24726] pb-2" contentEditable={editingField === 'title'} suppressContentEditableWarning
              onBlur={(e) => { updateSlide('title', e.currentTarget.textContent || ''); setEditingField(null); }}
              onFocus={() => setEditingField('title')}
            >{slide.title}</div>
            <div className="text-base whitespace-pre-line" contentEditable={editingField === 'content'} suppressContentEditableWarning
              onBlur={(e) => { updateSlide('content', e.currentTarget.textContent || ''); setEditingField(null); }}
              onFocus={() => setEditingField('content')}
            >{slide.content}</div>
          </div>
        )}
        {slide.layout === 'blank' && (
          <div className="absolute inset-0 p-8" contentEditable={editingField === 'content'} suppressContentEditableWarning
            onBlur={(e) => { updateSlide('content', e.currentTarget.textContent || ''); setEditingField(null); }}
            onFocus={() => setEditingField('content')}
          >{slide.content}</div>
        )}
        {slide.layout === 'two-content' && (
          <div className="absolute inset-0 p-8">
            <div className="text-2xl font-bold mb-4" contentEditable={editingField === 'title'} suppressContentEditableWarning
              onBlur={(e) => { updateSlide('title', e.currentTarget.textContent || ''); setEditingField(null); }}
              onFocus={() => setEditingField('title')}
            >{slide.title}</div>
            <div className="flex gap-4 h-[calc(100%-60px)]">
              <div className="flex-1 border border-gray-200 p-4 text-sm" contentEditable suppressContentEditableWarning>{slide.content}</div>
              <div className="flex-1 border border-gray-200 p-4 text-sm" contentEditable suppressContentEditableWarning>Click to add text</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRibbon = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            {/* Clipboard */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <button className="ribbon-btn">
                <span className="text-xl">📋</span>
                <span>Paste</span>
              </button>
              <div className="flex gap-1 mt-1">
                <button className="ribbon-btn-small text-[10px]">✂️ Cut</button>
                <button className="ribbon-btn-small text-[10px]">📄 Copy</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Clipboard</span>
            </div>

            {/* Slides */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <button className="ribbon-btn-large" onClick={() => addSlide('content')}>
                <span className="icon">📄</span>
                <span>New Slide</span>
              </button>
              <div className="flex gap-1 mt-1">
                <button className="ribbon-btn-small text-[10px]" onClick={() => addSlide('title')}>Title</button>
                <button className="ribbon-btn-small text-[10px]" onClick={() => addSlide('content')}>Content</button>
                <button className="ribbon-btn-small text-[10px]" onClick={() => addSlide('blank')}>Blank</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Slides</span>
            </div>

            {/* Font */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 mb-1 items-center">
                <select className="h-6 text-xs border border-gray-300 rounded px-1 w-24">
                  <option>Calibri</option>
                  <option>Arial</option>
                  <option>Times New Roman</option>
                </select>
                <select className="h-6 text-xs border border-gray-300 rounded px-1 w-12">
                  {['12','14','16','18','20','24','28','32','36','44','48','60'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-0.5">
                <button className="ribbon-btn-small"><span className="font-bold">B</span></button>
                <button className="ribbon-btn-small"><span className="italic">I</span></button>
                <button className="ribbon-btn-small"><span className="underline">U</span></button>
                <div className="relative">
                  <button className="ribbon-btn-small" onClick={() => setShowColorPicker(showColorPicker === 'font' ? null : 'font')}>
                    <span style={{ borderBottom: '3px solid #d24726' }}>A</span>
                    <span className="text-[8px]">▼</span>
                  </button>
                  {showColorPicker === 'font' && (
                    <div className="absolute top-full left-0 bg-white border border-gray-300 shadow-lg z-50 p-2">
                      <div className="color-grid">
                        {colors.map(c => (
                          <div key={c} className="color-swatch" style={{ backgroundColor: c }} onClick={() => {
                            updateSlide('textColor', c);
                            setShowColorPicker(null);
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Font</span>
            </div>

            {/* Paragraph */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-0.5 mb-1">
                <button className="ribbon-btn-small">• ≡</button>
                <button className="ribbon-btn-small">1. ≡</button>
                <button className="ribbon-btn-small">≡←</button>
                <button className="ribbon-btn-small">≡↔</button>
                <button className="ribbon-btn-small">≡→</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Paragraph</span>
            </div>

            {/* Drawing */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 mb-1">
                <div className="relative">
                  <button className="ribbon-btn-small" onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}>
                    <span style={{ backgroundColor: slides[selectedSlide]?.bgColor || '#fff' }} className="w-4 h-4 border border-gray-300 inline-block">🎨</span>
                    <span className="text-[8px]">▼</span>
                  </button>
                  {showColorPicker === 'bg' && (
                    <div className="absolute top-full left-0 bg-white border border-gray-300 shadow-lg z-50 p-2">
                      <div className="color-grid">
                        {colors.map(c => (
                          <div key={c} className="color-swatch" style={{ backgroundColor: c }} onClick={() => {
                            updateSlide('bgColor', c);
                            setShowColorPicker(null);
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Drawing</span>
            </div>

            {/* Editing */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small" onClick={duplicateSlide}>📄 Duplicate</button>
                <button className="ribbon-btn-small" onClick={deleteSlide}>🗑️ Delete</button>
                <button className="ribbon-btn-small">🔍 Find</button>
                <button className="ribbon-btn-small">↔ Select</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Editing</span>
            </div>
          </div>
        );

      case 'insert':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1">
                <button className="ribbon-btn-large"><span className="icon">📊</span><span>Table</span></button>
                <button className="ribbon-btn-large"><span className="icon">🖼️</span><span>Picture</span></button>
                <button className="ribbon-btn-large"><span className="icon">📐</span><span>Shapes</span></button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Images</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex gap-1">
                <button className="ribbon-btn-small">🔗 Link</button>
                <button className="ribbon-btn-small">📝 Text Box</button>
                <button className="ribbon-btn-small">📈 Chart</button>
                <button className="ribbon-btn-small">🎬 Video</button>
                <button className="ribbon-btn-small">🔣 Symbol</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Text & Media</span>
            </div>
          </div>
        );

      case 'design':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-2">
                <button className="ribbon-btn-large"><span className="icon">🎨</span><span>Themes</span></button>
                <button className="ribbon-btn-large"><span className="icon">📏</span><span>Slide Size</span></button>
                <button className="ribbon-btn-large"><span className="icon">🖌️</span><span>Variants</span></button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Customize</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex gap-1">
                <button className="ribbon-btn-small" onClick={() => updateSlide('bgColor', '#2b579a')}>🔵 Dark Blue</button>
                <button className="ribbon-btn-small" onClick={() => updateSlide('bgColor', '#1a1a2e')}>🌑 Dark</button>
                <button className="ribbon-btn-small" onClick={() => updateSlide('bgColor', '#ffffff')}>⬜ White</button>
                <button className="ribbon-btn-small" onClick={() => updateSlide('bgColor', '#f0f4f8')}>🔷 Light Blue</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Background</span>
            </div>
          </div>
        );

      case 'transitions':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 flex-wrap">
                <button className="ribbon-btn-small">None</button>
                <button className="ribbon-btn-small">Fade</button>
                <button className="ribbon-btn-small">Push</button>
                <button className="ribbon-btn-small">Wipe</button>
                <button className="ribbon-btn-small">Split</button>
                <button className="ribbon-btn-small">Curtains</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Transition to This Slide</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small">🔊 Sound</button>
                <button className="ribbon-btn-small">⏱️ Duration</button>
                <button className="ribbon-btn-small">🔄 Apply to All</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Timing</span>
            </div>
          </div>
        );

      case 'animations':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 flex-wrap">
                <button className="ribbon-btn-small">None</button>
                <button className="ribbon-btn-small">Appear</button>
                <button className="ribbon-btn-small">Fade In</button>
                <button className="ribbon-btn-small">Fly In</button>
                <button className="ribbon-btn-small">Float</button>
                <button className="ribbon-btn-small">Split</button>
                <button className="ribbon-btn-small">Wipe</button>
                <button className="ribbon-btn-small">Zoom</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Animation</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small">⏱️ Duration</button>
                <button className="ribbon-btn-small">⏳ Delay</button>
                <button className="ribbon-btn-small">🔄 Trigger</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Timing</span>
            </div>
          </div>
        );

      case 'slide show':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <button className="ribbon-btn-large" onClick={() => setViewMode('presentation')}>
                <span className="icon">▶️</span>
                <span>From Beginning</span>
              </button>
              <span className="text-[10px] text-gray-500 mt-1">Start Slide Show</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small" onClick={() => setViewMode('presentation')}>📺 From Current</button>
                <button className="ribbon-btn-small">🖥️ Set Up Show</button>
                <button className="ribbon-btn-small">🎤 Record</button>
                <button className="ribbon-btn-small">🔲 Hide Slide</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Set Up</span>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Tab "{activeTab}" - Available in full version
          </div>
        );
    }
  };

  // Presentation mode
  if (viewMode === 'presentation') {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center relative" onClick={() => setViewMode('normal')}>
        <div className="w-full h-full flex items-center justify-center">
          {renderSlidePreview(slides[selectedSlide], selectedSlide, false)}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded text-sm flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); setSelectedSlide(Math.max(0, selectedSlide - 1)); }} className="hover:bg-white/20 px-2">◀</button>
          <span>{selectedSlide + 1} / {slides.length}</span>
          <button onClick={(e) => { e.stopPropagation(); setSelectedSlide(Math.min(slides.length - 1, selectedSlide + 1)); }} className="hover:bg-white/20 px-2">▶</button>
          <button onClick={(e) => { e.stopPropagation(); setViewMode('normal'); }} className="hover:bg-white/20 px-2 ml-4">✕ Exit</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-[#f3f3f3]">
      {/* Title Bar */}
      <div className="h-8 bg-[#d24726] flex items-center px-3 text-white text-xs shrink-0">
        <button onClick={onBack} className="mr-2 hover:bg-white/20 px-2 py-0.5 rounded">←</button>
        <div className="flex items-center gap-2">
          <span className="text-sm">📽️</span>
          <span className="font-medium">Presentation1 - PowerPoint</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center bg-white/10 rounded px-3 py-0.5">
            <span className="text-[11px]">📁 Presentation1 - Saved</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="w-10 h-8 hover:bg-white/10 flex items-center justify-center text-sm">─</button>
          <button className="w-10 h-8 hover:bg-white/10 flex items-center justify-center text-sm">□</button>
          <button className="w-10 h-8 hover:bg-red-600 flex items-center justify-center text-sm">✕</button>
        </div>
      </div>

      {/* Quick Access Toolbar */}
      <div className="h-6 bg-[#d24726] flex items-center px-2 gap-1 border-b border-[#a33720] shrink-0">
        <button className="text-white/80 hover:text-white text-xs px-1">💾</button>
        <button className="text-white/80 hover:text-white text-xs px-1">↩</button>
        <button className="text-white/80 hover:text-white text-xs px-1">↪</button>
      </div>

      {/* Ribbon Tabs */}
      <div className="h-7 bg-[#f3f3f3] flex items-end px-2 border-b border-[#d4d4d4] shrink-0">
        <button
          className={`ribbon-tab ${showFileMenu ? 'bg-[#d24726] text-white' : ''}`}
          onClick={() => setShowFileMenu(!showFileMenu)}
        >
          File
        </button>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`ribbon-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setShowFileMenu(false); }}
            style={activeTab === tab ? { color: '#d24726', borderBottomColor: '#d24726' } : {}}
          >
            {tab.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {/* Ribbon Content */}
      <div className="h-[95px] bg-[#f3f3f3] border-b border-[#d4d4d4] overflow-hidden shrink-0">
        {renderRibbon()}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails Panel */}
        <div className="w-48 bg-[#f8f8f8] border-r border-gray-300 overflow-y-auto p-2 shrink-0">
          {slides.map((slide, index) => (
            <div key={slide.id} className="mb-2 relative">
              <div className={`border-2 ${selectedSlide === index ? 'border-[#d24726]' : 'border-transparent'} rounded overflow-hidden`}>
                <div className="flex items-start gap-1">
                  <span className="text-[10px] text-gray-500 mt-1 ml-1">{index + 1}</span>
                  <div className="overflow-hidden" style={{ width: 160, height: 90 }}>
                    {renderSlidePreview(slide, index, true)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Editing Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Slide Canvas */}
          <div className="flex-1 bg-[#606060] flex items-center justify-center overflow-auto p-8">
            <div className="shadow-2xl" style={{ width: 720, height: 405 }}>
              {renderSlidePreview(slides[selectedSlide], selectedSlide, false)}
            </div>
          </div>

          {/* Notes Area */}
          <div className="h-24 bg-white border-t border-gray-300 p-2 shrink-0">
            <div className="text-[10px] text-gray-500 mb-1">Notes</div>
            <textarea
              className="w-full h-14 text-xs border-none outline-none resize-none"
              placeholder="Click to add notes"
              value={slides[selectedSlide]?.notes || ''}
              onChange={(e) => updateSlide('notes', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar shrink-0" style={{ background: '#d24726' }}>
        <div className="flex items-center gap-4">
          <span>Slide {selectedSlide + 1} of {slides.length}</span>
          <span>Notes</span>
        </div>
        <div className="flex items-center gap-2">
          <button className={`hover:bg-white/20 px-2 py-0.5 text-xs ${viewMode === 'normal' ? 'bg-white/20' : ''}`} onClick={() => setViewMode('normal')}>📋 Normal</button>
          <button className={`hover:bg-white/20 px-2 py-0.5 text-xs ${viewMode === 'slide-sorter' ? 'bg-white/20' : ''}`}>📊 Sorter</button>
          <button className="hover:bg-white/20 px-2 py-0.5 text-xs" onClick={() => setViewMode('presentation')}>▶️ Present</button>
          <input type="range" min="50" max="200" defaultValue="100" className="w-24 h-1" />
          <span className="text-xs">100%</span>
        </div>
      </div>

      {/* File Menu Overlay */}
      {showFileMenu && (
        <div className="file-menu fade-in">
          <div className="file-menu-sidebar" style={{ background: '#d24726' }}>
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
            <h2 className="text-2xl font-semibold text-[#d24726] mb-6">Presentation1</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-600">Info</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📄 Type: PowerPoint Presentation</p>
                  <p>📏 Size: 32 KB</p>
                  <p>📅 Created: Today</p>
                  <p>📊 Slides: {slides.length}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-600">Quick Actions</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <button className="block text-[#d24726] hover:underline">🔐 Protect Presentation</button>
                  <button className="block text-[#d24726] hover:underline">🔍 Inspect Document</button>
                  <button className="block text-[#d24726] hover:underline">📤 Export as PDF</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
