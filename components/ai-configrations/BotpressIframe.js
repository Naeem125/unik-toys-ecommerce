'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function BotpressIframe() {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const pathname = usePathname();

    // Hide chatbot on admin routes and auth pages (login/register)
    if (
        pathname?.startsWith('/admin') ||
        pathname === '/login' ||
        pathname === '/register'
    ) {
        return null;
    }

    return (
        <>
            {/* Floating chat button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                style={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 9998,
                    width: 72,
                    height: 56,
                    borderRadius: 18,
                    border: 'none',
                    background: 'linear-gradient(135deg, #b88a44, #f5b75b)',
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.18s ease-out, box-shadow 0.18s ease-out',
                }}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
                onMouseEnter={(e) => {
                    setIsHovered(true);
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                    e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.35)';
                }}
                onMouseLeave={(e) => {
                    setIsHovered(false);
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                }}
            >
                {isOpen ? (
                    // Close (X) icon
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <line
                            x1="5"
                            y1="5"
                            x2="19"
                            y2="19"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                        <line
                            x1="19"
                            y1="5"
                            x2="5"
                            y2="19"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                ) : (
                    // Chat bubble icon
                    <svg
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            d="M4 5.5C4 4.12 5.12 3 6.5 3h11C18.88 3 20 4.12 20 5.5v7c0 1.38-1.12 2.5-2.5 2.5H11l-3.5 3.2c-.66.6-1.5.11-1.5-.7V15H6.5C5.12 15 4 13.88 4 12.5v-7Z"
                            fill="white"
                            opacity="0.95"
                        />
                        <circle cx="9" cy="9.25" r="0.9" fill="#b88a44" />
                        <circle cx="12.5" cy="9.25" r="0.9" fill="#b88a44" />
                        <circle cx="16" cy="9.25" r="0.9" fill="#b88a44" />
                    </svg>
                )}
            </button>

            {/* Instant custom tooltip on hover */}
            {isHovered && !isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 20 + 56 + 10, // just above the button
                        right: 20,
                        zIndex: 9999,
                        backgroundColor: '#111827',
                        color: 'white',
                        padding: '6px 10px',
                        borderRadius: 9999,
                        fontSize: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                    }}
                >
                    Chat with us
                </div>
            )}

            {/* Chat iframe, toggled by button */}
            {isOpen && (
                <iframe
                    src="https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2026/02/10/10/20260210105727-E9BC25QE.json"
                    style={{
                        position: 'fixed',
                        bottom: 96, // above the button
                        right: 20,
                        width: 350,
                        height: 500,
                        border: 'none',
                        borderRadius: '12px',
                        zIndex: 9999,
                        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                        maxWidth: '95vw',
                        maxHeight: '80vh',
                    }}
                    title="Unik Toys Chatbot"
                />
            )}
        </>
    );
}
