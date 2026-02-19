import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "hsl(350 80% 58% / 0.08)" }}
          >
            <AlertTriangle size={28} className="text-primary" />
          </div>
          <h2
            className="text-lg font-bold text-foreground mb-2"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            An unexpected error occurred. Your data is safe.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
