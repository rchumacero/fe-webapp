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
    vendor: mockVendorCode.value,
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
      'PR/GEN/TYP': [
        { CODE: 'prod', NAME: 'Product' },
        { CODE: 'serv', NAME: 'Service' }
      ],
      'GEN/MAIN/MEA': [
        { CODE: 'Unidad', NAME: 'Unidad' }
      ]
    })
  };
});

const mockCreateProduct = jest.fn().mockResolvedValue({});
const mockGetAllProducts = jest.fn().mockResolvedValue([]);

// Mock API repositories and client
jest.mock('@kplian/infrastructure', () => {
  return {
    createApiClient: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: [] }),
      post: jest.fn().mockResolvedValue({ data: [] }),
      put: jest.fn().mockResolvedValue({ data: [] }),
      delete: jest.fn().mockResolvedValue({ data: [] }),
    }),
    ProductRepositoryImpl: jest.fn().mockImplementation(() => ({
      getAll: mockGetAllProducts,
      search: jest.fn().mockResolvedValue({ content: [] }),
      create: mockCreateProduct
    }))
  };
});

describe('ProductScreen - Product Creation', () => {
  const ProductScreen = require('../ProductScreen').default;

  const testCases = [
    { code: 'P01', name: 'Classic Hamburger', type: 'prod', description: 'Classic Hamburger', unitMeasure: 'Unidad', vendor: 'vendor1' },
    { code: 'P02', name: 'Classic Broasted chicken', type: 'prod', description: 'Classic Broasted chicken', unitMeasure: 'Unidad', vendor: 'vendor1' },
    { code: 'P03', name: 'Salchipapa', type: 'prod', description: 'Salchipapa', unitMeasure: 'Unidad', vendor: 'vendor1' },
    { code: 'P01', name: 'Estetica Integral', type: 'serv', description: 'Estetica Integral', unitMeasure: 'Unidad', vendor: 'vendor3' },
    { code: 'P02', name: 'Odontologia', type: 'serv', description: 'Odontologia', unitMeasure: 'Unidad', vendor: 'vendor3' },
    { code: 'P03', name: 'Oftalmologia', type: 'serv', description: 'Oftalmologia', unitMeasure: 'Unidad', vendor: 'vendor3' }
  ];

  testCases.forEach((tc) => {
    it(`should successfully trigger creation for product: ${tc.code} (${tc.name}) under vendor: ${tc.vendor}`, async () => {
      // Set dynamic vendorCode stub
      mockVendorCode.value = tc.vendor;
      mockCreateProduct.mockClear();

      const { getByTestId, getByPlaceholderText, getByText } = render(
        <ProductScreen onBack={jest.fn()} onNavigate={jest.fn()} />
      );

      const { fireEvent, act, waitFor } = require('@testing-library/react-native');

      // 1. Click on '+' button to open creation modal
      const addButton = getByTestId('add-product-button');
      await act(async () => {
        fireEvent.press(addButton);
      });

      // Wait for modal content to render
      await waitFor(() => {
        expect(getByPlaceholderText('Product Code')).toBeTruthy();
      });

      // 2. Populate form fields
      const codeInput = getByPlaceholderText('Product Code');
      const nameInput = getByPlaceholderText('Product Name');
      const descInput = getByPlaceholderText('Product Description');

      await act(async () => {
        fireEvent.changeText(codeInput, tc.code);
        fireEvent.changeText(nameInput, tc.name);
        fireEvent.changeText(descInput, tc.description);
      });

      // 3. Press save button
      const saveButton = getByText('Save');
      await act(async () => {
        fireEvent.press(saveButton);
      });

      // 4. Assert creation repository call was executed with the expected values
      expect(mockCreateProduct).toHaveBeenCalledTimes(1);
      expect(mockCreateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          vendorCode: tc.vendor,
          code: tc.code,
          name: tc.name,
          description: tc.description
        })
      );
    });
  });
});
