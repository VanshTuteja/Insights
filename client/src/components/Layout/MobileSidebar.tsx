import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import Sidebar from './Sidebar';

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[88vw] max-w-[20rem] p-0 sm:max-w-sm md:hidden">
        <div className="h-full" onClick={() => onOpenChange(false)}>
          <Sidebar isCollapsed={false} onToggle={() => onOpenChange(false)} className="w-full border-r-0" />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
