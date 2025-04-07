import React, {useState} from 'react';
import {
  Platform,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../../theme';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  disabled = false,
  minimumDate,
  maximumDate,
  mode = 'date',
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    setShowPicker(true);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return placeholder;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, disabled && styles.disabled]}
        onPress={handlePress}
        disabled={disabled}>
        <Text style={[styles.text, !value && styles.placeholder]}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>

      {showPicker &&
        (Platform.OS === 'ios' ? (
          <Modal
            visible={showPicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPicker(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={styles.modalButton}>
                    <Text
                      style={[
                        styles.modalButtonText,
                        styles.modalButtonTextDone,
                      ]}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={value}
                  mode={mode}
                  display="spinner"
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  style={styles.picker}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={value}
            mode={mode}
            display="default"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.grey[300],
    borderRadius: theme.roundness,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.paper,
  },
  disabled: {
    backgroundColor: theme.colors.grey[100],
    opacity: 0.8,
  },
  text: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.primary,
  },
  placeholder: {
    color: theme.colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background.paper,
    borderTopLeftRadius: theme.roundness,
    borderTopRightRadius: theme.roundness,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey[200],
  },
  modalButton: {
    padding: theme.spacing.sm,
  },
  modalButtonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
  },
  modalButtonTextDone: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});

export default DatePicker;
