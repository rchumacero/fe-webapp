import React, { useCallback, useEffect, useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { getBatchParameters, loadDomainParameters, MenuResponseDTO } from "@kplian/core";
import { CreateResourceDto, Resource } from "@kplian/core/src/modules/access/entities/Resource";
import { MenuRepositoryImpl, ResourceRepositoryImpl } from '@kplian/infrastructure';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useVendor } from "../../../../shared/auth/AuthContext";
import { MainLayout } from "../../../../shared/layout/MainLayout";
import { Colors, Spacing } from "../../../../shared/theme/constants";
import { ResourceCreateForm } from "../../resources/componets/ResourceCreateForm";
import { ResourceDetailView } from "../../resources/componets/ResourceDetailView";
import { styles } from '../../resources/styles';
import { Option } from "../../resources/types";

const resourceRepository = new ResourceRepositoryImpl()
const menuRepository = new MenuRepositoryImpl()

interface ResourceScreenProps {
	onBack: () => void;
	onNavigate?: (route: string) => void;
}

export interface ResourceFormState {
	code: string;
	description: string;
	type: string;
	name: string;
	moduleCode: string;
	restricted: boolean;
	endpoint: string;
	menuId: string;
}

export const initialResourceFormState: ResourceFormState = {
	code: '',
	description: '',
	type: '',
	name: '',
	moduleCode: '',
	restricted: false,
	endpoint: '',
	menuId: '',
};

interface PickerModal {
	visible: boolean;
	title: string;
	data: any[];
	selectedValue: string;
	field: keyof ResourceFormState | null;
}


interface Parameter {
	row: number;
	code: string;
	name: string;
}

type ParameterResponse = Record<string, Parameter[]>;



const PARAMETER_RESOURCE_TYPE = 'SEC/MAIN/RTYP';
const PARAMETER_MODULE = 'GEN/MAIN/MOD';

