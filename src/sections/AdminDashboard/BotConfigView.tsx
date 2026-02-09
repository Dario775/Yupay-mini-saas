import { useState, useEffect } from 'react';
import { Bot, Save, RefreshCw, Sparkles, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function BotConfigView() {
    const [prompt, setPrompt] = useState('');
    const [tgToken, setTgToken] = useState('');
    const [tgChatId, setTgChatId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('platform_settings')
                .select('value')
                .eq('key', 'ai_support_prompt')
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Not found
                    toast.error('No se encontró la configuración del bot en la base de datos.');
                } else {
                    throw error;
                }
            } else if (data) {
                // Fetch all settings
                const { data: allSettings } = await supabase
                    .from('platform_settings')
                    .select('key, value');

                if (allSettings) {
                    const settingsMap = Object.fromEntries(allSettings.map(s => [s.key, s.value]));
                    setPrompt(settingsMap['ai_support_prompt'] || '');
                    setTgToken(settingsMap['telegram_bot_token'] || '');
                    setTgChatId(settingsMap['telegram_chat_id'] || '');
                }
            }
        } catch (error: any) {
            console.error('Error fetching bot settings:', error);
            toast.error('Error al cargar la configuración del bot');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSave() {
        if (!prompt.trim()) {
            toast.error('El prompt no puede estar vacío');
            return;
        }

        try {
            setIsSaving(true);

            const updates = [
                { key: 'ai_support_prompt', value: prompt, updated_at: new Date().toISOString() },
                { key: 'telegram_bot_token', value: tgToken, updated_at: new Date().toISOString() },
                { key: 'telegram_chat_id', value: tgChatId, updated_at: new Date().toISOString() }
            ];

            const { error } = await supabase
                .from('platform_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;
            toast.success('Configuración y canales de comunicación guardados');
        } catch (error: any) {
            console.error('Error saving bot settings:', error);
            toast.error('Error al guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                            <Bot className="h-5 w-5 text-violet-500" />
                            Cerebro del Asistente (IA)
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Define la personalidad, conocimientos y reglas de comportamiento del bot.
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchSettings}
                        disabled={isLoading}
                        className="h-8 w-8"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium dark:text-gray-200 flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            System Prompt (Instrucciones base)
                        </label>
                        <span className="text-[10px] text-gray-400 font-mono">
                            {prompt.length} caracteres
                        </span>
                    </div>
                    <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Eres el asistente de YUPAY..."
                        className="min-h-[300px] text-sm font-sans leading-relaxed bg-gray-50/50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 focus:ring-violet-500"
                        disabled={isLoading || isSaving}
                    />
                </div>

                <div className="pt-4 border-t dark:border-gray-800 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold dark:text-white">
                        <Send className="h-4 w-4 text-sky-500" />
                        Canales de Notificación (Leads)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Telegram Bot Token
                            </label>
                            <input
                                type="password"
                                value={tgToken}
                                onChange={(e) => setTgToken(e.target.value)}
                                placeholder="123456789:ABCDEF..."
                                className="w-full px-3 py-2 text-sm rounded-md bg-gray-50/50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700 focus:ring-violet-500 outline-none"
                                disabled={isLoading || isSaving}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                Telegram Chat ID
                            </label>
                            <input
                                type="text"
                                value={tgChatId}
                                onChange={(e) => setTgChatId(e.target.value)}
                                placeholder="-100123456789"
                                className="w-full px-3 py-2 text-sm rounded-md bg-gray-50/50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700 focus:ring-violet-500 outline-none"
                                disabled={isLoading || isSaving}
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-400">
                        Los datos que el bot capture se enviarán automáticamente a este chat de Telegram.
                    </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-1">
                        💡 Tips para el bot:
                    </h4>
                    <ul className="text-[11px] text-amber-700 dark:text-amber-300 space-y-1 list-disc pl-4">
                        <li><b>Leads:</b> El bot pedirá datos de contacto automáticamente cuando alguien quiera "hablar con un humano".</li>
                        <li>Indica el tono (amigable, profesional, etc.).</li>
                        <li>Sé específico sobre lo que NO puede hacer el bot.</li>
                        <li>Las instrucciones que pongas aquí se aplican instantáneamente.</li>
                    </ul>
                </div>

                <div className="flex justify-end pt-2">
                    <Button
                        onClick={handleSave}
                        disabled={isLoading || isSaving}
                        className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                    >
                        {isSaving ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Guardar Cerebro
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
