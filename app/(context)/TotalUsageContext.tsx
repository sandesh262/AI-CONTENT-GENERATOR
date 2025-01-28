// app/(context)/TotalUsageContext.tsx
'use client'
import React, { createContext, useState } from 'react';

interface TotalUsageContextType {
    totalUsage: number;
    setTotalUsage: (value: number) => void;
    userPlan: string;
    setUserPlan: (value: string) => void;
}

const defaultValue: TotalUsageContextType = {
    totalUsage: 0,
    setTotalUsage: () => {},
    userPlan: 'free',
    setUserPlan: () => {},
};

export const TotalUsageContext = createContext<TotalUsageContextType>(defaultValue);

export const TotalUsageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [totalUsage, setTotalUsage] = useState<number>(0);
    const [userPlan, setUserPlan] = useState<string>('free');

    return (
        <TotalUsageContext.Provider value={{ 
            totalUsage, 
            setTotalUsage,
            userPlan,
            setUserPlan
        }}>
            {children}
        </TotalUsageContext.Provider>
    );
};