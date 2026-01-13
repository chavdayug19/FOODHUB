'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    {children}
                    <Toaster
                        position="top-center"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: 'var(--toast-bg)',
                                color: 'var(--toast-color)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#22c55e',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
