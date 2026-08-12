import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../../../../shared/theme/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitleText: {
    color: Colors.foreground,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    ...Typography.h2,
    color: Colors.foreground,
    marginBottom: Spacing.lg,
  },
  formSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  formPadding: {
    padding: Spacing.md,
  },
  formInputHeading: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  customerSelectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  customerSelectorValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  gridCol: {
    flex: 1,
  },
  formFieldLabel: {
    color: Colors.muted,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginBottom: 6,
  },
  formPickerSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: Spacing.sm,
  },
  formPickerSelectorValue: {
    color: Colors.foreground,
    fontSize: Typography.sizes.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  dateField: {
    flex: 1,
  },
  requiredLabel: {
    color: Colors.destructive,
  },
  pickerPlaceholder: {
    color: Colors.mutedForeground,
    fontSize: Typography.sizes.sm,
  },
  generateButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    marginTop: Spacing.sm,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    ...Typography.button,
    color: Colors.primaryForeground,
    marginLeft: Spacing.sm,
  },
  resultsHeader: {
    ...Typography.h3,
    color: Colors.foreground,
    marginBottom: Spacing.md,
  },
  listContainer: {
    paddingBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    ...Typography.subtitle1,
    color: Colors.foreground,
  },
  cardDate: {
    ...Typography.caption,
    color: Colors.muted,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  cardLabel: {
    ...Typography.body2,
    color: Colors.muted,
  },
  cardValue: {
    ...Typography.body2,
    color: Colors.foreground,
    fontWeight: '500',
  },
  cardHighlightValue: {
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    ...Typography.body1,
    color: Colors.mutedForeground,
    marginTop: Spacing.md,
  },
  
  // Modals
  pickerOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    zIndex: 999999,
  },
  pickerContent: {
    width: '85%',
    maxWidth: 480,
    maxHeight: '70%',
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 1000000,
    elevation: 20,
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
    color: '#10b981',
  },
  
  // Date Picker specific
  datePickerCol: {
    flex: 1,
    height: 200,
  },
  datePickerItem: {
    padding: Spacing.sm,
    alignItems: 'center',
  },
  datePickerItemText: {
    color: Colors.muted,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  datePickerItemActive: {
    color: '#10b981',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    ...Typography.button,
    color: Colors.foreground,
  },
  confirmButtonText: {
    ...Typography.button,
    color: Colors.primaryForeground,
  }
});
