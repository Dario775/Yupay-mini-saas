import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error capturado por ErrorBoundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg shadow-xl border-0">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                ¡Algo salió mal!
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                Ha ocurrido un error inesperado. No te preocupes, puedes intentar de nuevo.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {import.meta.env.MODE === 'development' && this.state.error && (
                                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-40">
                                    <code className="text-sm text-red-400">
                                        {this.state.error.toString()}
                                    </code>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={this.handleReset}
                                    className="flex-1 gap-2"
                                    variant="default"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Intentar de nuevo
                                </Button>
                                <Button
                                    onClick={this.handleReload}
                                    variant="outline"
                                    className="flex-1 gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Recargar página
                                </Button>
                            </div>

                            <Button
                                onClick={this.handleGoHome}
                                variant="ghost"
                                className="w-full gap-2 text-gray-600 dark:text-gray-400"
                            >
                                <Home className="w-4 h-4" />
                                Volver al inicio
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
