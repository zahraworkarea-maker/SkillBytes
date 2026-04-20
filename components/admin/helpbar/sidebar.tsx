'use client';

import React from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Bell,
  Settings,
  Maximize2,
  LogOut,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import { adminMenuCategories, MenuCategory, MenuItem } from '@/lib/sidebar-data';

const AdminSidebar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) => {
  const menuCategories: MenuCategory[] = adminMenuCategories;

  return (
    <div className={`flex flex-col h-screen w-80 bg-white border-r border-gray-200 fixed left-0 top-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-lg text-gray-900">Prody</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-gray-600"
            onClick={onToggle}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Menu Categories */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {menuCategories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-6">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {category.title}
            </h3>
            <div className="space-y-1">
              {category.items.map((item, itemIndex) => {
                const isLogout = item.label === 'Logout';

                return (
                  <div
                    key={itemIndex}
                    className="group relative"
                  >
                    {item.path ? (
                      <Link
                        href={item.path}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isLogout
                            ? 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant || 'default'}
                            className="ml-auto"
                          >
                            {item.badgeText || item.badge}
                          </Badge>
                        )}
                      </Link>
                    ) : (
                      <button
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          isLogout
                            ? 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant || 'default'}
                            className="ml-auto"
                          >
                            {item.badgeText || item.badge}
                          </Badge>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section - User Profile */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ember" />
            <AvatarFallback>EC</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Ember Crest</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
