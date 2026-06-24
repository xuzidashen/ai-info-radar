import { TopNav } from "@/components/redesign/Navigation";
import {
  AdvancedToolsEntry,
  ManagementEntry,
  PreferencePanel,
  ProfileCard,
  ProfileIntro,
  QuickActions,
  SettingList
} from "@/components/redesign/ProfileComponents";
import { RedesignShell } from "@/components/redesign/RedesignShell";
import { UsageReminder } from "@/components/redesign/UsageComponents";
import { getMainFlowTopics } from "@/lib/services/mainFlowService";

export default async function ProfilePage() {
  const topics = await getMainFlowTopics();

  return (
    <RedesignShell aside={<div className="sticky top-7"><ProfileIntro /></div>}>
      <div className="space-y-6">
        <TopNav title="我的" subtitle="偏好、收藏与阅读习惯" showBrand={false} />
        <ProfileCard />
        <QuickActions />
        <ManagementEntry />
        <PreferencePanel />
        <UsageReminder topics={topics} />
        <SettingList />
        <AdvancedToolsEntry />
      </div>
    </RedesignShell>
  );
}
