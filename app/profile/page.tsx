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

export default function ProfilePage() {
  return (
    <RedesignShell aside={<div className="sticky top-7"><ProfileIntro /></div>}>
      <div className="space-y-6">
        <TopNav title="我的" subtitle="偏好、收藏与阅读习惯" showBrand={false} />
        <ProfileCard />
        <QuickActions />
        <ManagementEntry />
        <PreferencePanel />
        <SettingList />
        <AdvancedToolsEntry />
      </div>
    </RedesignShell>
  );
}
