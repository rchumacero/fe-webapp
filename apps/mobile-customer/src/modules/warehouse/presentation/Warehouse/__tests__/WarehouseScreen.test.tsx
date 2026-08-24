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
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
  };
});

const mockVendorCode = { value: 'vendorCode-test' };

// Mock vendor context hook
jest.mock('../../../../../shared/auth/AuthContext', () => ({
  useVendor: () => ({
    vendor: 'vendor-uuid-123',
    vendorCode: mockVendorCode.value
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
    getBatchParameters: jest.fn().mockResolvedValue({
      'WAR/MAIN/ITEM': [],
      'WAR/MAIN/WAT': [
        { CODE: 'raw', NAME: 'Raw Material' },
        { CODE: 'in_progress', NAME: 'In Progress' },
        { CODE: 'finished', NAME: 'Finished Product' }
      ],
      'GEO/LOC/LOC': [
        { CODE: 'LPZ', NAME: 'La Paz' }
      ],
      'WAR/MAIN/TVAL': [
        { CODE: 'FIFO', NAME: 'FIFO Valuation' }
      ]
    })
  };
});

const mockCreateWarehouse = jest.fn().mockResolvedValue({});
const mockGetAllWarehouses = jest.fn().mockResolvedValue([]);

// Mock API repositories and client
jest.mock('@kplian/infrastructure', () => {
  return {
    createApiClient: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: [] }),
      post: jest.fn().mockResolvedValue({ data: [] }),
      put: jest.fn().mockResolvedValue({ data: [] }),
      delete: jest.fn().mockResolvedValue({ data: [] }),
    }),
    WarehouseRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: mockGetAllWarehouses,
      getByVendor: jest.fn().mockResolvedValue([]),
      create: mockCreateWarehouse
    })),
    StockLevelRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([])
    })),
    StockLevelAlertRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: jest.fn().mockResolvedValue([])
    }))
  };
});

describe('WarehouseScreen - Warehouse Creation', () => {
  const WarehouseScreen = require('../WarehouseScreen').default;

  const testCases = [
    { code: 'W1', vendor: 'vendor1', name: 'Material', valuation: 'FIFO', type: 'raw', location: 'LPZ', address: 'Av. Buenos aires # 250' },
    { code: 'W2', vendor: 'vendor1', name: 'Product in Progress', valuation: 'FIFO', type: 'in_progress', location: 'LPZ', address: 'Av. Ormachea #21' },
    { code: 'W3', vendor: 'vendor1', name: 'Finished products', valuation: 'FIFO', type: 'finished', location: 'LPZ', address: 'Achumani calle 22' },
    { code: 'W1', vendor: 'vendor2', name: 'Finisehd products', valuation: 'FIFO', type: 'finished', location: 'LPZ', address: 'Av. Bush esq. Haiti' },
    { code: 'W1', vendor: 'vendor4', name: 'Finisehd products', valuation: 'FIFO', type: 'finished', location: 'LPZ', address: 'Mallasa Av principal' }
  ];

  testCases.forEach((tc) => {
    it(`should successfully trigger creation for warehouse: ${tc.code} (${tc.name}) under vendor: ${tc.vendor}`, async () => {
      // Set dynamic vendorCode stub
      mockVendorCode.value = tc.vendor;
      mockCreateWarehouse.mockClear();

      const { getByTestId, getByPlaceholderText, getByText } = render(
        <WarehouseScreen onBack={jest.fn()} onNavigate={jest.fn()} />
      );

      const { fireEvent, act, waitFor } = require('@testing-library/react-native');

      // 1. Click on '+' button to open creation modal
      const addButton = getByTestId('add-warehouse-button');
      await act(async () => {
        fireEvent.press(addButton);
      });

      // Wait for modal content to render
      await waitFor(() => {
        expect(getByPlaceholderText('Warehouse Code')).toBeTruthy();
      });

      // 2. Populate form fields
      const codeInput = getByPlaceholderText('Warehouse Code');
      const nameInput = getByPlaceholderText('Warehouse Name');
      const addressInput = getByPlaceholderText('Warehouse Address');

      await act(async () => {
        fireEvent.changeText(codeInput, tc.code);
        fireEvent.changeText(nameInput, tc.name);
        fireEvent.changeText(addressInput, tc.address);
      });

      // 3. Press save button
      const saveButton = getByText('Save');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      // 4. Assert creation repository call was executed with the expected values
      expect(mockCreateWarehouse).toHaveBeenCalledTimes(1);
      expect(mockCreateWarehouse).toHaveBeenCalledWith(
        expect.objectContaining({
          vendorCode: tc.vendor,
          code: tc.code,
          name: tc.name,
          address: tc.address
        })
      );
    });
  });
});
