import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("React Error Boundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);
    console.error("Error stack:", error.stack);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
          <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-300 text-lg">
                The application encountered an unexpected error
              </p>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 font-mono text-sm break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                onClick={this.handleReload}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Reload Application
              </Button>
            </div>

            {this.state.errorInfo && (
              <details className="mt-6">
                <summary className="text-gray-400 cursor-pointer hover:text-gray-300 text-sm">
                  Show technical details
                </summary>
                <pre className="mt-4 p-4 bg-black/30 rounded-lg text-xs text-gray-300 overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
