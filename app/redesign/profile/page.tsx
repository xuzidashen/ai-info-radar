import { TopNav } from "@/components/redesign/Navigation";
import {
  AiAssistantCard,
  ManagementEntry,
  PreferencePanel,
  ProfileCard,
  ProfileIntro,
  QuickActions,
  SettingList
} from "@/components/redesign/ProfileComponents";
import { RedesignShell } from "@/components/redesign/RedesignShell";

export default function RedesignProfilePage() {
  return (
    <RedesignShell aside={<div className="sticky top-8"><ProfileIntro /></div>}>
      <div className="space-y-6">
        <TopNav title="我的" subtitle="偏好、收藏与阅读习惯" showBrand={false} />
        <ProfileCard />
        <AiAssistantCard />
        <QuickActions />
        <ManagementEntry />
        <PreferencePanel />
        <SettingList />
      </div>
    </RedesignShell>
  );
}
