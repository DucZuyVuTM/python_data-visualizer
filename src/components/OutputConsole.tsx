import React from 'react';
import { Terminal, AlertCircle } from 'lucide-react';

interface OutputConsoleProps {
  output: string | null;
  error: string | null;
  result: string | null;
}

const OutputConsole: React.FC<OutputConsoleProps> = ({ output, error, result }) => {
  const hasContent = output || error || result;

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center space-x-2">
        <Terminal className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-gray-100">Output Console</h3>
      </div>
      
      <div className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
        {!hasContent ? (
          <div className="text-gray-500 italic">No output yet. Run some code to see results.</div>
        ) : (
          <div className="space-y-2">
            {error && (
              <div className="flex items-start space-x-2 text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Error:</div>
                  <pre className="text-sm whitespace-pre-wrap font-mono">{error}</pre>
                </div>
              </div>
            )}
            
            {output && (
              <div className="text-green-400">
                <div className="font-semibold mb-1">Output:</div>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-800 p-2 rounded">{output}</pre>
              </div>
            )}
            
            {result && (
              <div className="text-blue-400">
                <div className="font-semibold mb-1">Result:</div>
                <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-800 p-2 rounded">{result}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;