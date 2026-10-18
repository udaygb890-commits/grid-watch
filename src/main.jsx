import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', fontFamily: 'monospace', maxWidth: '800px', margin: '40px auto', background: '#FEF2F2', border: '2px solid #EF4444', borderRadius: '16px' }}>
          <h2 style={{ color: '#991B1B', margin: '0 0 10px 0', fontSize: '20px' }}>Application Diagnostics Notice</h2>
          <p style={{ color: '#B91C1C', fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
          <pre style={{ background: '#FFFFFF', padding: '15px', borderRadius: '8px', overflow: 'auto', fontSize: '12px', border: '1px solid #FECACA' }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '15px', padding: '10px 20px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
