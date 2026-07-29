// API Client Factory
export { createApiClient, createWarehouseApiClient, setTokenProvider, setGlobalErrorHandler, setVendorProvider, setLanguageProvider, setTimezoneProvider, lockApi, unlockApi } from './api/client';
export { default as apiClient } from './api/client';

// Security Utilities
export { encrypt, decrypt } from './security/crypto';

// General Utilities
export { getRoute } from './utils/route';

// CRM Repositories
export * from './repositories/crm/commercial/CampaignRepositoryImpl';
export * from './repositories/crm/commercial/CommercialProductRepositoryImpl';
export * from './repositories/crm/commercial/CampaignProductRepositoryImpl';
export * from './repositories/crm/commercial/ScheduleRepositoryImpl';
export * from './repositories/crm/commercial/CollaboratorRepositoryImpl';

// CRM Sales Repositories
export * from './repositories/crm/sales/SaleRepositoryImpl';
export * from './repositories/crm/sales/SaleDetailRepositoryImpl';
export * from './repositories/crm/sales/ExtraChargeRepositoryImpl';
export * from './repositories/crm/sales/PaymentRepositoryImpl';

// Workflow Repositories
export * from './repositories/workflow/CaseRepositoryImpl';
export * from './repositories/workflow/TaskRepositoryImpl';
export * from './repositories/workflow/ExpenseRepositoryImpl';
export * from './repositories/workflow/ForwardRepositoryImpl';
export * from './repositories/workflow/TaskDigitalContentRepositoryImpl';
export * from './repositories/workflow/ProcessRepositoryImpl';
export * from './repositories/workflow/FormRepositoryImpl';
export * from './repositories/workflow/FieldRepositoryImpl';
export * from './repositories/workflow/ValueRepositoryImpl';
export * from './repositories/workflow/MainEntityRepositoryImpl';
export * from './repositories/workflow/EntityStateRepositoryImpl';
export * from './repositories/workflow/StateTransitionRepositoryImpl';

// Warehouse Repositories
export * from './repositories/warehouse/WarehouseRepositoryImpl';
export * from './repositories/warehouse/InventoryRepositoryImpl';
export * from './repositories/warehouse/InventoryDetailRepositoryImpl';
export * from './repositories/warehouse/MovementRepositoryImpl';
export * from './repositories/warehouse/MovementDetailRepositoryImpl';
export * from './repositories/warehouse/MovementExtraCostRepositoryImpl';
export * from './repositories/warehouse/StockLevelRepositoryImpl';
export * from './repositories/warehouse/StockLevelAlertRepositoryImpl';
export * from './repositories/warehouse/WarehouseStockRepositoryImpl';

// Access Resource Repositories
export * from './repositories/access/ResourceRepositoryImpl'

// Production Repositories
export * from './repositories/production/OperationRepositoryImpl';
export * from './repositories/production/OperationDetailRepositoryImpl';
export * from './repositories/production/OperationExtraCostRepositoryImpl';
export * from './repositories/production/OperationOrderRepositoryImpl';
export * from './repositories/production/OperationOrderProductRepositoryImpl';
export * from './repositories/production/OperationProductRepositoryImpl';
export * from './repositories/production/OperationProductOperatorRepositoryImpl';
export * from './repositories/production/OperationUnitRepositoryImpl';
export * from './repositories/production/OperationUnitOperatorRepositoryImpl';
export * from './repositories/production/OperationUnitProductRepositoryImpl';
export * from './repositories/production/ProductRepositoryImpl';
export * from './repositories/production/ProductConfigurationRepositoryImpl';
export * from './repositories/production/ProductItemRepositoryImpl';
export * from './repositories/production/ProductOperatorSkillRepositoryImpl';
export * from './repositories/production/ProductTaskRepositoryImpl';
export * from './repositories/production/ProductVariableRepositoryImpl';

// Parameter Repositories
export * from './repositories/parameter/StructureRepositoryImpl';
export * from './repositories/parameter/ParameterRepositoryImpl';
export * from './repositories/parameter/VariableRepositoryImpl';
export * from './repositories/parameter/ParameterValueRepositoryImpl';
export * from './repositories/parameter/SecretRepositoryImpl';
export * from './repositories/parameter/StructureVendorRepositoryImpl';




