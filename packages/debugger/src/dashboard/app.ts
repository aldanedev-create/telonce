/**
 * Teloce Debugger Dashboard - Frontend Application
 * 
 * This is the client-side application for the debugger dashboard.
 * It connects to the WebSocket server and displays real-time data.
 */

// ===== Types =====

interface DebugMessage {
    type: 'error' | 'state' | 'performance' | 'compile' | 'render' | 'component' | 'event' | 'log' | 'connected' | 'disconnected';
    payload: any;
    timestamp: number;
    source?: string;
    line?: number;
    column?: number;
}

interface ComponentData {
    id: string;
    name: string;
    type: 'component' | 'element' | 'text' | 'fragment' | 'slot';
    props: Record<string, any>;
    state: Record<string, any>;
    children: ComponentData[];
    parentId?: string;
    isMounted: boolean;
    renderCount: number;
    totalRenderTime: number;
    lastRenderTime?: number;
}

interface ErrorData {
    message: string;
    stack?: string;
    source?: string;
    line?: number;
    column?: number;
    timestamp: number;
    title?: string;
    fix?: string;
    suggestions?: string[];
}

interface PerformanceData {
    fps: number;
    memory: number;
    compileTime: number;
    renderTimes: Record<string, number>;
    fileCount: number;
}

interface LogData {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
    timestamp: number;
}

// ===== DOM References =====

const $ = (selector: string) => document.querySelector(selector);
const $$ = (selector: string) => document.querySelectorAll(selector);

const elements = {
    // Status
    connectionStatus: $('#connectionStatus') as HTMLElement,
    statusDot: $('#connectionStatus .status-dot') as HTMLElement,
    statusText: $('#connectionStatus .status-text') as HTMLElement,

    // Stats
    statComponents: $('#statComponents') as HTMLElement,
    statErrors: $('#statErrors') as HTMLElement,
    statFps: $('#statFps') as HTMLElement,
    statMemory: $('#statMemory') as HTMLElement,
    statCompileTime: $('#statCompileTime') as HTMLElement,
    statFiles: $('#statFiles') as HTMLElement,

    // Counts
    componentCount: $('#componentCount') as HTMLElement,
    errorCount: $('#errorCount') as HTMLElement,

    // Lists
    recentErrors: $('#recentErrors') as HTMLElement,
    componentTree: $('#componentTree') as HTMLElement,
    componentList: $('#componentList') as HTMLElement,
    errorList: $('#errorList') as HTMLElement,
    logContainer: $('#logContainer') as HTMLElement,

    // State
    stateViewer: $('#stateViewer') as HTMLElement,

    // Performance
    componentPerformance: $('#componentPerformance') as HTMLElement,

    // Tabs
    navItems: $$('.nav-item'),
    tabPanels: $$('.tab-panel'),

    // Log controls
    logLevelButtons: $$('.btn-log-level'),
    clearLogs: $('#clearLogs') as HTMLElement,
    clearAll: $('#clearAll') as HTMLElement,
};

// ===== State =====

const state = {
    connected: false,
    components: new Map<string, ComponentData>(),
    errors: [] as ErrorData[],
    logs: [] as LogData[],
    performance: {} as PerformanceData,
    appState: {} as Record<string, any>,
    currentLogFilter: 'all' as 'all' | 'info' | 'warn' | 'error' | 'debug',
};

// ===== WebSocket Connection =====

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/__teloce_debug`;

    try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setConnectionStatus('connected');
            reconnectAttempts = 0;
            console.log('🔌 Debugger connected');
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as DebugMessage;
                handleMessage(message);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        ws.onclose = () => {
            setConnectionStatus('disconnected');
            console.log('🔌 Debugger disconnected');
            attemptReconnect();
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('disconnected');
        };
    } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnectionStatus('disconnected');
        attemptReconnect();
    }
}

function attemptReconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000);
        setConnectionStatus('connecting');
        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts})...`);
        setTimeout(connectWebSocket, delay);
    } else {
        setConnectionStatus('disconnected');
        console.log('❌ Max reconnect attempts reached');
    }
}

function setConnectionStatus(status: 'connected' | 'disconnected' | 'connecting') {
    state.connected = status === 'connected';
    elements.statusDot.className = `status-dot ${status}`;
    elements.statusText.textContent = status === 'connected' ? 'Connected' :
                                        status === 'connecting' ? 'Connecting...' : 'Disconnected';
}

