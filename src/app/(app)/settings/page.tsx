import PageHeader from "@/components/PageHeader";
import SettingsForm from "@/components/SettingsForm";
import { getProfile } from "@/lib/queries";

export default async function SettingsPage() {
  const profile = await getProfile();

  return (
    <div>
      <PageHeader title="Settings" />
      {profile && <SettingsForm profile={profile} />}
    </div>
  );
}
