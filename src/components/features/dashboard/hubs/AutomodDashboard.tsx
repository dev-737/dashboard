'use client';

import { Shield, Plus, Settings, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RulesList } from './RulesList';
import { CreateRuleDialog } from './CreateRuleDialog';
import { WhitelistManager } from './WhitelistManager';

interface AutomodDashboardProps {
  hubId: string;
  canEdit: boolean;
  canModerate: boolean;
}

export function AutomodDashboard({ hubId, canEdit, canModerate }: AutomodDashboardProps) {
  const [activeTab, setActiveTab] = useState('rules');
  const [showCreateRule, setShowCreateRule] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-purple-800/30 bg-gradient-to-b from-gray-900/80 to-gray-950/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="flex items-center bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-gradient text-transparent">
                  Automod & Content Filter
                </CardTitle>
                <CardDescription>
                  Manage automated moderation rules and content filtering for your hub
                </CardDescription>
              </div>
            </div>
            {canEdit && (
              <Button
                onClick={() => setShowCreateRule(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Rule
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-800">
          <TabsTrigger 
            value="rules" 
            className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300"
          >
            <Shield className="mr-2 h-4 w-4" />
            Filter Rules
          </TabsTrigger>
          <TabsTrigger 
            value="whitelist"
            className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Whitelist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-6">
          <RulesList 
            hubId={hubId} 
            canEdit={canEdit} 
            canModerate={canModerate}
          />
        </TabsContent>

        <TabsContent value="whitelist" className="mt-6">
          <WhitelistManager 
            hubId={hubId} 
            canEdit={canEdit} 
            canModerate={canModerate}
          />
        </TabsContent>
      </Tabs>

      <CreateRuleDialog
        hubId={hubId}
        open={showCreateRule}
        onOpenChange={setShowCreateRule}
      />
    </div>
  );
}