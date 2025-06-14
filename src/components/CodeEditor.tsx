import React, { useState, useRef, useEffect } from 'react';
import { Play, Copy, Trash2, Download } from 'lucide-react';

interface CodeEditorProps {
  onRunCode: (code: string) => void;
  isLoading?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onRunCode, isLoading = false }) => {
  const [code, setCode] = useState(`# Python Code Editor with Data Visualization
# Use visualize(x, y, type) to create charts

import numpy as np

# Example 1: Simple bar chart
x = ['A', 'B', 'C', 'D', 'E']
y = [10, 25, 17, 30, 22]
visualize(x, y, 'bar', 'Sample Bar Chart')

# Example 2: Line chart with larger dataset
x2 = np.linspace(0, 10, 50)
y2 = np.sin(x2)
visualize(x2, y2, 'line', 'Sine Wave')
`);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([]);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
    
    setTimeout(() => {
      if (textareaRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }, 0);
  }, [code]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleRunCode = () => {
    if (code.trim()) {
      onRunCode(code);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
    
    // Handle tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newCode = code.substring(0, start) + '    ' + code.substring(end);
        setCode(newCode);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }, 0);
      }
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    alert("Code copied to clipboard.");
  };

  const clearCode = () => {
    setCode('');
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'python_code.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Python Code Editor</h3>
        <div className="flex flex-wrap items-center gap-1 justify-end">
          <button
            onClick={copyCode}
            className="flex items-center px-2 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Copy className="w-4 h-4 mr-1" />
            <span>Copy</span>
          </button>
          <button
            onClick={clearCode}
            className="flex items-center px-2 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span>Clear</span>
          </button>
          <button
            onClick={downloadCode}
            className="flex items-center px-2 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Download className="w-4 h-4 mr-1" />
            <span>Download</span>
          </button>
          <button
            onClick={handleRunCode}
            disabled={isLoading}
            className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
          >
            <Play className="w-4 h-4 mr-1" />
            <span>{isLoading ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>
      
      <div className="relative h-96 flex">
        {/* Line Numbers */}
        <div 
          ref={lineNumbersRef}
          className="bg-gray-50 border-r border-gray-200 w-16 overflow-hidden flex-shrink-0"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
          }}
        >
          <div 
            className="text-sm text-gray-500 font-mono select-none"
            style={{
              paddingTop: '16px',
              paddingBottom: '16px',
              paddingLeft: '8px',
              paddingRight: '8px',
              lineHeight: '24px',
              fontSize: '14px'
            }}
          >
            {lineNumbers.map((num) => (
              <div 
                key={num} 
                className="text-right"
                style={{
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
        
        {/* Code Editor */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            className="w-full h-full font-mono text-sm text-gray-800 bg-white border-none outline-none resize-none"
            placeholder="Write your Python code here..."
            spellCheck={false}
            style={{ 
              padding: '16px',
              lineHeight: '24px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
      
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        Press <kbd className="bg-gray-200 px-1 py-0.5 rounded">Ctrl+Enter</kbd> to run code
      </div>
    </div>
  );
};

export default CodeEditor;