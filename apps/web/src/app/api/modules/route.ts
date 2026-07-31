import { moduleRegistry } from "@/modules/registry";
import { requireSession } from "@/server/auth/session";

export async function GET() {
  const session = await requireSession();
  return Response.json({
    data: moduleRegistry.map((registeredModule) => {
      const { icon, ...serializableModule } = registeredModule;
      void icon;
      return serializableModule;
    }),
    error: null,
    meta: { workspaceId: session.workspaceId },
  });
}
