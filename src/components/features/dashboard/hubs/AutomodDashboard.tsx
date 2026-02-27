'use client';

import {
  CheckmarkCircle02Icon,
  PlusSignIcon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateRuleDialog } from './CreateRuleDialog';
import { RulesList } from './RulesList';
import { WhitelistManager } from './WhitelistManager';

interface AutomodDashboardProps {
  hubId: string;
  canEdit: boolean;
  canModerate: boolean;
}

export function AutomodDashboard({
  hubId,
  canEdit,
  canModerate,
}: AutomodDashboardProps) {
  const [activeTab, setActiveTab] = useState('rules');
  const [showCreateRule, setShowCreateRule] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border border-purple-800/30 bg-main backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-purple-500/30 bg-linear-to-br from-purple-500/20 to-indigo-500/20">
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={Shield01Icon}
                  className="h-6 w-6 text-purple-400"
                />
              </div>
              <div>
                <CardTitle className="flex items-center bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-gradient text-transparent">
                  Automod & Content FilterIcon
                </CardTitle>
                <CardDescription>
                  Manage automated moderation rules and content filtering for
                  your hub
                </CardDescription>
              </div>
            </div>
            {canEdit && (
              <Button
                onClick={() => setShowCreateRule(true)}
                className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                <HugeiconsIcon
                  strokeWidth={2}
                  icon={PlusSignIcon}
                  className="mr-2 h-4 w-4"
                />
                New Rule
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 border border-gray-800 bg-gray-900/50">
          <TabsTrigger
            value="rules"
            className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300"
          >
            <HugeiconsIcon
              strokeWidth={2}
              icon={Shield01Icon}
              className="mr-2 h-4 w-4"
            />
            FilterIcon Rules
          </TabsTrigger>
          <TabsTrigger
            value="whitelist"
            className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-300"
          >
            <HugeiconsIcon
              strokeWidth={2}
              icon={CheckmarkCircle02Icon}
              className="mr-2 h-4 w-4"
            />
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