// ===== Message Handler =====

function handleMessage(message: DebugMessage) {
    switch (message.type) {
        case 'error':
            handleError(message.payload);
            break;
        case 'state':
            handleState(message.payload);
            break;
        case 'performance':
            handlePerformance(message.payload);
            break;
        case 'component':
            handleComponent(message.payload);
            break;
        case 'render':
            handleRender(message.payload);
            break;
        case 'log':
            handleLog(message.payload);
            break;
        case 'connected':
            console.log('✅ Connected to debug server');
            break;
        case 'disconnected':
            console.log('❌ Disconnected from debug server');
            break;
        default:
            console.log('Unknown message type:', message.type);
    }
}

// ===== Error Handler =====

function handleError(data: any) {
    const error: ErrorData = {
        message: data.message || 'Unknown error',
        stack: data.stack,
        source: data.source,
        line: data.line,
        column: data.column,
        timestamp: Date.now(),
        title: data.title || 'Error',
        fix: data.fix,
        suggestions: data.suggestions || [],
    };

    state.errors.unshift(error);
    if (state.errors.length > 100) {
        state.errors = state.errors.slice(0, 100);
    }

    updateErrorCount();
    renderRecentErrors();
    renderErrorList();
    updateStats();
}

// ===== State Handler =====

function handleState(data: any) {
    state.appState = data.state || data;
    renderStateViewer();
    updateStats();
}

// ===== Performance Handler =====

function handlePerformance(data: any) {
    state.performance = {
        fps: data.fps || 60,
        memory: data.memory || 0,
        compileTime: data.compileTime || 0,
        renderTimes: data.renderTimes || {},
        fileCount: data.fileCount || 0,
    };
    updateStats();
    renderPerformance();
}

// ===== Component Handler =====

function handleComponent(data: any) {
    if (data.id) {
        state.components.set(data.id, data);
    }
    updateComponentCount();
    renderComponentList();
    renderComponentTree();
    updateStats();
}

// ===== Render Handler =====

function handleRender(data: any) {
    const { component, time } = data;
    if (component && state.components.has(component)) {
        const comp = state.components.get(component)!;
        comp.renderCount = (comp.renderCount || 0) + 1;
        comp.lastRenderTime = time;
        comp.totalRenderTime = (comp.totalRenderTime || 0) + time;
        state.components.set(component, comp);
    }
    renderComponentPerformance();
    updateStats();
}

// ===== Log Handler =====

function handleLog(data: LogData) {
    state.logs.push(data);
    if (state.logs.length > 500) {
        state.logs = state.logs.slice(-500);
    }
    renderLogs();
}

// ===== Render Functions =====

function updateStats() {
    const components = state.components.size;
    const errors = state.errors.length;
    const perf = state.performance;

    elements.statComponents.textContent = String(components);
    elements.statErrors.textContent = String(errors);
    elements.statFps.textContent = perf.fps ? String(perf.fps) : '--';
    elements.statMemory.textContent = perf.memory ? formatMemory(perf.memory) : '--';
    elements.statCompileTime.textContent = perf.compileTime ? `${perf.compileTime}ms` : '--';
    elements.statFiles.textContent = perf.fileCount ? String(perf.fileCount) : '--';
}

function updateErrorCount() {
    const count = state.errors.length;
    elements.errorCount.textContent = String(count);
    elements.errorCount.style.display = count > 0 ? 'inline' : 'none';
}

function updateComponentCount() {
    const count = state.components.size;
    elements.componentCount.textContent = String(count);
    elements.componentCount.style.display = count > 0 ? 'inline' : 'none';
}

