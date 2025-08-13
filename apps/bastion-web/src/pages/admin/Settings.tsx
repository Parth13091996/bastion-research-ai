import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';

const Settings = () => {
  const [refundPolicy, setRefundPolicy] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [compliance, setCompliance] = useState('');

  const handleSave = () => {
    const settings = {
      refundPolicy,
      privacyPolicy,
      termsAndConditions,
      compliance,
    };
    // In a real application, you would send this to a backend API
    console.log('Saving settings:', settings);
    alert('Settings saved! (Check the console for the data)');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Refund Policy</h2>
          <ReactQuill theme="snow" value={refundPolicy} onChange={setRefundPolicy} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
          <ReactQuill theme="snow" value={privacyPolicy} onChange={setPrivacyPolicy} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Terms and Conditions</h2>
          <ReactQuill theme="snow" value={termsAndConditions} onChange={setTermsAndConditions} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Compliance</h2>
          <ReactQuill theme="snow" value={compliance} onChange={setCompliance} />
        </div>
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
};

export default Settings;
