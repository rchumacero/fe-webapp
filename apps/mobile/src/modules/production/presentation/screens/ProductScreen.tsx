import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  TextInput, 
  Modal, 
  Pressable, 
  FlatList,
  Alert
} from 'react-native';
import { useTranslation } from '@kplian/i18n';
import { MainLayout } from '../../../../shared/layout/MainLayout';
import { Colors, Spacing, Typography } from '../../../../shared/theme/constants';
import { ProductRepositoryImpl } from '@kplian/infrastructure';
import { Product, loadDomainParameters, getBatchParameters } from '@kplian/core';
import { Ionicons } from '@expo/vector-icons';
import { useVendor } from '../../../../shared/auth/AuthContext';

const productRepo = new ProductRepositoryImpl();

interface ProductScreenProps {
  onBack: () => void;
  onNavigate?: (route: string) => void;
}

export default function ProductScreen({ onBack, onNavigate }: ProductScreenProps) {
  const { t } = useTranslation();
  const { vendor: vendorId } = useVendor();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown options loaded from parameters
  const [productTypes, setProductTypes] = useState<any[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<any[]>([]);

  // Form State
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState('');
  const [formUnitMeasure, setFormUnitMeasure] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Dropdown Picker Modal State
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    data: any[];
    onSelect: (value: string) => void;
    selectedValue: string;
  }>({
    visible: false,
    title: '',
    data: [],
    onSelect: () => {},
    selectedValue: '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let data: Product[] = [];
      if (searchQuery.trim()) {
        const result = await productRepo.search({
          vendorCode: vendorId || undefined,
          name: searchQuery,
          size: 50
        });
        data = result.content || result.data || result.results || [];
      } else {
        data = await productRepo.getAll();
        if (vendorId) {
          data = data.filter(p => p.vendorCode === vendorId);
        }
      }
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, vendorId]);

  // Load Domain Parameters
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const mapped = await loadDomainParameters(
          getBatchParameters,
          [
            { fullCode: 'PR/GEN/TYP' },
            { fullCode: 'GEN/MAIN/MEA' }
          ]
        );
        
        if (mapped['PR/GEN/TYP']) {
          setProductTypes(mapped['PR/GEN/TYP']);
        }
        if (mapped['GEN/MAIN/MEA']) {
          setUnitMeasures(mapped['GEN/MAIN/MEA']);
        }
      } catch (error) {
        console.error('Failed to load parameters:', error);
      }
    };
    fetchParameters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreateModal = () => {
    setSelectedProduct(null);
    setFormName('');
    setFormCode('');
    setFormType(productTypes[0]?.CODE || productTypes[0]?.code || '');
    setFormUnitMeasure(unitMeasures[0]?.CODE || unitMeasures[0]?.code || '');
    setFormDescription('');
    setModalMode('create');
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormName(product.name);
    setFormCode(product.code);
    setFormType(product.type || '');
    setFormUnitMeasure(product.unitMeasureCode || '');
    setFormDescription(product.description || '');
    setModalMode('edit');
  };

  const openDetailModal = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('detail');
  };

  const handleSave = async () => {
    if (!formName.trim() || !formCode.trim()) {
      Alert.alert('Error', 'Name and Code are required.');
      return;
    }

    setLoading(true);
    try {
      if (modalMode === 'create') {
        await productRepo.create({
          vendorCode: vendorId || 'SYSTEM',
          code: formCode,
          name: formName,
          type: formType || undefined,
          unitMeasureCode: formUnitMeasure || undefined,
          description: formDescription || undefined
        });
        Alert.alert('Success', 'Product created successfully.');
      } else if (modalMode === 'edit' && selectedProduct) {
        await productRepo.update({
          id: selectedProduct.id,
          vendorCode: selectedProduct.vendorCode,
          code: formCode,
          name: formName,
          type: formType || undefined,
          unitMeasureCode: formUnitMeasure || undefined,
          description: formDescription || undefined
        });
        Alert.alert('Success', 'Product updated successfully.');
      }
      setModalMode(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Error', 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await productRepo.delete(id);
              Alert.alert('Success', 'Product deleted successfully.');
              setModalMode(null);
              fetchProducts();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const openDropdownPicker = (
    title: string,
    data: any[],
    selectedValue: string,
    onSelect: (val: string) => void
  ) => {
    setPickerModal({
      visible: true,
      title,
      data,
      selectedValue,
      onSelect,
    });
  };

  const getParamLabel = (data: any[], val: string) => {
    const item = data.find(
      i => (i.CODE || i.code) === val
    );
    return item ? (item.NAME || item.name || item.description || val) : val;
  };

  return (
    <MainLayout headerTitle={t('production.product.title', 'Product Management')}>
      <TouchableOpacity style={styles.backLink} onPress={onBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.muted} />
        <Text style={styles.backLinkText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Products</Text>
        <TouchableOpacity testID="add-product-button" style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.muted} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search by name or code..."
          placeholderTextColor={Colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color={Colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyText}>No products found.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {products.map(product => (
            <TouchableOpacity 
              key={product.id} 
              style={styles.productCard}
              onPress={() => openDetailModal(product)}
            >
              <View style={styles.productIcon}>
                <Ionicons name="cube" size={24} color={Colors.primary} />
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDesc}>Code: {product.code}</Text>
                {product.type && (
                  <Text style={styles.typeTag}>
                    {getParamLabel(productTypes, product.type)}
                  </Text>
                )}
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.iconButton} 
                  onPress={(e) => {
                    e.stopPropagation();
                    onNavigate?.(`/production/product/${product.id}/product-configuration`);
                  }}
                >
                  <Ionicons name="settings-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => openEditModal(product)}>
                  <Ionicons name="create-outline" size={20} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(product.id)}>
                  <Ionicons name="trash-outline" size={20} color={Colors.destructive} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Form (Create / Edit) & Detail Modals */}
      <Modal
        visible={modalMode !== null}
        animationType="slide"
        onRequestClose={() => setModalMode(null)}
      >
        <SafeAreaWrapper style={styles.modalRoot}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalMode(null)}>
              <Ionicons name="close" size={28} color={Colors.muted} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {modalMode === 'create' && 'Create Product'}
              {modalMode === 'edit' && 'Edit Product'}
              {modalMode === 'detail' && 'Product Details'}
            </Text>
            {modalMode !== 'detail' ? (
              <TouchableOpacity onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 28 }} />
            )}
          </View>

          <ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
            {modalMode === 'detail' && selectedProduct ? (
              <View style={styles.detailCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name</Text>
                  <Text style={styles.detailValue}>{selectedProduct.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Code</Text>
                  <Text style={styles.detailValue}>{selectedProduct.code}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {getParamLabel(productTypes, selectedProduct.type || '') || 'None'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Unit of Measure</Text>
                  <Text style={styles.detailValue}>
                    {getParamLabel(unitMeasures, selectedProduct.unitMeasureCode || '') || 'None'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{selectedProduct.description || 'None'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vendor Code</Text>
                  <Text style={styles.detailValue}>{selectedProduct.vendorCode}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Type', productTypes, formType, setFormType)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(productTypes, formType) || 'Select Type...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Code</Text>
                <TextInput 
                  style={styles.textInput}
                  value={formCode}
                  onChangeText={setFormCode}
                  placeholder="Product Code"
                  placeholderTextColor={Colors.muted}
                />

                <Text style={styles.inputLabel}>Name</Text>
                <TextInput 
                  style={styles.textInput}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Product Name"
                  placeholderTextColor={Colors.muted}
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput 
                  style={[styles.textInput, styles.textArea]}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Product Description"
                  placeholderTextColor={Colors.muted}
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.inputLabel}>Unit of Measure</Text>
                <TouchableOpacity 
                  style={styles.dropdownTrigger}
                  onPress={() => openDropdownPicker('Select Unit', unitMeasures, formUnitMeasure, setFormUnitMeasure)}
                >
                  <Text style={styles.dropdownValue}>
                    {getParamLabel(unitMeasures, formUnitMeasure) || 'Select Unit...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={Colors.muted} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          {/* Dynamic Selector Modal for Dropdowns nested inside to display on top on iOS */}
          <Modal
            visible={pickerModal.visible}
            transparent
            animationType="fade"
            onRequestClose={() => setPickerModal(p => ({ ...p, visible: false }))}
          >
            <Pressable 
              style={styles.pickerOverlay} 
              onPress={() => setPickerModal(p => ({ ...p, visible: false }))}
            >
              <View style={styles.pickerContent}>
                <Text style={styles.pickerTitle}>{pickerModal.title}</Text>
                <View style={styles.pickerDivider} />
                <FlatList
                  data={pickerModal.data}
                  keyExtractor={(item, idx) => (item.CODE || item.code || idx.toString())}
                  renderItem={({ item }) => {
                    const code = item.CODE || item.code;
                    const name = item.NAME || item.name || item.description || code;
                    const isSelected = pickerModal.selectedValue === code;

                    return (
                      <TouchableOpacity 
                        style={[styles.pickerItem, isSelected && styles.activePickerItem]} 
                        onPress={() => {
                          pickerModal.onSelect(code);
                          setPickerModal(p => ({ ...p, visible: false }));
                        }}
                      >
                        <Text style={[styles.pickerLabel, isSelected && styles.activePickerLabel]}>
                          {name}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </Pressable>
          </Modal>
        </SafeAreaWrapper>
      </Modal>
    </MainLayout>
  );
}

// Wrapper to prevent iOS top notches overlaps
const SafeAreaWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => {
  return <View style={[{ flex: 1, backgroundColor: Colors.background, paddingTop: 40 }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: 4,
  },
  backLinkText: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: 'medium',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.xl,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    color: Colors.muted,
    marginTop: 12,
    fontSize: Typography.sizes.md,
  },
  scroll: {
    flex: 1,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  productDesc: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },
  typeTag: {
    color: Colors.primary,
    fontSize: Typography.sizes.xs,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  // Modal layout
  modalRoot: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: 'bold',
  },
  saveText: {
    color: Colors.primary,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
  },
  modalFormContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  formGroup: {
    gap: Spacing.md,
  },
  inputLabel: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.card,
    color: Colors.foreground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: Typography.sizes.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
  },
  dropdownValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
  },
  // Detail card
  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  detailRow: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  detailLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
  },
  detailValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.md,
    fontWeight: 'bold',
    marginTop: 2,
  },
  // Picker modal styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  pickerContent: {
    width: '100%',
    maxHeight: '60%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerTitle: {
    color: '#fff',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  pickerDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  pickerItem: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.xs,
  },
  activePickerItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  pickerLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  activePickerLabel: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
});
