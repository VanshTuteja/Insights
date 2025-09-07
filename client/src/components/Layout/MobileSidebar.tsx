import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface MobileSidebarProps {
  children?: React.ReactNode;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <div onClick={() => setOpen(false)}>
          <Sidebar isCollapsed={false} onToggle={function (): void {
            throw new Error('Function not implemented.');
          } } />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;