let pyodide;
let outputElement = document.getElementById("output");
let inputElement = document.getElementById("input");
let runButton = document.getElementById("run-button");
let chartCanvas = document.getElementById("chart").getContext("2d");
let chartInstance = null;

async function initializePyodide() {
    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        await pyodide.loadPackage(["numpy", "matplotlib"]);
        document.getElementById("loading").style.display = "none";
        inputElement.disabled = false;
        inputElement.focus();
        outputElement.textContent = "Pyodide loaded with numpy and matplotlib. Use 'visualize(x, y, type)' to plot.\n";
    } catch (error) {
        outputElement.textContent = "Error loading Pyodide: " + error.message;
    }
}

function appendOutput(text) {
    outputElement.textContent += text + "\n";
    outputElement.scrollTop = outputElement.scrollHeight;
}

async function runCode(code) {
    let codeLines = code.trim().split('\n').map(line => `>>> ${line}`).join('\n');
    appendOutput(codeLines);

    try {
        // Định nghĩa hàm visualize trong Python
        pyodide.runPython(`
            from js import appendOutput
            import sys
            from io import StringIO
            sys.stdout = StringIO()
            import numpy as np
            import matplotlib.pyplot as plt
            def visualize(x, y, chart_type='bar'):
                appendOutput(f"Visualizing with x={x}, y={y}, type={chart_type}")
                if not x or not y:
                    appendOutput("Error: x or y is empty or invalid.")
                    return
                plt.switch_backend('Agg')
                fig = plt.figure()
                if chart_type == 'bar':
                    plt.bar(x, y)
                elif chart_type == 'line':
                    plt.plot(x, y)
                elif chart_type == 'pie':
                    plt.pie(y, labels=x)
                plt.title(f'{chart_type.capitalize()} Chart')
                plt.savefig('/tmp/chart.png')
                plt.close()
                # Lưu dữ liệu vào biến toàn cục
                globals()['x_data'] = x if isinstance(x, (list, np.ndarray)) else list(x)
                globals()['y_data'] = y if isinstance(y, (list, np.ndarray)) else list(y)
                globals()['chart_type_data'] = chart_type
                appendOutput("Data prepared for JS: x_data={0}, y_data={1}".format(globals()['x_data'], globals()['y_data']))
        `);
        
        let result = await pyodide.runPythonAsync(code);
        let stdout = pyodide.runPython("sys.stdout.getvalue()");
        pyodide.runPython("sys.stdout = sys.__stdout__");

        if (stdout) appendOutput(stdout.trim());
        if (result !== undefined) appendOutput(result.toString());

        // Chờ dữ liệu sẵn sàng trước khi kích hoạt sự kiện
        await new Promise(resolve => setTimeout(resolve, 300)); // Tăng thời gian chờ
        document.getElementById('chart').dispatchEvent(new Event('updateChart'));
    } catch (error) {
        appendOutput("Error: " + error.message);
    }
}

function updateChart() {
    if (chartInstance) chartInstance.destroy();
    // Lấy dữ liệu từ Pyodide và chuyển sang JavaScript
    let x_raw = pyodide.globals.get("x_data");
    let y_raw = pyodide.globals.get("y_data");
    let chartType = pyodide.globals.get("chart_type_data") || "bar";

    let x = Array.isArray(x_raw) ? pyodide.toJs(x_raw) : [1, 2, 3];
    let y = Array.isArray(y_raw) ? pyodide.toJs(y_raw) : [4, 5, 6];

    appendOutput(`Updating chart with x=[${x}], y=[${y}], type=${chartType}`);
    if (!Array.isArray(x) || !Array.isArray(y) || x.length !== y.length) {
        appendOutput(`Error: Invalid data format for chart. x.length=${x.length}, y.length=${y.length}`);
        return;
    }

    chartInstance = new Chart(chartCanvas, {
        type: chartType,
        data: {
            labels: x,
            datasets: [{
                label: 'Data',
                data: y,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function executeCode() {
    let code = inputElement.value.trim();
    if (code) {
        runCode(code);
        inputElement.value = "";
    }
}

inputElement.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "Enter") executeCode();
});
runButton.addEventListener("click", executeCode);
chartCanvas.canvas.addEventListener("updateChart", updateChart);

initializePyodide();