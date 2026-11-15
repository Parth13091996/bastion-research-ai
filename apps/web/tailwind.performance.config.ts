import base from './tailwind.config';
// Supplemental release styles must never override the app shell or navigation.
export default { ...base, important: '#bastion-performance', content: ['./src/pages/UserAdmin/app/ChartDashboard.tsx', './src/pages/UserAdmin/app/XirrMethodologyDialog.tsx'] };
