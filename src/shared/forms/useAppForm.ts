import { useForm, type DefaultValues, type FieldValues } from 'react-hook-form';

interface UseAppFormOptions<TFieldValues extends FieldValues> {
  defaultValues?: DefaultValues<TFieldValues>;
}

export function useAppForm<TFieldValues extends FieldValues>(
  options?: UseAppFormOptions<TFieldValues>,
) {
  const formOptions = options ?? {};

  return useForm<TFieldValues>({
    ...(formOptions.defaultValues !== undefined
      ? { defaultValues: formOptions.defaultValues }
      : {}),
    mode: 'onBlur',
  });
}
