import { useState, useCallback } from 'react';
import { FormInstance, message } from 'antd';
import { getClientIdByEmailApi } from '../api/projectApi';
import axios from 'axios';

export const useClientLookup = (form: FormInstance) => {
  const [loading, setLoading] = useState(false);
  const [foundClientId, setFoundClientId] = useState<number | null>(null);

  const fetchClientId = useCallback(async (email: string) => {
    setLoading(true);
    setFoundClientId(null);
    form.setFieldsValue({ clientId: null }); // Reset before fetching

    try {
      const clientId = await getClientIdByEmailApi(email);
      form.setFieldsValue({ clientId });
      setFoundClientId(clientId);
      message.success(`Đã tìm thấy client! ID: ${clientId}`);
      // Clear potential previous errors on the email field
      form.setFields([{ name: 'clientEmail', errors: [] }]);
    } catch (err) {
      form.setFieldsValue({ clientId: null }); // Ensure null on error
      setFoundClientId(null);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Set error directly on the form field
        form.setFields([{ name: 'clientEmail', errors: ["Không tìm thấy client với email này."] }]);
      } else {
        message.error("Lỗi khi tìm kiếm client. Vui lòng thử lại.");
        console.error("Error fetching client ID:", err);
        form.setFields([{ name: 'clientEmail', errors: ["Lỗi khi tìm kiếm client."] }]);
      }
    } finally {
      setLoading(false);
    }
  }, [form]);

  const handleEmailBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value.trim();
    // Validate using form rules first
    form.validateFields(['clientEmail']).then(() => {
        if (email) {
            fetchClientId(email);
        } else {
            // Reset if email is cleared and valid (or was valid before clearing)
            setFoundClientId(null);
            form.setFieldsValue({ clientId: null });
            // Clear potential errors if the field is now empty
             form.setFields([{ name: 'clientEmail', errors: [] }]);
        }
    }).catch(() => {
        // Validation failed (e.g., invalid format), reset client state
        setFoundClientId(null);
        form.setFieldsValue({ clientId: null });
    });
  }, [form, fetchClientId]);

  const resetClientLookup = useCallback(() => {
    setFoundClientId(null);
    setLoading(false);
    // No need to reset form fields here, component handles form reset
  }, []);


  return { loading, foundClientId, handleEmailBlur, resetClientLookup };
};