'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface NavAdminProps {
  onToggleSidebar: () => void;
  userName?: string;
  userAvatar?: string;
}

const NavAdmin: React.FC<NavAdminProps> = ({
  onToggleSidebar,
  userName = 'Ember Crest',
  userAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ember',
}) => {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={userAvatar} />
          <AvatarFallback>{userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium text-gray-900">{userName}</span>
      </div>
    </nav>
  );
};

export default NavAdmin;