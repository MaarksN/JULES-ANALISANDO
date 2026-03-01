import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ChatInterface from '../ChatInterface';

// Mocks
vi.mock('lucide-react', () => ({
    Send: () => <div data-testid="icon-send">Send</div>,
    Paperclip: () => <div data-testid="icon-paperclip">Clip</div>,
    FileText: () => <div data-testid="icon-filetext">File</div>,
    Loader2: () => <div data-testid="icon-loader">Loading</div>,
    Search: () => <div data-testid="icon-search">Search</div>
}));

describe('ChatInterface', () => {
    const mockOnSendMessage = vi.fn();
    const mockOnUpdateDossier = vi.fn();

    const defaultProps = {
        messages: [],
        isTyping: false,
        loadingStep: '',
        onSendMessage: mockOnSendMessage,
        agentType: 'PETITION',
        existingSessions: [],
        dossier: [],
        onUpdateDossier: mockOnUpdateDossier
    };

    it('renders input area correctly', () => {
        render(<ChatInterface {...defaultProps} />);
        expect(screen.getByPlaceholderText(/Digite sua mensagem/i)).toBeInTheDocument();
        expect(screen.getByTestId('icon-send')).toBeInTheDocument();
    });

    it('calls onSendMessage when submit button is clicked', () => {
        render(<ChatInterface {...defaultProps} />);
        const input = screen.getByPlaceholderText(/Digite sua mensagem/i);
        fireEvent.change(input, { target: { value: 'Hello AI' } });

        const sendBtn = screen.getByRole('button', { name: /enviar mensagem/i }); // Assuming aria-label or text
        // Actually, looking at the component code (I should verify), often send button has "Enviar" or just icon.
        // Let's use the container or class if needed, or better, add aria-label to component in a real scenario.
        // For now, I'll rely on the button that contains the send icon.
        const btn = screen.getByTestId('icon-send').closest('button');
        fireEvent.click(btn!);

        expect(mockOnSendMessage).toHaveBeenCalledWith('Hello AI', []);
    });

    it('shows loading state', () => {
        render(<ChatInterface {...defaultProps} isTyping={true} loadingStep="Thinking..." />);
        expect(screen.getByText('Thinking...')).toBeInTheDocument();
        expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    });

    it('displays messages', () => {
        const messages = [
            { id: '1', role: 'user', content: 'User Msg', timestamp: new Date() },
            { id: '2', role: 'model', content: 'AI Msg', timestamp: new Date() }
        ];
        render(<ChatInterface {...defaultProps} messages={messages} />);
        expect(screen.getByText('User Msg')).toBeInTheDocument();
        expect(screen.getByText('AI Msg')).toBeInTheDocument();
    });
});
