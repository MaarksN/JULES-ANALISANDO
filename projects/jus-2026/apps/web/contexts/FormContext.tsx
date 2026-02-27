import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormContextType {
    formData: Record<string, any>;
    setFormData: (key: string, data: any) => void;
    getFormData: (key: string) => any;
    clearFormData: (key: string) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: ReactNode }) => {
    const [formData, setFormDataState] = useState<Record<string, any>>({});

    const setFormData = (key: string, data: any) => {
        setFormDataState(prev => ({ ...prev, [key]: data }));
    };

    const getFormData = (key: string) => {
        return formData[key];
    };

    const clearFormData = (key: string) => {
        setFormDataState(prev => {
            const newState = { ...prev };
            delete newState[key];
            return newState;
        });
    };

    return (
        <FormContext.Provider value={{ formData, setFormData, getFormData, clearFormData }}>
            {children}
        </FormContext.Provider>
    );
};

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};
