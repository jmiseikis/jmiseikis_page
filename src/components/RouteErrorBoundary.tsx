import { Component, type ReactNode } from "react";

// Catches a lazily loaded page that fails to load (offline, or a new deploy replaced its chunk),
// so the visitor sees a way forward instead of a blank screen.
class RouteErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">This page could not be loaded.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-primary underline hover:no-underline"
        >
          Reload the page
        </button>
      </div>
    );
  }
}

export default RouteErrorBoundary;
