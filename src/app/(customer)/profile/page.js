import { eq } from "drizzle-orm";
import { Mail, Phone, User as UserIcon, Gift, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getProfile(userId) {
  try {
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const session = await auth();
  const profile = session?.user ? await getProfile(session.user.id) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Profil Saya</h1>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <CardTitle>{profile?.name || session?.user?.name}</CardTitle>
            <Badge variant="secondary" className="mt-1 capitalize">
              {profile?.role || "customer"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field icon={Mail} label="Email" value={profile?.email} />
          <Field icon={Phone} label="Telepon" value={profile?.phone} />
          <Field
            icon={Gift}
            label="Poin Loyalitas"
            value={`${profile?.loyaltyPoints ?? 0} poin`}
          />
          <Field
            icon={Calendar}
            label="Bergabung"
            value={profile?.createdAt ? formatDate(profile.createdAt, false) : "-"}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
      <Icon className="h-5 w-5 text-slate-400" />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-medium text-slate-900">{value || "-"}</p>
      </div>
    </div>
  );
}
