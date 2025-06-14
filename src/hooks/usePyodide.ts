import { useState, useEffect, useCallback } from 'react';

interface PyodideState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pyodide: any | null;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

export const usePyodide = () => {
  const [state, setState] = useState<PyodideState>({
    pyodide: null,
    isLoaded: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initializePyodide = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });

        // Load essential packages
        await pyodide.loadPackage(["numpy", "matplotlib", "pandas"]);

        // Set up the Python environment
        pyodide.runPython(`
          import numpy as np
          import matplotlib.pyplot as plt
          import pandas as pd
          import sys
          from io import StringIO
          import json

          # Global variables to store chart data
          chart_data = {
              'x': [],
              'y': [],
              'type': 'bar',
              'title': 'Chart',
              'xlabel': 'X-axis',
              'ylabel': 'Y-axis'
          }

          def visualize(x, y, chart_type='bar', title='Chart', xlabel='X-axis', ylabel='Y-axis'):
              """
              Create a visualization with the given data
              """
              global chart_data
              
              # Convert data to lists if they're numpy arrays or pandas series
              if hasattr(x, 'tolist'):
                  x = x.tolist()
              elif not isinstance(x, list):
                  x = list(x)
              
              if hasattr(y, 'tolist'):
                  y = y.tolist()
              elif not isinstance(y, list):
                  y = list(y)
              
              # Handle large arrays by chunking if necessary
              if len(x) > 1000:
                  step = len(x) // 1000
                  x = x[::step]
                  y = y[::step]
                  print(f"Warning: Large dataset detected. Showing every {step}th point for performance.")
              
              chart_data = {
                  'x': x,
                  'y': y,
                  'type': chart_type,
                  'title': title,
                  'xlabel': xlabel,
                  'ylabel': ylabel
              }
              
              print(f"Chart data prepared: {len(x)} points, type: {chart_type}")
              return f"Visualization created with {len(x)} data points"

          def get_chart_data():
              """
              Return the current chart data as JSON string
              """
              return json.dumps(chart_data)

          # Redirect stdout to capture print statements
          original_stdout = sys.stdout
          sys.stdout = StringIO()
        `);

        setState({
          pyodide,
          isLoaded: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          pyodide: null,
          isLoaded: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load Pyodide',
        });
      }
    };

    initializePyodide();
  }, []);

  const runCode = useCallback(async (code: string) => {
    if (!state.pyodide) {
      throw new Error('Pyodide not loaded');
    }

    try {
      // Reset stdout
      state.pyodide.runPython(`
        sys.stdout = StringIO()
      `);

      // Execute the user code
      const result = await state.pyodide.runPythonAsync(code);
      
      // Get the output
      const stdout = state.pyodide.runPython(`
        output = sys.stdout.getvalue()
        sys.stdout = StringIO()
        output
      `);

      // Get chart data if available
      const chartDataJson = state.pyodide.runPython('get_chart_data()');
      const chartData = JSON.parse(chartDataJson);

      return {
        result: result !== undefined ? String(result) : null,
        output: stdout || null,
        chartData: chartData.x.length > 0 ? chartData : null,
        error: null,
      };
    } catch (error) {
      return {
        result: null,
        output: null,
        chartData: null,
        error: error instanceof Error ? error.message : 'Execution error',
      };
    }
  }, [state.pyodide]);

  return {
    ...state,
    runCode,
  };
};