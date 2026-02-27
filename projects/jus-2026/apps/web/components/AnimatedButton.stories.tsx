import type { Meta, StoryObj } from '@storybook/react';
import AnimatedButton from './AnimatedButton';

const meta = {
  title: 'Components/AnimatedButton',
  component: AnimatedButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    icon: { control: 'text' }, // Simple text control for icon name since it's dynamic
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof AnimatedButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Primary Action',
    icon: 'Zap',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Cancel',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    label: 'Saving...',
    isLoading: true,
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    label: 'Delete Item',
    icon: 'Trash2',
  },
};
