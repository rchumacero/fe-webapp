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
const mockCreateUnit = jest.fn().mockResolvedValue({});
const mockGetAllUnits = jest.fn().mockResolvedValue([]);

jest.mock('@kplian/infrastructure', () => {
  return {
    createApiClient: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: [] }),
      post: jest.fn().mockResolvedValue({ data: [] }),
    }),
    OperationUnitRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: mockGetAllUnits,
      create: mockCreateUnit,
      delete: jest.fn().mockResolvedValue({}),
      getOrganizations: jest.fn().mockResolvedValue([
        { code: 'ORG-01', name: 'Test Org' }
      ]),
      getOperatorsByUnitId: jest.fn().mockResolvedValue([]),
      getProductsByUnitId: jest.fn().mockResolvedValue([]),
      getPersonsByVendorId: jest.fn().mockResolvedValue([])
    })),
    WarehouseRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([
        { code: 'W1', name: 'Material' }
      ])
    })),
    ProductRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([])
    })),
    OperationUnitOperatorRepositoryImpl: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({})
    })),
    OperationUnitProductRepositoryImpl: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({})
    }))
  };
});

describe('OperationUnitScreen - CRUD Flow', () => {
  const OperationUnitScreen = require('../OperationUnitScreen').default;

  it('should successfully trigger creation for operation unit', async () => {
    mockCreateUnit.mockClear();

    const { getByTestId, getByPlaceholderText, getByText } = render(
      <OperationUnitScreen onBack={jest.fn()} onNavigate={jest.fn()} />
    );

    const { fireEvent, act, waitFor } = require('@testing-library/react-native');

    // Wait for async dropdown data fetching in useEffect to finish
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Open creation modal
    const addButton = getByTestId('add-unit-button');
    await act(async () => {
      fireEvent.press(addButton);
    });

    await waitFor(() => {
      expect(getByPlaceholderText('Unit Code (e.g. OPU-01)')).toBeTruthy();
    });

    // Populate input field
    const codeInput = getByPlaceholderText('Unit Code (e.g. OPU-01)');
    await act(async () => {
      fireEvent.changeText(codeInput, 'OP-TEST-01');
    });

    // Press save
    const saveButton = getByText('Save');
    await act(async () => {
      fireEvent.press(saveButton);
    });

    // Verify repository call
    expect(mockCreateUnit).toHaveBeenCalledTimes(1);
    expect(mockCreateUnit).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'OP-TEST-01',
        status: 'ACTIVE'
      })
    );
  });
});
