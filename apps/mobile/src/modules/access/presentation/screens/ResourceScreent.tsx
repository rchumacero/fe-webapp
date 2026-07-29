import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, Pressable, Modal } from "react-native";
import { MainLayout } from "../../../../shared/layout/MainLayout";
import { styles } from '../../resources/styles'
import React, { useCallback, useEffect, useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from "../../../../shared/theme/constants";
import { ResourceRepositoryImpl } from '@kplian/infrastructure';
import { CreateResourceDto, Resource } from "@kplian/core/src/modules/access/entities/Resource";
import { ResourceDetailView } from "../../resources/componets/ResourceDetailView";
import { ResourceCreateForm } from "../../resources/componets/ResourceCreateForm";

const resourceRepository = new ResourceRepositoryImpl()

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



const titleText = 'Resources';
export default function ResourceScreen({ onBack, onNavigate }: ResourceScreenProps) {
	const [resources, setResources] = useState<Resource[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [error, setError] = useState('')
	const [selectedResource, setSelectedResource] = useState<Resource>();
	const [activeMenuResource, setActiveMenuResource] = useState<any>(null);

	const [activeMenuId, setActiveMenuId] = useState(null);

	const [modalMode, setModalMode] = useState<'create' | 'edit' | 'detail' | null>(null);

	// Resource Form State
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

	const handleToggleMenu = useCallback((resourceId) => {
		setActiveMenuId(prev => prev === resourceId ? null : resourceId);
	}, []);

	const openCreateModal = () => {
		setModalMode('create');
	}


	const handleCloseMenu = useCallback(() => {
		setActiveMenuId(null);
	}, []);

	const handleSave = useCallback(async () => {
		setLoading(true)
		try {
			if (modalMode === 'create') {
				const resource: CreateResourceDto = {
					code: form.code,
					description: form.description,
					name: form.name,
					endpoint: form.endpoint,
					restricted: form.restricted,
					type: form.type,
					menuId: "",
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
					menuId: "",
					moduleCode: "CRM",
					resourceId: ""
				}
				await resourceRepository.update(selectedResource.id, resource)
			}
			setModalMode(null)
		} catch (error) {
			console.error('Error saving resource:', error);
		} finally {
			setLoading(false)
		}

	}, [])

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

	const handleDelete = useCallback((resource: Resource) => {
		handleCloseMenu();
	}, [handleCloseMenu]);

	useEffect(() => {
		getResources();
	}, []);

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
							<TouchableOpacity onPress={handleSave}>
								<Text style={styles.saveText}>Save</Text>
							</TouchableOpacity>
						) : (
							<View style={{ width: 28 }} />
						)}
					</View>

					<ScrollView style={styles.modalFormContent} contentContainerStyle={{ paddingBottom: 60 }}>
						{modalMode === 'detail' ? (
							<ResourceDetailView
								selectedResource={selectedResource}
								typeOptions={[]} />
						) : (
							<ResourceCreateForm
								form={form}
								updateField={updateField}
								menuOptions={[]}
								moduleOptions={[]}
								openDropdownPicker={() => { }}
								typeOptions={[]}

							/>
						)}
					</ScrollView>

					{/* {pickerModal.visible && renderPickerModal()} */}
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
												onPress={() => setActiveMenuId(null)}
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