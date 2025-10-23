import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Worker
global.Worker = vi.fn(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

// Mock browser APIs
global.URL.createObjectURL = vi.fn(() => 'mocked-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Web Speech API
global.SpeechRecognition = vi.fn(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

global.webkitSpeechRecognition = global.SpeechRecognition;

// Mock MediaRecorder
global.MediaRecorder = vi.fn(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  state: 'inactive',
}));

// Mock navigator.mediaDevices
global.navigator.mediaDevices = {
  getUserMedia: vi.fn(() => Promise.resolve({
    getTracks: () => [],
    getAudioTracks: () => [],
    getVideoTracks: () => [],
  })),
};

// Mock geolocation
global.navigator.geolocation = {
  getCurrentPosition: vi.fn((success) => success({
    coords: {
      latitude: 51.1,
      longitude: 45.3,
    }
  })),
};

// Mock fetch
global.fetch = vi.fn();

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});