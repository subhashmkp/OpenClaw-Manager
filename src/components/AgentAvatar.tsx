'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import clsx from 'clsx';
import { useMemo } from 'react';

type AgentStatus = 'IDLE' | 'THINKING' | 'WORKING' | 'SUCCESS';

interface AgentAvatarProps {
    status: AgentStatus;
    className?: string;
    size?: number;
}

export default function AgentAvatar({ status, className, size = 120 }: AgentAvatarProps) {

    // Animation variants
    const containerVariants: Variants = {
        IDLE: {
            y: [0, -10, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        THINKING: {
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        WORKING: {
            scale: 1,
            y: 0,
            transition: { duration: 0.5 }
        },
        SUCCESS: {
            scale: [1, 1.2, 1],
            transition: { duration: 0.5, type: "spring" }
        }
    };

    const glowVariants: Variants = {
        IDLE: {
            opacity: [0.5, 0.8, 0.5],
            boxShadow: "0 0 20px rgba(0, 255, 65, 0.3)",
            transition: {
                duration: 3,
                repeat: Infinity
            }
        },
        THINKING: {
            opacity: 0.8,
            boxShadow: "0 0 30px rgba(0, 243, 255, 0.5)",
            transition: { duration: 0.5 }
        },
        WORKING: {
            opacity: 1,
            boxShadow: ["0 0 20px rgba(0, 255, 65, 0.4)", "0 0 50px rgba(0, 255, 65, 0.8)", "0 0 20px rgba(0, 255, 65, 0.4)"],
            transition: {
                duration: 0.2, // Fast pulse
                repeat: Infinity
            }
        },
        SUCCESS: {
            opacity: 1,
            boxShadow: "0 0 60px rgba(0, 255, 65, 1)",
            borderColor: "#00ff41",
            transition: { duration: 0.5 }
        }
    };

    const ringVariants: Variants = {
        WORKING: {
            rotate: 360,
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
            }
        }
    };


    return (
        <div className={clsx("relative flex items-center justify-center", className)} style={{ width: size + 40, height: size + 40 }}>
            {/* Outer Rotating Ring (Only visible when WORKING) */}
            {status === 'WORKING' && (
                <motion.div
                    variants={ringVariants}
                    animate="WORKING"
                    className="absolute inset-0 rounded-full border-2 border-dashed border-neon-green/50"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            {/* Main Avatar Container */}
            <motion.div
                variants={containerVariants}
                animate={status}
                className="relative z-10 rounded-full"
            >
                {/* Glowing Border/Background */}
                <motion.div
                    variants={glowVariants}
                    animate={status}
                    className="absolute inset-0 rounded-full border-2 border-neon-green/30 bg-black"
                />

                {/* Avatar Image */}
                <div className="relative overflow-hidden rounded-full border border-neon-green/50 bg-black/80 backdrop-blur-sm p-1">
                    <Image
                        src="/robot.png"
                        alt="AI Agent"
                        width={size}
                        height={size}
                        className="rounded-full object-cover"
                        priority
                    />
                </div>

                {/* Success Check Overlay */}
                {status === 'SUCCESS' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -right-2 -bottom-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-neon-green text-black"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </motion.div>
                )}
            </motion.div>

            {/* Status Label (Optional) */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-mono font-bold tracking-widest text-neon-green/80">
                {status}
            </div>
        </div>
    );
}
