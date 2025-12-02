import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { of } from 'rxjs';
import { ImageUploadPreviewComponent } from './image-upload-preview.component';
import { FaceSwapService } from '@vera/data-access';

// Mock FaceSwapService
const mockFaceSwapService = {
  uploadAndSwap: () => of({
    id: '123',
    status: 'Pending' as const,
    inputImageUrl: 'https://via.placeholder.com/300',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getTaskStatus: () => of({
    id: '123',
    status: 'Completed' as const,
    inputImageUrl: 'https://via.placeholder.com/300',
    outputImageUrl: 'https://via.placeholder.com/300',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

const meta: Meta<ImageUploadPreviewComponent> = {
  component: ImageUploadPreviewComponent,
  title: 'Components/ImageUploadPreview',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ImageUploadPreviewComponent],
      providers: [
        {
          provide: FaceSwapService,
          useValue: mockFaceSwapService,
        },
      ],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<ImageUploadPreviewComponent>;

export const Default: Story = {
  render: () => ({
    template: `<vera-image-upload-preview></vera-image-upload-preview>`,
  }),
};

export const WithContent: Story = {
  render: () => ({
    template: `
      <div class="w-full max-w-2xl">
        <h2 class="text-2xl font-bold mb-4">Face Swap Upload</h2>
        <vera-image-upload-preview></vera-image-upload-preview>
      </div>
    `,
  }),
};
