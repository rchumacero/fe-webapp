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

const mockCreateOrder = jest.fn().mockResolvedValue({});
const mockGetAllOrders = jest.fn().mockResolvedValue([]);

jest.mock('@kplian/infrastructure', () => {
  return {
    createApiClient: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: [] }),
      post: jest.fn().mockResolvedValue({ data: [] }),
    }),
    OperationOrderRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: mockGetAllOrders,
      create: mockCreateOrder,
      delete: jest.fn().mockResolvedValue({}),
      getProductsByOrderId: jest.fn().mockResolvedValue([]),
      getDetailsByOrderId: jest.fn().mockResolvedValue([]),
    })),
    ProductRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([])
    })),
    OperationRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([])
    })),
    OperationOrderProductRepositoryImpl: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({})
    })),
    OperationDetailRepositoryImpl: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({})
    })),
    OperationUnitRepositoryImpl: jest.fn().mockImplementation(() => ({
      getPersonsByVendorId: jest.fn().mockResolvedValue([])
    }))
  };
});

describe('OperationOrderScreen - Order Creation', () => {
  const OperationOrderScreen = require('../OperationOrderScreen').default;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial list and title correctly', async () => {
    const { getByText } = render(
      <OperationOrderScreen onBack={jest.fn()} onNavigate={jest.fn()} />
    );
    expect(getByText('Operation Orders')).toBeTruthy();
  });
});
