import { supabase } from '@/lib/supabase';

export const getEmployees = async () => {
  const { data } = await supabase.from('EmployeeDirectory').select('*');
  return data;
};