const titleText = 'Resources';
export default function ResourceScreen({ onBack, onNavigate }: ResourceScreenProps) {

	const { vendor: vendorId, vendorCode } = useVendor();

	const [resources, setResources] = useState<Resource[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [error, setError] = useState('')
	const [selectedResource, setSelectedResource] = useState<Resource>();
	const [activeMenuResource, setActiveMenuResource] = useState<any>(null);
	const [menus, setMenus] = useState<MenuResponseDTO[]>([]);
	const [parameters, setParameters] = useState<ParameterResponse>();

	const [menuOptions, setMenuOptions] = useState<Option[]>([]);
	const [resourceTypeOptions, setResourceTypeOptions] = useState<Option[]>([]);
	const [resourceModuleOptions, setResoruceModuleOptions] = useState<Option[]>([])

	const [pickerModal, setPickerModal] = useState<PickerModal>({
		visible: false,
		title: '',
		data: [],
		selectedValue: '',
		field: null,
	});
	const [activeMenuId, setActiveMenuId] = useState(null);
	const [modalMode, setModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);
	const [form, setForm] = useState<ResourceFormState>(initialResourceFormState);

	const updateField = useCallback(
		<K extends keyof ResourceFormState>(
			field: K,
			value: ResourceFormState[K]
		) => {
			setForm(prev => ({
				...prev,
				[field]: value,
			}));
		},
		[]
	);

	const getParameters = useCallback(async () => {
		if (!vendorId) return
		try {

			const mapped = await loadDomainParameters(
				getBatchParameters,
				[
					{ fullCode: PARAMETER_RESOURCE_TYPE },
					{ fullCode: PARAMETER_MODULE },
				]
			);

			setParameters(mapped)

		} catch (error) {
			console.log("Failed to load parameters:", error)
		}

	}, [])

	useEffect(() => {
		if (!parameters) { return }
		if (parameters[PARAMETER_RESOURCE_TYPE]) {
			const options = parameters[PARAMETER_RESOURCE_TYPE].map((item: any) => ({
				code: item.code,
				label: item.name
			}))
			console.log(PARAMETER_RESOURCE_TYPE, options);
			setResourceTypeOptions(options)
		}

		if (parameters[PARAMETER_MODULE]) {
			const options = parameters[PARAMETER_MODULE].map((item: any) => ({
				code: item.code,
				label: item.name
			}))
			console.log(PARAMETER_MODULE, options);
			setResoruceModuleOptions(options)
		}
	}, [parameters])


	const openCreateModal = () => {
		setModalMode('create');
		getMenus();
	}


	useEffect(() => {
		setMenuOptions(menus.map((item) => ({ code: item.id, label: item.name })));
	}, [menus]);


	const handleCloseMenu = useCallback(() => {
		setActiveMenuId(null);
	}, []);

	const handleSaveResource = useCallback(async () => {
		console.log("save button")
		setLoading(true)
		try {
			console.log("modalmode", modalMode)
			if (modalMode === "create") {
				const resource: CreateResourceDto = {
					code: form.code,
					description: form.description,
					name: form.name,
					endpoint: form.endpoint,
					restricted: form.restricted,
					type: "view",
					// type: form.type,
					menuId: "4b8b92b7-74ec-46ba-a2d2-12166a16879c",
					moduleCode: "CRM",
					resourceId: ""
				}
				await resourceRepository.create(resource)
			} else if (modalMode === 'edit' && selectedResource) {
				const resource: CreateResourceDto = {
					code: selectedResource.code,
					description: form.description,
					name: form.name,
					endpoint: form.endpoint,
					restricted: form.restricted,
					type: form.type,
					menuId: form.menuId,
					moduleCode: form.moduleCode,
					resourceId: ""
				}
				await resourceRepository.update(selectedResource.id, resource)
			}
			setModalMode(null)
			getResources()
		} catch (error) {
			console.error('Error saving resource:', error);
		} finally {
			setLoading(false)
		}

	}, [modalMode, form])

	const handleEditResource = (resource: Resource) => {
		setActiveMenuResource(null);
		setSelectedResource(resource);
		setForm({
			code: resource.code,
			description: resource.description,
			type: resource.type,
			name: resource.name,
			moduleCode: resource.moduleCode,
			restricted: resource.restricted,
			endpoint: resource.endpoint,
			menuId: resource.menuId,
		});

		openEditModal(resource);
	};


	const handleDetailResource = (resource: Resource) => {
		setActiveMenuResource(null);
		setSelectedResource(resource);
		openDetailModal(resource);
	};

	const openDetailModal = (resource: Resource) => {
		setModalMode('detail');
	};

	const openEditModal = (resource: Resource) => {
		setModalMode('edit')
	}

	const handleDetail = useCallback((resource: Resource) => {
		handleCloseMenu();
	}, [handleCloseMenu]);

	const handleDeleteResource = useCallback(async (resource: Resource) => {
		try {
			await resourceRepository.delete(resource.id)
			setResources(prev => prev.filter(r => r.id !== resource.id));
			handleCloseMenu();
		} catch (error) {
			console.error('Error:', error);
		}
	}, [handleCloseMenu]);

	useEffect(() => {
		getResources();
		getParameters();
	}, []);

	const getMenus = useCallback(async () => {
		try {
			const data = await menuRepository.findAll()
			setMenus(data)

		} catch (error) {
			console.log('Failed to fetch menus', error)
		}
	}, [])

	const getResources = useCallback(async () => {
		setLoading(true);
		try {
			const data = await resourceRepository.findAll();
			setResources(data);
		} catch (error) {
			console.error('Failed to fetch resources', error);
			setError('Failed to load resources');
		} finally {
			setLoading(false);
		}
	}, []);

	function openDropDowPicker(title: string, options: Option[], value: string, field: keyof ResourceFormState) {
		console.log(title, options, value, field)

		setPickerModal({
			visible: true,
			title,
			data: options,
			selectedValue: value,
			field,
		});
	}

	const renderPickerModal = () => (
		<View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
			<Pressable
				style={styles.pickerOverlay}
				onPress={() => setPickerModal(p => ({ ...p, visible: false }))}
			>
				<View style={styles.pickerContent}>
					<Text style={styles.pickerTitle}>{pickerModal.title}</Text>
					<View style={styles.pickerDivider} />
					<FlatList
						data={pickerModal.data}
						keyExtractor={(item, idx) => ((item.CODE || item.id || idx).toString())}
						renderItem={({ item }) => {
							const code = item.code;
							const label = item.label;
							const isSelected = pickerModal.selectedValue === code;

							return (
								<TouchableOpacity
									style={[styles.pickerItem, isSelected && styles.activePickerItem]}
									onPress={() => {
										// pickerModal.onSelect(code);
										updateField(pickerModal.field as keyof ResourceFormState, code);
										setPickerModal(p => ({ ...p, visible: false }));
									}}
								>
									<Text style={[styles.pickerLabel, isSelected && styles.activePickerLabel]}>
										{label}
									</Text>
								</TouchableOpacity>
							);
						}}
					/>
				</View>
			</Pressable>
		</View>
	);


	if (modalMode) {
		return <MainLayout>
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
							{modalMode === 'create' && 'Create Resource'}
							{modalMode === 'edit' && 'Edit Resource'}
							{modalMode === 'detail' && 'Resource Details'}
						</Text>
						{modalMode !== 'detail' ? (
							<TouchableOpacity onPress={handleSaveResource}>
								<Text style={styles.saveText}>Save</Text>
							</TouchableOpacity>
						) : (
							<View style={{ width: 28 }} />
						)}
					</View>

					<ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
						{modalMode === 'detail' && selectedResource ? (
							<ResourceDetailView
								selectedResource={selectedResource}
								typeOptions={resourceTypeOptions} />
						) : (
							<ResourceCreateForm
								form={form}
								updateField={updateField}
								openDropdownPicker={(title, options, value, field) => { openDropDowPicker(title, options, value, field) }}
								menuOptions={menuOptions}
								moduleOptions={resourceModuleOptions}
								typeOptions={resourceTypeOptions}

							/>
						)}
					</ScrollView>

					{pickerModal.visible && renderPickerModal()}
				</SafeAreaWrapper>
			</Modal>
		</MainLayout>
	}

	return (
		<MainLayout headerTitle={titleText} onNavigate={onNavigate}>

			<TouchableOpacity style={styles.backLink} onPress={onBack}>
				<Ionicons name="arrow-back" size={20} color={Colors.muted} />
				<Text style={styles.backLinkText}>Volver</Text>
			</TouchableOpacity>

			<View style={styles.headerRow}>
				<Text style={styles.sectionTitle}>{titleText}</Text>
				<TouchableOpacity
					testID="add-resource-button"
					style={styles.addButton}
					onPress={openCreateModal}>
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

			{loading && resources.length === 0 ? (

				<View style={styles.loader}>
					<ActivityIndicator size="large" color={Colors.primary} />
				</View>
			) : resources.length === 0 ? (

				<View style={styles.emptyState}>
					<Ionicons name="business-outline" size={48} color={Colors.muted} />
					<Text style={styles.emptyText}>No Resource found.</Text>
				</View>
			) :
				<ScrollView style={styles.scroll}>
					{resources.map(resource => (
						<View
							key={resource.id}
							style={[styles.Card, { flexDirection: 'column', alignItems: 'stretch', zIndex: activeMenuResource === resource.id ? 100 : 1, overflow: 'visible', paddingBottom: activeMenuResource === resource.id ? 100 : Spacing.md }]}

						>
							<View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>

								<View style={styles.Info}>
									<Text style={styles.Name}>{resource.name}</Text>
									<Text style={styles.Desc}>{resource.code}</Text>
									<Text style={styles.Desc}>{resource.endpoint}</Text>
									<Text style={styles.Desc}>{resource.type}</Text>
								</View>
								<View style={{ position: 'relative', zIndex: 999 }}>
									<TouchableOpacity
										style={[styles.iconButton, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 10, padding: 8 }]}
										onPress={(e) => {
											e.stopPropagation();
											setActiveMenuResource(true)
											setActiveMenuResource(activeMenuResource === resource.id ? null : resource.id);
										}}
									>
										<Ionicons name="ellipsis-vertical" size={20} color={Colors.foreground} />
									</TouchableOpacity>
								</View>

								{
									activeMenuResource === resource.id && (
										<>
											<Pressable
												style={{
													position: 'absolute',
													top: -1000,
													left: -1000,
													right: -1000,
													bottom: -1000,
													zIndex: 998,
												}}
												onPress={() => setActiveMenuResource(null)}
											/>


											<View style={[styles.dropdownMenu, { zIndex: 9999 }]}>
												<TouchableOpacity
													style={styles.dropdownMenuItem}
													onPress={(e) => {
														e.stopPropagation();
														handleEditResource(resource)
													}}
												>
													<Text style={styles.dropdownMenuText}>Edit</Text>
												</TouchableOpacity>

												<TouchableOpacity
													style={styles.dropdownMenuItem}
													onPress={(e) => {
														e.stopPropagation();
														handleDetailResource(resource)
													}}
												>
													<Text style={styles.dropdownMenuText}>Detail</Text>
												</TouchableOpacity>

												<TouchableOpacity
													style={styles.dropdownMenuItem}
													onPress={(e) => {
														e.stopPropagation();
														handleDeleteResource(resource);
														setActiveMenuResource(null)
													}}
												>
													<Text style={[styles.dropdownMenuText, { color: Colors.destructive }]}>Delete</Text>
												</TouchableOpacity>
											</View>
										</>
									)
								}

							</View>
						</View>
					))}
				</ScrollView>
			}

		</MainLayout >
	)

}

const SafeAreaWrapper = ({ children, style }: { children: React.ReactNode; style?: any }) => {
	return <View style={[{ flex: 1, backgroundColor: Colors.background, paddingTop: 40 }, style]}>{children}</View>;
};