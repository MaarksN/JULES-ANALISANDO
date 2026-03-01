import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import DocumentPreview from '../DocumentPreview';

// Mocks
vi.mock('@tiptap/react', () => ({
    useEditor: () => ({
        getHTML: () => '<p>Mock Content</p>',
        commands: {
            setContent: vi.fn(),
        },
        chain: () => ({
            focus: () => ({
                run: vi.fn()
            })
        })
    }),
    EditorContent: () => <div data-testid="editor-content">Editor</div>
}));

vi.mock('lucide-react', () => ({
    Save: () => <span>Save</span>,
    Download: () => <span>Download</span>,
    Copy: () => <span>Copy</span>,
    FileText: () => <span>File</span>,
    RotateCcw: () => <span>Restore</span>,
    Wand2: () => <span>Magic</span>,
    MoreVertical: () => <span>More</span>
}));

describe('DocumentPreview', () => {
    const mockOnSave = vi.fn();
    const mockOnRestore = vi.fn();
    const mockOnRefine = vi.fn();
    const mockOnSaveTemplate = vi.fn();

    const defaultProps = {
        content: '<p>Test Content</p>',
        userProfile: { name: 'Test User' },
        onSave: mockOnSave,
        versions: [],
        onRestore: mockOnRestore,
        onRefineWithAI: mockOnRefine,
        onSaveTemplate: mockOnSaveTemplate,
        analysisRisks: null
    };

    it('renders editor and toolbar', () => {
        render(<DocumentPreview {...defaultProps} />);
        expect(screen.getByTestId('editor-content')).toBeInTheDocument();
        expect(screen.getByText('Editor Inteligente')).toBeInTheDocument();
    });

    it('renders save button', () => {
        render(<DocumentPreview {...defaultProps} />);
        // Looking for a button that might trigger save.
        // Based on typical UI, there's a Save icon.
        expect(screen.getByText('Salvar')).toBeInTheDocument();
    });
});
