"use client";

import { UserCircle } from "lucide-react";
import { GlassSection, SettingRow } from "../ui/glass-section";
import { useAuth } from "@/features/auth/components/auth-provider";
import { Button } from "@/components/ui/button";

export function ProfileSection() {
  const { user, profile } = useAuth();
  
  // Dummy date if not provided by Supabase easily, normally user.created_at
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric'
  }) : 'August 2026';

  const displayName = profile?.full_name || user?.email?.split('@')[0] || "Student";
  const avatarUrl = profile?.avatar_url;

  return (
    <GlassSection id="profile" title="Profile" icon={UserCircle} description="Manage your public presence and account details.">
      
      <div className="p-6 flex flex-col sm:flex-row items-center gap-6 border-b border-border/50">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-surface-hover border-2 border-glass-border flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-12 h-12 text-muted-foreground opacity-50" />
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer backdrop-blur-sm">
            <span className="text-xs font-medium text-white">Edit</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <h3 className="text-xl font-bold tracking-tight">{displayName}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
              Pro Plan
            </span>
            <span className="text-xs text-muted-foreground">Member since {createdAt}</span>
          </div>
        </div>
        
        <div className="ml-auto mt-4 sm:mt-0">
          <Button variant="outline" className="rounded-full px-6 border-glass-border bg-surface">
            Edit Profile
          </Button>
        </div>
      </div>

      <SettingRow 
        title="Username" 
        description="Your unique namespace on JEE Pro."
      >
        <span className="text-sm font-medium text-muted-foreground">@{displayName.toLowerCase().replace(/\s+/g, '')}</span>
      </SettingRow>

      <SettingRow 
        title="Email Address" 
        description="The email associated with your account."
        isLast
      >
        <span className="text-sm font-medium text-muted-foreground">{user?.email}</span>
      </SettingRow>

    </GlassSection>
  );
}
