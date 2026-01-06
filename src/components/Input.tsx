import React, { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  showSearchIcon?: boolean;
  onSearch?: (value: string) => void;
  prefix?: ReactNode;
  errorMessage?: string;
}

const Input = ({ label, style, prefix, errorMessage, ...props }: InputProps) => (
  <View style={styles.inputContainer}>
    {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
    <View style={[styles.inputSpaces, { borderColor: errorMessage ? 'red' : '#f2f2f2' }]}>
      {prefix ? <View style={[styles.inputPrefix, { backgroundColor: props.editable === false ? '#c2c2c2' : '#fff' }]}>{prefix}</View> : null}
      <TextInput
        placeholderTextColor="#aaa"
        inputMode="text"
        {...props}
        style={[styles.input, style, { backgroundColor: props.editable === false ? '#c2c2c2' : '#fff' }]}
      />
    </View>
    {errorMessage ? <Text style={{ color: 'red', fontSize: 12 }}>{errorMessage}</Text> : null}
  </View>
);

export default Input;

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    gap: 6,
  },
  inputSpaces: {
    overflow: 'hidden',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'row',
    borderWidth: 1,
  },
  inputPrefix: {
    paddingHorizontal: 12,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#aaa',
  },
  inputLabel: {
    fontSize: 14,
    color: '#f2f2f2',
    fontWeight: 400,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#000',
    fontSize: 16,
  },
});
