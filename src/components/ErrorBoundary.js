import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('🔥 React crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40 }}>
          <h2 style={{ color: 'red' }}>Application crashed</h2>
          <pre>{this.state.error?.toString()}</pre>
          <p>Check browser console for details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
