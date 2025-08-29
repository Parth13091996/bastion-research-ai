import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const roles = [
  { name: 'All', count: 263 },
  { name: 'Administrator', count: 3 },
  { name: 'Subscriber', count: 3 },
  { name: 'ARMember', count: 245 },
  { name: 'Customer', count: 56 },
];

interface AdminRoleFilterProps {
  activeRole: string;
  onRoleChange: (role: string) => void;
}

const AdminRoleFilter = ({ activeRole, onRoleChange }: AdminRoleFilterProps) => {
  return (
    <div className="flex items-center space-x-1 border-b">
      {roles.map((role) => (
        <Button
          key={role.name}
          variant="ghost"
          onClick={() => onRoleChange(role.name)}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-none',
            activeRole === role.name
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          )}
        >
          {role.name} <span className="ml-1 text-xs">({role.count})</span>
        </Button>
      ))}
    </div>
  );
};

export default AdminRoleFilter;
