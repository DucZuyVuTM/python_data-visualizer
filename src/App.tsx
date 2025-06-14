import { useState } from 'react';
import { usePyodide } from './hooks/usePyodide';
import CodeEditor from './components/CodeEditor';
import OutputConsole from './components/OutputConsole';
import ChartVisualization from './components/ChartVisualization';
import LoadingSpinner from './components/LoadingSpinner';
import { Code, Database, AlertCircle } from 'lucide-react';

interface ExecutionResult {
  result: string | null;
  output: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: any | null;
  error: string | null;
}

function App() {
  const { isLoaded, isLoading, error: pyodideError, runCode } = usePyodide();
  const [executionResult, setExecutionResult] = useState<ExecutionResult>({
    result: null,
    output: null,
    chartData: null,
    error: null,
  });
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunCode = async (code: string) => {
    if (!isLoaded) return;
    
    setIsExecuting(true);
    try {
      const result = await runCode(code);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        result: null,
        output: null,
        chartData: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Setting up your Python environment with scientific libraries..." />;
  }

  if (pyodideError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800">Loading Error</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Failed to initialize the Python environment:
          </p>
          <pre className="bg-gray-100 p-3 rounded text-sm text-red-600 overflow-auto">
            {pyodideError}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Python Code Editor</h1>
                <p className="text-sm text-gray-500">Interactive Python environment with data visualization</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Database className="w-4 h-4" />
                <span>NumPy, Pandas, Matplotlib</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Code Editor */}
          <div className="space-y-6">
            <CodeEditor onRunCode={handleRunCode} isLoading={isExecuting} />
            <OutputConsole 
              output={executionResult.output}
              error={executionResult.error}
              result={executionResult.result}
            />
          </div>

          {/* Right Column - Visualization */}
          <div className="space-y-6">
            <ChartVisualization chartData={executionResult.chartData} />
            
            {/* Documentation Panel */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <h3 className="text-lg font-semibold text-gray-800">Quick Reference</h3>
              </div>
              <div className="p-4 text-sm text-gray-600 space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Visualization Function:</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    visualize(x, y, type, title, xlabel, ylabel)
                  </code>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Chart Types:</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><code>'bar'</code> - Bar chart</li>
                    <li><code>'line'</code> - Line chart</li>
                    <li><code>'pie'</code> - Pie chart</li>
                    <li><code>'scatter'</code> - Scatter plot</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Example:</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs block">
                    visualize([1,2,3], [4,5,6], 'bar', 'My Chart')
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;