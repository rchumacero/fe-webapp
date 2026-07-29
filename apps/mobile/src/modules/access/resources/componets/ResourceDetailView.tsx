import { Text, View } from 'react-native';
import { styles } from '../styles';
import { Resource } from '@kplian/core/src/modules/access/entities/Resource';

interface ResourceDetailViewProps {
  selectedResource: Resource;
  typeOptions: any[];
  // locationOptions: any[];
  // costMethodOptions: any[];
}

const getParamLabel = (data: any[], val: string) => {
  const item = data.find(i => i.CODE === val);
  return item ? item.name : val;
};

export function ResourceDetailView({
  selectedResource: selectedResource,
  typeOptions,
}: ResourceDetailViewProps) {
  const rows: Array<[string, string]> = [
    ['Code', selectedResource.code],
    ['Name', selectedResource.name],
    ['Description', selectedResource.description],
    ['Type', getParamLabel(typeOptions, selectedResource.type || '') || 'None'],
    ['Restricted', selectedResource.restricted],
    ['Endpoind', selectedResource.endpoint],
    ['ModuleCode',selectedResource.moduleCode],
    ['Status', selectedResource.status || 'ACTIVE'],
  ];

  return (
    <View style={styles.detailCard}>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.detailRow}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}