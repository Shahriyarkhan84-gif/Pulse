import { Component, type ReactNode } from "react";
import { CrashScreen } from "./CrashScreen";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Catches errors thrown during React rendering/lifecycle within the tree below it. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <CrashScreen label="Render" error={this.state.error} />;
    }
    return this.props.children;
  }
}