function renderRecentErrors() {
    const container = elements.recentErrors;
    const recent = state.errors.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state">No errors detected</div>';
        return;
    }

    container.innerHTML = recent.map(error => `
        <div class="error-item" style="margin-bottom: 8px; padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--accent-red); border-radius: var(--radius-sm); border-left: 4px solid var(--accent-red);">
            <div style="font-weight: 600; color: var(--accent-red);">${error.title || 'Error'}</div>
            <div style="color: var(--text-secondary); font-size: 13px;">${error.message}</div>
            ${error.source ? `<div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">${error.source}${error.line ? `:${error.line}` : ''}</div>` : ''}
            ${error.fix ? `<div style="margin-top: 6px; padding: 6px 10px; background: var(--bg-secondary); border-radius: var(--radius-sm); border-left: 3px solid var(--accent-green); font-size: 13px; color: var(--text-secondary);">💡 ${error.fix}</div>` : ''}
        </div>
    `).join('');
}

function renderErrorList() {
    const container = elements.errorList;
    const errors = state.errors;

    if (errors.length === 0) {
        container.innerHTML = '<div class="empty-state">No errors to display</div>';
        return;
    }

    container.innerHTML = errors.map(error => `
        <div class="error-item">
            <div class="error-header">
                <div class="error-title error">${error.title || 'Error'}</div>
                <div class="error-time">${formatTime(error.timestamp)}</div>
            </div>
            <div class="error-message">${error.message}</div>
            ${error.source ? `<div style="color: var(--text-muted); font-size: 12px; margin-bottom: 8px;">📍 ${error.source}${error.line ? `:${error.line}` : ''}${error.column ? `:${error.column}` : ''}</div>` : ''}
            ${error.fix ? `
                <div class="error-fix">
                    <div class="error-fix-label">💡 Suggested Fix</div>
                    <div class="error-fix-text">${error.fix}</div>
                </div>
            ` : ''}
            ${error.suggestions && error.suggestions.length > 0 ? `
                <div class="error-suggestion">
                    ${error.suggestions.map(s => `• ${s}`).join('<br>')}
                </div>
            ` : ''}
            ${error.stack ? `
                <details style="margin-top: 8px;">
                    <summary style="color: var(--text-muted); font-size: 12px; cursor: pointer;">Stack Trace</summary>
                    <pre style="background: var(--bg-secondary); padding: 8px; border-radius: var(--radius-sm); font-size: 12px; color: var(--text-secondary); overflow-x: auto; margin-top: 4px;">${error.stack}</pre>
                </details>
            ` : ''}
        </div>
    `).join('');
}

function renderComponentList() {
    const container = elements.componentList;
    const components = Array.from(state.components.values());

    if (components.length === 0) {
        container.innerHTML = '<div class="empty-state">No components found</div>';
        return;
    }

    container.innerHTML = components.map(comp => `
        <div class="component-item">
            <div class="component-name">${comp.name}</div>
            <div class="component-meta">
                <span class="component-badge ${comp.isMounted ? 'mounted' : 'unmounted'}">${comp.isMounted ? 'Mounted' : 'Unmounted'}</span>
                <span>${comp.renderCount || 0} renders</span>
                ${comp.lastRenderTime ? `<span>${comp.lastRenderTime.toFixed(2)}ms</span>` : ''}
            </div>
        </div>
    `).join('');
}

function renderComponentTree() {
    const container = elements.componentTree;
    const roots = Array.from(state.components.values()).filter(c => !c.parentId);

    if (roots.length === 0) {
        container.innerHTML = '<div class="empty-state">No components mounted</div>';
        return;
    }

    function renderTree(component: ComponentData, depth: number = 0): string {
        const indent = '  '.repeat(depth);
        const children = Array.from(state.components.values()).filter(c => c.parentId === component.id);

        return `
            <div style="padding: 4px 0; padding-left: ${depth * 16}px; display: flex; align-items: center; gap: 8px; font-size: 13px;">
                <span style="color: ${component.isMounted ? 'var(--accent-green)' : 'var(--text-muted)'};">${component.isMounted ? '●' : '○'}</span>
                <span style="color: var(--accent-blue);">${component.name}</span>
                <span style="color: var(--text-muted); font-size: 11px;">${component.type}</span>
                <span style="color: var(--text-muted); font-size: 11px;">${component.renderCount || 0} renders</span>
            </div>
            ${children.map(c => renderTree(c, depth + 1)).join('')}
        `;
    }

    container.innerHTML = roots.map(r => renderTree(r)).join('');
}

function renderStateViewer() {
    const container = elements.stateViewer;
    const stateObj = state.appState;

    if (Object.keys(stateObj).length === 0) {
        container.innerHTML = '<div class="empty-state">No state data available</div>';
        return;
    }

    function renderValue(value: any, depth: number = 0): string {
        if (value === null || value === undefined) {
            return `<span class="state-null">${String(value)}</span>`;
        }
        if (typeof value === 'string') {
            return `<span class="state-string">"${value}"</span>`;
        }
        if (typeof value === 'number') {
            return `<span class="state-number">${value}</span>`;
        }
        if (typeof value === 'boolean') {
            return `<span class="state-boolean">${value}</span>`;
        }
        if (Array.isArray(value)) {
            if (value.length === 0) return '<span class="state-null">[]</span>';
            return `[<br>${value.map((v, i) => 
                `${'  '.repeat(depth + 1)}${renderValue(v, depth + 1)}${i < value.length - 1 ? ',' : ''}`
            ).join('<br>')}<br>${'  '.repeat(depth)}]`;
        }
        if (typeof value === 'object') {
            const entries = Object.entries(value);
            if (entries.length === 0) return '<span class="state-null">{}</span>';
            return `{<br>${entries.map(([k, v], i) => 
                `${'  '.repeat(depth + 1)}<span class="state-key">${k}</span>: ${renderValue(v, depth + 1)}${i < entries.length - 1 ? ',' : ''}`
            ).join('<br>')}<br>${'  '.repeat(depth)}}`;
        }
        return String(value);
    }

    container.innerHTML = renderValue(stateObj);
}

function renderPerformance() {
    const perf = state.performance;
    const container = elements.componentPerformance;

    const renderTimes = perf.renderTimes || {};
    const entries = Object.entries(renderTimes);

    if (entries.length === 0) {
        container.innerHTML = '<div class="empty-state">No performance data</div>';
        return;
    }

    const sorted = entries.sort((a, b) => b[1] - a[1]);

    container.innerHTML = sorted.map(([name, time]) => {
        const isSlow = time > 16;
        const isVerySlow = time > 50;
        let cls = '';
        if (isVerySlow) cls = 'very-slow';
        else if (isSlow) cls = 'slow';
        return `
            <div class="component-perf-item">
                <span class="component-perf-name">${name}</span>
                <span class="component-perf-time ${cls}">${time.toFixed(2)}ms</span>
            </div>
        `;
    }).join('');
}

function renderComponentPerformance() {
    // Reuse the same container as performance
    renderPerformance();
}

function renderLogs() {
    const container = elements.logContainer;
    const filter = state.currentLogFilter;
    let logs = state.logs;

    if (filter !== 'all') {
        logs = logs.filter(l => l.level === filter);
    }

    if (logs.length === 0) {
        container.innerHTML = '<div class="empty-state">No logs available</div>';
        return;
    }

    container.innerHTML = logs.map(log => `
        <div class="log-entry">
            <span class="log-time">${formatTime(log.timestamp)}</span>
            <span class="log-level ${log.level}">${log.level}</span>
            <span class="log-message">${log.message}${log.data ? ` <span class="highlight">${JSON.stringify(log.data)}</span>` : ''}</span>
        </div>
    `).join('');
}

// ===== Utilities =====

function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
}

function formatMemory(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ===== Tab Navigation =====

elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Update nav
        elements.navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        // Update panels
        const tabId = item.dataset.tab;
        elements.tabPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === `tab-${tabId}`) {
                panel.classList.add('active');
            }
        });
    });
});

// ===== Log Controls =====

elements.logLevelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        elements.logLevelButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentLogFilter = btn.dataset.level as any;
        renderLogs();
    });
});

elements.clearLogs.addEventListener('click', () => {
    state.logs = [];
    renderLogs();
});

elements.clearAll.addEventListener('click', () => {
    state.errors = [];
    state.logs = [];
    state.components.clear();
    state.appState = {};
    state.performance = {} as PerformanceData;
    renderAll();
});

// ===== Render All =====

function renderAll() {
    updateStats();
    updateErrorCount();
    updateComponentCount();
    renderRecentErrors();
    renderErrorList();
    renderComponentList();
    renderComponentTree();
    renderStateViewer();
    renderPerformance();
    renderLogs();
}

// ===== Initialization =====

// Connect to WebSocket
connectWebSocket();

// Initial render
renderAll();

console.log('🐛 Teloce Debugger Dashboard initialized');
console.log('🔌 Connecting to debug server...');