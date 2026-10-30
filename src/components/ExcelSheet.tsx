import { useState, useRef, useCallback, useEffect } from 'react';

interface Props {
  onBack: () => void;
}

interface CellData {
  value: string;
  formula?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  bgColor?: string;
  fontColor?: string;
  align?: 'left' | 'center' | 'right';
  fontSize?: string;
}

export default function ExcelSheet({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState('home');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [cells, setCells] = useState<Record<string, CellData>>({});
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [selectedRange, setSelectedRange] = useState<string[]>(['A1']);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontSize, setFontSize] = useState('11');
  const [fontColor, setFontColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const formulaBarRef = useRef<HTMLInputElement>(null);

  const cols = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  const getCellId = (col: string, row: number) => `${col}${row}`;

  const getCellValue = useCallback((cellId: string): string => {
    const cell = cells[cellId];
    if (!cell) return '';
    if (cell.formula) {
      return evaluateFormula(cell.formula);
    }
    return cell.value;
  }, [cells]);

  const evaluateFormula = (formula: string): string => {
    try {
      if (!formula.startsWith('=')) return formula;
      let expr = formula.substring(1).toUpperCase();
      
      // Handle SUM
      const sumMatch = expr.match(/SUM\(([A-Z])(\d+):([A-Z])(\d+)\)/);
      if (sumMatch) {
        const [, startCol, startRow, endCol, endRow] = sumMatch;
        let sum = 0;
        const startColIdx = startCol.charCodeAt(0);
        const endColIdx = endCol.charCodeAt(0);
        for (let c = startColIdx; c <= endColIdx; c++) {
          for (let r = parseInt(startRow); r <= parseInt(endRow); r++) {
            const val = parseFloat(getCellValue(`${String.fromCharCode(c)}${r}`));
            if (!isNaN(val)) sum += val;
          }
        }
        return sum.toString();
      }

      // Handle AVERAGE
      const avgMatch = expr.match(/AVERAGE\(([A-Z])(\d+):([A-Z])(\d+)\)/);
      if (avgMatch) {
        const [, startCol, startRow, endCol, endRow] = avgMatch;
        let sum = 0, count = 0;
        const startColIdx = startCol.charCodeAt(0);
        const endColIdx = endCol.charCodeAt(0);
        for (let c = startColIdx; c <= endColIdx; c++) {
          for (let r = parseInt(startRow); r <= parseInt(endRow); r++) {
            const val = parseFloat(getCellValue(`${String.fromCharCode(c)}${r}`));
            if (!isNaN(val)) { sum += val; count++; }
          }
        }
        return count > 0 ? (sum / count).toFixed(2) : '0';
      }

      // Handle COUNT
      const countMatch = expr.match(/COUNT\(([A-Z])(\d+):([A-Z])(\d+)\)/);
      if (countMatch) {
        const [, startCol, startRow, endCol, endRow] = countMatch;
        let count = 0;
        const startColIdx = startCol.charCodeAt(0);
        const endColIdx = endCol.charCodeAt(0);
        for (let c = startColIdx; c <= endColIdx; c++) {
          for (let r = parseInt(startRow); r <= parseInt(endRow); r++) {
            const val = getCellValue(`${String.fromCharCode(c)}${r}`);
            if (val && !isNaN(parseFloat(val))) count++;
          }
        }
        return count.toString();
      }

      // Handle MAX/MIN
      const maxMatch = expr.match(/MAX\(([A-Z])(\d+):([A-Z])(\d+)\)/);
      if (maxMatch) {
        const [, startCol, startRow, endCol, endRow] = maxMatch;
        let max = -Infinity;
        const startColIdx = startCol.charCodeAt(0);
        const endColIdx = endCol.charCodeAt(0);
        for (let c = startColIdx; c <= endColIdx; c++) {
          for (let r = parseInt(startRow); r <= parseInt(endRow); r++) {
            const val = parseFloat(getCellValue(`${String.fromCharCode(c)}${r}`));
            if (!isNaN(val) && val > max) max = val;
          }
        }
        return max === -Infinity ? '0' : max.toString();
      }

      const minMatch = expr.match(/MIN\(([A-Z])(\d+):([A-Z])(\d+)\)/);
      if (minMatch) {
        const [, startCol, startRow, endCol, endRow] = minMatch;
        let min = Infinity;
        const startColIdx = startCol.charCodeAt(0);
        const endColIdx = endCol.charCodeAt(0);
        for (let c = startColIdx; c <= endColIdx; c++) {
          for (let r = parseInt(startRow); r <= parseInt(endRow); r++) {
            const val = parseFloat(getCellValue(`${String.fromCharCode(c)}${r}`));
            if (!isNaN(val) && val < min) min = val;
          }
        }
        return min === Infinity ? '0' : min.toString();
      }

      // Replace cell references with values
      expr = expr.replace(/([A-Z])(\d+)/g, (match) => {
        const val = getCellValue(match);
        return isNaN(parseFloat(val)) ? `"${val}"` : val;
      });

      // Simple expression evaluation
      const result = Function(`"use strict"; return (${expr})`)();
      return result.toString();
    } catch {
      return '#ERROR';
    }
  };

  const handleCellClick = (cellId: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      // Range selection
      const startCell = selectedCell;
      const startCol = startCell.charAt(0).charCodeAt(0);
      const startRow = parseInt(startCell.substring(1));
      const endCol = cellId.charAt(0).charCodeAt(0);
      const endRow = parseInt(cellId.substring(1));
      
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      
      const range: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        for (let r = minRow; r <= maxRow; r++) {
          range.push(`${String.fromCharCode(c)}${r}`);
        }
      }
      setSelectedRange(range);
    } else {
      setSelectedCell(cellId);
      setSelectedRange([cellId]);
      const cell = cells[cellId];
      setIsBold(cell?.bold || false);
      setIsItalic(cell?.italic || false);
      setIsUnderline(cell?.underline || false);
      setFontSize(cell?.fontSize || '11');
      setFontColor(cell?.fontColor || '#000000');
      setBgColor(cell?.bgColor || '');
    }
  };

  const handleCellDoubleClick = (cellId: string) => {
    setEditingCell(cellId);
    setEditValue(cells[cellId]?.value || '');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCellEdit = (cellId: string, value: string) => {
    const isFormula = value.startsWith('=');
    setCells(prev => ({
      ...prev,
      [cellId]: {
        ...prev[cellId],
        value: isFormula ? '' : value,
        formula: isFormula ? value : undefined,
      }
    }));
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell) return;
    
    const col = selectedCell.charAt(0).charCodeAt(0);
    const row = parseInt(selectedCell.substring(1));
    let newCell = selectedCell;

    switch (e.key) {
      case 'ArrowUp': newCell = row > 1 ? getCellId(String.fromCharCode(col), row - 1) : selectedCell; break;
      case 'ArrowDown': newCell = row < 100 ? getCellId(String.fromCharCode(col), row + 1) : selectedCell; break;
      case 'ArrowLeft': newCell = col > 65 ? getCellId(String.fromCharCode(col - 1), row) : selectedCell; break;
      case 'ArrowRight': newCell = col < 90 ? getCellId(String.fromCharCode(col + 1), row) : selectedCell; break;
      case 'Enter': handleCellEdit(selectedCell, editValue); newCell = row < 100 ? getCellId(String.fromCharCode(col), row + 1) : selectedCell; break;
      case 'Tab': e.preventDefault(); newCell = col < 90 ? getCellId(String.fromCharCode(col + 1), row) : selectedCell; break;
      case 'Delete': 
        setCells(prev => {
          const newCells = { ...prev };
          selectedRange.forEach(id => { delete newCells[id]; });
          return newCells;
        });
        return;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          setEditingCell(selectedCell);
          setEditValue(e.key);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
        return;
    }
    
    if (newCell !== selectedCell) {
      setSelectedCell(newCell);
      setSelectedRange([newCell]);
    }
  };

  const toggleBold = () => {
    const newBold = !isBold;
    setIsBold(newBold);
    setCells(prev => {
      const updated = { ...prev };
      selectedRange.forEach(id => {
        updated[id] = { ...updated[id], bold: newBold, value: updated[id]?.value || '' };
      });
      return updated;
    });
  };

  const toggleItalic = () => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    setCells(prev => {
      const updated = { ...prev };
      selectedRange.forEach(id => {
        updated[id] = { ...updated[id], italic: newItalic, value: updated[id]?.value || '' };
      });
      return updated;
    });
  };

  const toggleUnderline = () => {
    const newUnderline = !isUnderline;
    setIsUnderline(newUnderline);
    setCells(prev => {
      const updated = { ...prev };
      selectedRange.forEach(id => {
        updated[id] = { ...updated[id], underline: newUnderline, value: updated[id]?.value || '' };
      });
      return updated;
    });
  };

  const colors = [
    '#000000', '#44546a', '#4472c4', '#ed7d31', '#a5a5a5', '#ffc000', '#5b9bd5', '#70ad47',
    '#ffffff', '#e7e6e6', '#d9e2f3', '#fce4d6', '#ededed', '#fff2cc', '#deeaf6', '#e2efd9',
    '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0',
    '#7030a0', '#ff00ff', '#bf8f00', '#808000', '#008000', '#008080', '#0000ff', '#800080',
  ];

  const tabs = ['home', 'insert', 'page layout', 'formulas', 'data', 'review', 'view'];

  const renderRibbon = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            {/* Clipboard */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <button className="ribbon-btn" onClick={() => {}}>
                <span className="text-xl">📋</span>
                <span>Paste</span>
              </button>
              <div className="flex gap-1 mt-1">
                <button className="ribbon-btn-small text-[10px]">✂️</button>
                <button className="ribbon-btn-small text-[10px]">📄</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Clipboard</span>
            </div>

            {/* Font */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1 mb-1 items-center">
                <select className="h-6 text-xs border border-gray-300 rounded px-1 w-24">
                  <option>Calibri</option>
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Courier New</option>
                </select>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="h-6 text-xs border border-gray-300 rounded px-1 w-12"
                >
                  {['8','9','10','11','12','14','16','18','20','24','28','36'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-0.5">
                <button className={`ribbon-btn-small ${isBold ? 'bg-green-100 border-green-300' : ''}`} onClick={toggleBold}>
                  <span className="font-bold">B</span>
                </button>
                <button className={`ribbon-btn-small ${isItalic ? 'bg-green-100 border-green-300' : ''}`} onClick={toggleItalic}>
                  <span className="italic">I</span>
                </button>
                <button className={`ribbon-btn-small ${isUnderline ? 'bg-green-100 border-green-300' : ''}`} onClick={toggleUnderline}>
                  <span className="underline">U</span>
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
                          <div key={c} className="color-swatch" style={{ backgroundColor: c }} onClick={() => {
                            setFontColor(c);
                            setCells(prev => {
                              const updated = { ...prev };
                              selectedRange.forEach(id => {
                                updated[id] = { ...updated[id], fontColor: c, value: updated[id]?.value || '' };
                              });
                              return updated;
                            });
                            setShowColorPicker(null);
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button className="ribbon-btn-small" onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}>
                    <span style={{ backgroundColor: bgColor || '#ffff00' }}>🪣</span>
                    <span className="text-[8px]">▼</span>
                  </button>
                  {showColorPicker === 'bg' && (
                    <div className="absolute top-full left-0 bg-white border border-gray-300 shadow-lg z-50 p-2">
                      <div className="color-grid">
                        {colors.map(c => (
                          <div key={c} className="color-swatch" style={{ backgroundColor: c }} onClick={() => {
                            setBgColor(c);
                            setCells(prev => {
                              const updated = { ...prev };
                              selectedRange.forEach(id => {
                                updated[id] = { ...updated[id], bgColor: c, value: updated[id]?.value || '' };
                              });
                              return updated;
                            });
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

            {/* Alignment */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-0.5 mb-1">
                <button className="ribbon-btn-small" onClick={() => {
                  setCells(prev => {
                    const updated = { ...prev };
                    selectedRange.forEach(id => {
                      updated[id] = { ...updated[id], align: 'left', value: updated[id]?.value || '' };
                    });
                    return updated;
                  });
                }}>⬆</button>
                <button className="ribbon-btn-small" onClick={() => {
                  setCells(prev => {
                    const updated = { ...prev };
                    selectedRange.forEach(id => {
                      updated[id] = { ...updated[id], align: 'center', value: updated[id]?.value || '' };
                    });
                    return updated;
                  });
                }}>⬌</button>
                <button className="ribbon-btn-small" onClick={() => {
                  setCells(prev => {
                    const updated = { ...prev };
                    selectedRange.forEach(id => {
                      updated[id] = { ...updated[id], align: 'right', value: updated[id]?.value || '' };
                    });
                    return updated;
                  });
                }}>⬇</button>
              </div>
              <div className="flex gap-0.5">
                <button className="ribbon-btn-small" onClick={() => execCommand('insertUnorderedList')}>≡</button>
                <button className="ribbon-btn-small">⇤</button>
                <button className="ribbon-btn-small">⇥</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Alignment</span>
            </div>

            {/* Number */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <select className="h-6 text-xs border border-gray-300 rounded px-1 w-28 mb-1">
                <option>General</option>
                <option>Number</option>
                <option>Currency</option>
                <option>Date</option>
                <option>Percentage</option>
                <option>Text</option>
              </select>
              <div className="flex gap-0.5">
                <button className="ribbon-btn-small">$</button>
                <button className="ribbon-btn-small">%</button>
                <button className="ribbon-btn-small">,</button>
                <button className="ribbon-btn-small">.0→</button>
                <button className="ribbon-btn-small">←.0</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Number</span>
            </div>

            {/* Cells */}
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small">📋 Insert</button>
                <button className="ribbon-btn-small">🗑️ Delete</button>
                <button className="ribbon-btn-small">📐 Format</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Cells</span>
            </div>

            {/* Editing */}
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small" onClick={() => {
                  const formula = '=SUM(A1:A10)';
                  handleCellEdit(selectedCell, formula);
                }}>Σ AutoSum</button>
                <button className="ribbon-btn-small">⬇ Fill</button>
                <button className="ribbon-btn-small">🧹 Clear</button>
                <button className="ribbon-btn-small">🔀 Sort & Filter</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Editing</span>
            </div>
          </div>
        );

      case 'formulas':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small" onClick={() => handleCellEdit(selectedCell, `=SUM(A1:A10)`)}>Σ Sum</button>
                <button className="ribbon-btn-small" onClick={() => handleCellEdit(selectedCell, `=AVERAGE(A1:A10)`)}>x̄ Average</button>
                <button className="ribbon-btn-small" onClick={() => handleCellEdit(selectedCell, `=COUNT(A1:A10)`)}>🔢 Count</button>
                <button className="ribbon-btn-small" onClick={() => handleCellEdit(selectedCell, `=MAX(A1:A10)`)}>⬆ Max</button>
                <button className="ribbon-btn-small" onClick={() => handleCellEdit(selectedCell, `=MIN(A1:A10)`)}>⬇ Min</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Function Library</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small">📊 Name Manager</button>
                <button className="ribbon-btn-small">👁️ Watch Window</button>
                <button className="ribbon-btn-small">📐 Evaluate Formula</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Defined Names</span>
            </div>
          </div>
        );

      case 'insert':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex gap-1">
                <button className="ribbon-btn-large"><span className="icon">📊</span><span>PivotTable</span></button>
                <button className="ribbon-btn-large"><span className="icon">🖼️</span><span>Picture</span></button>
                <button className="ribbon-btn-large"><span className="icon">📈</span><span>Chart</span></button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Tables & Illustrations</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex gap-1">
                <button className="ribbon-btn-small">🔗 Hyperlink</button>
                <button className="ribbon-btn-small">📝 Text Box</button>
                <button className="ribbon-btn-small">📐 Shapes</button>
                <button className="ribbon-btn-small">🔣 Symbol</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Links & Text</span>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="flex items-start gap-1 px-2 h-full">
            <div className="flex flex-col items-center border-r border-gray-300 pr-3 mr-2">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small">📥 Get Data</button>
                <button className="ribbon-btn-small">🔄 Refresh All</button>
                <button className="ribbon-btn-small">🔀 Sort</button>
                <button className="ribbon-btn-small">🔍 Filter</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Get & Transform</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex flex-col gap-1">
                <button className="ribbon-btn-small">📊 PivotTable</button>
                <button className="ribbon-btn-small">🎯 What-If</button>
                <button className="ribbon-btn-small">📈 Data Validation</button>
                <button className="ribbon-btn-small">🗂️ Text to Columns</button>
              </div>
              <span className="text-[10px] text-gray-500 mt-1">Data Tools</span>
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

  const execCommand = (_cmd: string) => {};

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleBold(); }
      if (e.ctrlKey && e.key === 'i') { e.preventDefault(); toggleItalic(); }
      if (e.ctrlKey && e.key === 'u') { e.preventDefault(); toggleUnderline(); }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedRange, isBold, isItalic, isUnderline]);

  return (
    <div className="w-full h-screen flex flex-col bg-[#f3f3f3]">
      {/* Title Bar */}
      <div className="h-8 bg-[#217346] flex items-center px-3 text-white text-xs shrink-0">
        <button onClick={onBack} className="mr-2 hover:bg-white/20 px-2 py-0.5 rounded">←</button>
        <div className="flex items-center gap-2">
          <span className="text-sm">📊</span>
          <span className="font-medium">Book1 - Excel</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center bg-white/10 rounded px-3 py-0.5">
            <span className="text-[11px]">📁 Book1 - Saved</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button className="w-10 h-8 hover:bg-white/10 flex items-center justify-center text-sm">─</button>
          <button className="w-10 h-8 hover:bg-white/10 flex items-center justify-center text-sm">□</button>
          <button className="w-10 h-8 hover:bg-red-600 flex items-center justify-center text-sm">✕</button>
        </div>
      </div>

      {/* Quick Access Toolbar */}
      <div className="h-6 bg-[#217346] flex items-center px-2 gap-1 border-b border-[#155c35] shrink-0">
        <button className="text-white/80 hover:text-white text-xs px-1">💾</button>
        <button className="text-white/80 hover:text-white text-xs px-1">↩</button>
        <button className="text-white/80 hover:text-white text-xs px-1">↪</button>
      </div>

      {/* Ribbon Tabs */}
      <div className="h-7 bg-[#f3f3f3] flex items-end px-2 border-b border-[#d4d4d4] shrink-0">
        <button
          className={`ribbon-tab ${showFileMenu ? 'bg-[#217346] text-white' : ''}`}
          onClick={() => setShowFileMenu(!showFileMenu)}
        >
          File
        </button>
        {tabs.map(tab => (
          <button
            key={tab}
            className={`ribbon-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab); setShowFileMenu(false); }}
            style={activeTab === tab ? { color: '#217346', borderBottomColor: '#217346' } : {}}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Ribbon Content */}
      <div className="h-[95px] bg-[#f3f3f3] border-b border-[#d4d4d4] overflow-hidden shrink-0">
        {renderRibbon()}
      </div>

      {/* Formula Bar */}
      <div className="h-7 bg-white border-b border-gray-300 flex items-center px-2 gap-2 shrink-0">
        <div className="w-20 h-5 border border-gray-300 flex items-center justify-center text-xs font-medium bg-white">
          {selectedCell}
        </div>
        <div className="w-px h-5 bg-gray-300"></div>
        <span className="text-xs text-gray-500">fx</span>
        <input
          ref={formulaBarRef}
          className="flex-1 h-5 text-xs outline-none border-none"
          value={editingCell === selectedCell ? editValue : (cells[selectedCell]?.formula || cells[selectedCell]?.value || '')}
          onChange={(e) => {
            if (editingCell === selectedCell) {
              setEditValue(e.target.value);
            } else {
              setEditingCell(selectedCell);
              setEditValue(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellEdit(selectedCell, editValue);
            }
          }}
          onFocus={() => {
            if (!editingCell) {
              setEditingCell(selectedCell);
              setEditValue(cells[selectedCell]?.formula || cells[selectedCell]?.value || '');
            }
          }}
        />
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto bg-white" onKeyDown={handleKeyDown} tabIndex={0}>
        <table className="border-collapse" style={{ minWidth: '100%' }}>
          <thead>
            <tr>
              <th className="excel-header sticky top-0 left-0 z-20 bg-[#f0f0f0]" style={{ width: '40px', minWidth: '40px' }}></th>
              {cols.map(col => (
                <th key={col} className="excel-header sticky top-0 z-10 bg-[#f0f0f0]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row}>
                <td className="excel-row-header sticky left-0 z-10 bg-[#f0f0f0]">{row}</td>
                {cols.map(col => {
                  const cellId = getCellId(col, row);
                  const cell = cells[cellId];
                  const isSelected = selectedRange.includes(cellId);
                  const isEditing = editingCell === cellId;
                  const displayValue = cell?.formula ? evaluateFormula(cell.formula) : (cell?.value || '');

                  return (
                    <td
                      key={cellId}
                      className={`excel-cell ${isSelected ? 'selected' : ''}`}
                      onClick={(e) => handleCellClick(cellId, e)}
                      onDoubleClick={() => handleCellDoubleClick(cellId)}
                      style={{
                        fontWeight: cell?.bold ? 'bold' : 'normal',
                        fontStyle: cell?.italic ? 'italic' : 'normal',
                        textDecoration: cell?.underline ? 'underline' : 'none',
                        backgroundColor: cell?.bgColor || 'white',
                        color: cell?.fontColor || 'black',
                        textAlign: cell?.align || 'left',
                        fontSize: cell?.fontSize ? `${cell.fontSize}pt` : '11pt',
                      }}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          className="w-full h-full outline-none border-none bg-white text-xs p-0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCellEdit(cellId, editValue)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEdit(cellId, editValue);
                              const nextRow = row < 100 ? row + 1 : row;
                              setSelectedCell(getCellId(col, nextRow));
                              setSelectedRange([getCellId(col, nextRow)]);
                            }
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              handleCellEdit(cellId, editValue);
                              const nextCol = col < 'Z' ? String.fromCharCode(col.charCodeAt(0) + 1) : col;
                              setSelectedCell(getCellId(nextCol, row));
                              setSelectedRange([getCellId(nextCol, row)]);
                            }
                            if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        displayValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet Tabs */}
      <div className="h-6 bg-[#f3f3f3] border-t border-gray-300 flex items-center px-2 gap-1 shrink-0">
        <button className="text-xs px-2 py-0.5 bg-white border border-gray-300 border-b-0 font-medium text-[#217346]">Sheet1</button>
        <button className="text-xs px-2 py-0.5 hover:bg-gray-200">Sheet2</button>
        <button className="text-xs px-2 py-0.5 hover:bg-gray-200">Sheet3</button>
        <button className="text-xs px-2 py-0.5 hover:bg-gray-200">+</button>
      </div>

      {/* Status Bar */}
      <div className="status-bar shrink-0" style={{ background: '#217346' }}>
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <span>Count: {selectedRange.length}</span>
          {selectedRange.length > 1 && (
            <>
              <span>Sum: {selectedRange.reduce((sum, id) => sum + (parseFloat(getCellValue(id)) || 0), 0).toFixed(2)}</span>
              <span>Average: {(selectedRange.reduce((sum, id) => sum + (parseFloat(getCellValue(id)) || 0), 0) / selectedRange.length).toFixed(2)}</span>
            </>
          )}
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
          <div className="file-menu-sidebar" style={{ background: '#217346' }}>
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
            <h2 className="text-2xl font-semibold text-[#217346] mb-6">Book1</h2>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-600">Info</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>📄 Type: Excel Workbook</p>
                  <p>📏 Size: 18 KB</p>
                  <p>📅 Created: Today</p>
                  <p>✏️ Modified: Just now</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-3 text-gray-600">Protect Workbook</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <button className="block text-[#217346] hover:underline">🔐 Encrypt with Password</button>
                  <button className="block text-[#217346] hover:underline">🚫 Protect Sheet</button>
                  <button className="block text-[#217346] hover:underline">📋 Restrict Access</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
