import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const roles = [
  'Administrator',
  'Subscriber',
  'Customer',
  'ARMember',
  'HR',
  'Shop Manager',
  'SEO Editor',
  'SEO Manager',
  'Contributor',
  'Author',
  'Editor',
  'Employer',
  'No role for this site',
];

const AdminBulkActions = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Bulk Actions
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Delete selected</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change role</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {roles.map((role) => (
              <DropdownMenuItem key={role}>{role}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminBulkActions;
