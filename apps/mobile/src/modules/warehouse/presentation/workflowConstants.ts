export const WORKFLOW_CONSTANTS = {
  MOVEMENT_RECEIPT: {
    entity: 'movement',
    processName: 'goods_receipt',
  },
  MOVEMENT_ISSUE: {
    entity: 'movement',
    processName: 'goods_issue',
  },
  INVENTORY: {
    entity: 'inventory',
    processName: 'inventory',
  },
  WAREHOUSE: {
    entity: 'warehouse',
    processName: 'register',
  },
} as const;
