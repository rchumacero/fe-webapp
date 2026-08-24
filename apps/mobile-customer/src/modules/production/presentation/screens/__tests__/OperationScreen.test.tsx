import React from 'react';
import { render } from '@testing-library/react-native';

// Mock react-native Modal to render children inline for testing
jest.mock('react-native/Libraries/Modal/Modal', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockModal = ({ children, visible, testID }: any) => {
    return (
      <View testID={testID || "modal"} style={{ display: visible ? 'flex' : 'none' }}>
        {children}
      </View>
    );
  };
  return {
    default: MockModal,
    __esModule: true
  };
});

// Mock translation hook
jest.mock('@kplian/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      options: {
        supportedLngs: ['en', 'es']
      }
    }
  }),
  getLanguageLabel: (code: string) => code.toUpperCase(),
  getLanguageFlag: (code: string) => '🏳️'
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
  };
});

// Mock AuthContext
jest.mock('../../../../../shared/auth/AuthContext', () => ({
  useVendor: () => ({
    vendor: 'vendor-uuid-123',
    vendorCode: 'vendor1'
  }),
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@kplian.com' }
  })
}));

// Mock @kplian/core API triggers
jest.mock('@kplian/core', () => {
  const actual = jest.requireActual('@kplian/core');
  return {
    ...actual,
    getBatchParameters: jest.fn().mockResolvedValue({})
  };
});

const mockCreateOp = jest.fn().mockResolvedValue({});
const mockGetAllOps = jest.fn().mockResolvedValue([]);

jest.mock('@kplian/infrastructure', () => {
  return {
    createApiClient: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: [] }),
      post: jest.fn().mockResolvedValue({ data: [] }),
    }),
    OperationRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: mockGetAllOps,
      create: mockCreateOp,
      delete: jest.fn().mockResolvedValue({}),
      getProductsByOperationId: jest.fn().mockResolvedValue([]),
      getExtraCostsByOperationId: jest.fn().mockResolvedValue([]),
    })),
    ProductRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([])
    })),
    WarehouseRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([])
    })),
    OperationProductRepositoryImpl: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({})
    })),
    OperationExtraCostRepositoryImpl: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({})
    }))
  };
});

describe('OperationScreen - Initial Load', () => {
  const OperationScreen = require('../OperationScreen').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and view layout correctly', () => {
    const { getByText } = render(
      <OperationScreen onBack={jest.fn()} onNavigate={jest.fn()} />
    );
    expect(getByText('Operations')).toBeTruthy();
  });
});
